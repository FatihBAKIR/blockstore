#pragma once

/*
 * !!!!!!!!!!!! HERE BE DRAGONS !!!!!!!!!!!
 * 
 * This is just pure metaprogramming and not expected to be understood
 * 
 * Basically, we create a `Nan::AsyncWorker` implementation from a
 * given function object. It deduces the function parameter types
 * and converts v8 object to C++ object conversion and vice versa
 * automatically.
 * 
 * Usage:
 * 
 * 		auto <entry_point>(std::string x, int y)
 *		{
 *			// this block is executed in a thread
 *          // do the expensive stuff here
 *
 *			return [=](auto cb){
 *				// this block is executed in the node event loop
 *				// call the cb object with the results
 *				cb(x + x, y * y + 42);
 *			};
 *		}
 *
 * 		NAN_METHOD(<NanMethodName>) { 
 * 			meta::bind(<entry_point>, info); 
 *		}
 * 
 * This will automatically map the <NanMethodName> function 
 * asynchronously to the <entry_point> function.
 * 
 * It also uses a couple of C++17 features but could be back-
 * ported trivially.
 */

#include <nan.h>
#include <functional>
#include <memory>
#include <optional>

namespace meta
{
	/***
	 * This type is used to pass other types as parameters to functions
	 */
	template <class> struct type {};

	/***
	 * This type represents a list of types
	 */
	template <class...> struct list {};

	using clval = const v8::Local<v8::Value>&; 

	std::string extract(type<std::string>, clval t)
	{ return *v8::String::Utf8Value(t.As<v8::String>()); }

	int extract(type<int>, clval t)
	{ return Nan::To<int>(t).FromJust(); }

	float extract(type<float>, clval t)
	{ return Nan::To<double>(t).FromJust(); }

	double extract(type<double>, clval t)
	{ return Nan::To<double>(t).FromJust(); }

	bool extract(type<bool>, clval t)
	{ return Nan::To<bool>(t).FromJust(); }

	/***
	 * This struct template maps C++ types to v8 types
	 * Used when returning values to the v8 runtime
	 * 
	 * Should be specialized for each C++ type we want to
	 * support
	 * 
	 * @tparam T Type of the C++ type
	 */
	template <class T> struct map;

	template <> struct map<int> 		{ using type = v8::Number; 	};
	template <> struct map<long> 		{ using type = v8::Number; 	};
	template <> struct map<float> 		{ using type = v8::Number; 	};
	template <> struct map<double> 		{ using type = v8::Number; 	};
	template <> struct map<bool> 		{ using type = v8::Boolean;	};
	template <> struct map<std::string> { using type = v8::String; 	};

	template <class T>
	using clean_t = std::remove_const_t<std::remove_reference_t<T>>;

	template <class T>
	using map_t = typename map<clean_t<T>>::type;

	template <class T>
	struct mapping_traits
	{
		/**
		 * This is the type of the Nan::New call for the given C++ type
		 * Useful for differentiating between MaybeLocal and Local types?
		 */
		using new_t = clean_t<decltype(Nan::New<map_t<T>>(std::declval<T>()))>;
	};

	/***
	 * Converts the given C++ object into a v8 runtime local object
	 * This is used when returning to v8 from a function or through a callback
	 * See convert function for usage
	 * 
	 * @tparam Type of the C++ object
	 * @param t the C++ object
	 * @retval v8 object
	 */
	template <class T>
	v8::Local<v8::Value> convert(T&& t)
	{
		using Nan::New;
		using traits = mapping_traits<T>;
		using new_t = typename traits::new_t;
		if constexpr(std::is_same<new_t, v8::MaybeLocal<map_t<T>>>{})
		{
			return New<map_t<T>>(std::forward<T>(t)).ToLocalChecked();
		}
		else if constexpr(std::is_same<new_t, v8::Local<map_t<T>>>{})
		{
			return New<map_t<T>>(std::forward<T>(t));
		}
		else
		{
			static_assert("Should be a Local or MaybeLocal");
		}
	}

	template<class T>
	struct function_traits;

	template<class RetT, class... ArgTs> 
	struct function_traits<RetT(*)(ArgTs...)>
	{
		using ret_t = RetT;
		using arg_ts = list<clean_t<ArgTs>...>;
		static inline constexpr auto arg_len = sizeof...(ArgTs);
	};

	template<class RetT, class... ArgTs> 
	struct function_traits<RetT(&)(ArgTs...)>
	{
		using ret_t = RetT;
		using arg_ts = list<clean_t<ArgTs>...>;
		static inline constexpr auto arg_len = sizeof...(ArgTs);
	};

	template <class... Ts>
	void call(Nan::Callback* cb, Ts&&... ts)
	{
		Nan::HandleScope scope;
		// convert each C++ callback argument into a v8 local object and
		// put them in an array
		v8::Local<v8::Value> argv[] = { convert(std::forward<Ts>(ts))... };
		// call the callback with the created array
		cb->Call(sizeof...(Ts), argv);
	}

	template <class FunT, class... ArgTs>
	class MetaWorker : public Nan::AsyncWorker
	{
		using ret_t = clean_t<decltype(std::declval<FunT>()(std::declval<ArgTs>()...))>;
	public:
		MetaWorker(Nan::Callback* cb, FunT fun, std::tuple<ArgTs...> args) 
			: AsyncWorker(cb), m_fun(fun), m_args(std::move(args))
		{}

		template<size_t... I>
		void exec(std::index_sequence<I...>)
		{
			m_cb.emplace(m_fun(std::get<I>(m_args)...));
		}

		void Execute() {
			exec(std::make_index_sequence<sizeof...(ArgTs)>{});
		}

		void HandleOKCallback() {
			(*m_cb)([this](auto... args){
				call(callback, std::forward<decltype(args)>(args)...);
			});
		}
	private:
		FunT m_fun;
		std::tuple<ArgTs...> m_args;
		std::optional<ret_t> m_cb;
	};

	template<class... ArgTs, class FunT, size_t... I>
	auto bind_in(FunT&& fun, const Nan::FunctionCallbackInfo<v8::Value>& info, 
			std::index_sequence<I...>, list<ArgTs...>)
	{
		constexpr auto arg_count = sizeof...(ArgTs);
		auto arg_tuple = std::tuple<ArgTs...>{ extract(type<ArgTs>{}, info[I])... };
		auto callback = new Nan::Callback(info[arg_count].As<v8::Function>());
		auto res = new MetaWorker<FunT, ArgTs...>{callback, fun, std::move(arg_tuple)};
		AsyncQueueWorker(res);
	}

	template<class FunT>
	auto bind(FunT&& fun, const Nan::FunctionCallbackInfo<v8::Value>& info)
	{
		using traits = function_traits<FunT>;
		constexpr auto arg_count = traits::arg_len;
		return bind_in(std::forward<FunT>(fun), info, std::make_index_sequence<arg_count>{}, typename traits::arg_ts{});
	}
}
