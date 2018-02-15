#pragma once

/**************
 * 
 * !!!!!!!!!!!! HERE BE DRAGONS !!!!!!!!!!!
 * 
 * This is just pure metaprogramming and not expected to be understood
 * 
 * Checkout _miner.cpp_ for example usage
 * 
 * ***********/

#include <nan.h>
#include <functional>
#include <memory>

namespace meta
{
	template <class T> struct type {};

	using clval = const v8::Local<v8::Value>&; 

	std::string extract(type<std::string>, clval t)
	{ return *v8::String::Utf8Value(t.As<v8::String>()); }

	int extract(type<int>, clval t)
	{ return Nan::To<int>(t).FromJust(); }

	float extract(type<float>, clval t)
	{ return Nan::To<double>(t).FromJust(); }

	double extract(type<double>, clval t)
	{ return Nan::To<double>(t).FromJust(); }

	template <class T>
	struct map {};

	template <> struct map<int> 		{ using type = v8::Number; 	};
	template <> struct map<long> 		{ using type = v8::Number; 	};
	template <> struct map<float> 		{ using type = v8::Number; 	};
	template <> struct map<double> 		{ using type = v8::Number; 	};
	template <> struct map<std::string> { using type = v8::String; 	};

	template <class T>
	using clean_t = std::remove_const_t<std::remove_reference_t<T>>;

	template <class T>
	using map_t = typename map<clean_t<T>>::type;

	template <class T>
	struct mapping_traits
	{
		using new_t = clean_t<decltype(Nan::New<map_t<T>>(std::declval<T>()))>;
	};

	template <class...> struct list {};

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
		else
		{
			return New<map_t<T>>(std::forward<T>(t));
		}
	}

	template <class... Ts>
	void call(Nan::Callback* cb, Ts&&... ts)
	{
		Nan::HandleScope scope;
		v8::Local<v8::Value> argv[] = { convert(std::forward<Ts>(ts))... };
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
			m_cb = std::make_unique<ret_t>(m_fun(std::get<I>(m_args)...));
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
		std::unique_ptr<ret_t> m_cb;
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
