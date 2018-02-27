#pragma once

#include <nan.h>
#include <string>

namespace meta
{
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

	template <> struct map<int8_t>   	{ using type = v8::Number;  };
	template <> struct map<int16_t>  	{ using type = v8::Number;  };
	template <> struct map<int32_t>  	{ using type = v8::Number;  };
	template <> struct map<int64_t>  	{ using type = v8::Number;  };
	template <> struct map<uint8_t>  	{ using type = v8::Number;  };
	template <> struct map<uint16_t>  	{ using type = v8::Number;  };
	template <> struct map<uint32_t>  	{ using type = v8::Number;  };
	template <> struct map<uint64_t>  	{ using type = v8::Number;  };
	template <> struct map<float>   	{ using type = v8::Number;  };
	template <> struct map<double>   	{ using type = v8::Number;  };
	template <> struct map<bool>   		{ using type = v8::Boolean; };
	template <> struct map<std::string> { using type = v8::String;  };

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

 	template <class T, class U>
	auto convert_impl(type<T>, U&& t) -> std::decay_t<decltype(map<T>{}, std::declval<v8::Local<v8::Value>>())>
	{
		using Nan::New;
		using traits = mapping_traits<T>;
		using new_t = typename traits::new_t;
		if constexpr(std::is_same<new_t, v8::MaybeLocal<map_t<T>>>{})
		{
			return New<map_t<T>>(std::forward<U>(t)).ToLocalChecked();
		}
		else if constexpr(std::is_same<new_t, v8::Local<map_t<T>>>{})
		{
			return New<map_t<T>>(std::forward<U>(t));
		}
		else
		{
			static_assert("Should be a Local or MaybeLocal");
		}
	}

	template <class T, int N>
	using arr_t = T[N];
	template <class T, int N>
	using arr_ref_t = T(&)[N];

	template <class T, int N>
	v8::Local<v8::Value> convert_impl(type<arr_t<T, N>>, arr_ref_t<T, N>&& vec)
	{
		auto result = Nan::New<v8::Array>(N);
		int i = 0;
		for (auto& val : vec)
		{
			Nan::Set(result, i++, convert(vec[i]));
		}
		return result;
	}

	using clval = const v8::Local<v8::Value>&; 

	inline std::string extract(type<std::string>, clval t)
	{ 	
		return *v8::String::Utf8Value(Nan::To<v8::String>(t).ToLocalChecked()); 
	}

	inline int8_t extract(type<int8_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline int16_t extract(type<int16_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline int32_t extract(type<int32_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline int64_t extract(type<int64_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }

	inline uint8_t extract(type<uint8_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline uint16_t extract(type<uint16_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline uint32_t extract(type<uint32_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }
	inline uint64_t extract(type<uint64_t>, clval t)
	{ return Nan::To<int64_t>(t).FromJust(); }

	inline float extract(type<float>, clval t)
	{ return Nan::To<double>(t).FromJust(); }
	inline double extract(type<double>, clval t)
	{ return Nan::To<double>(t).FromJust(); }

	inline bool extract(type<bool>, clval t)
	{ return Nan::To<bool>(t).FromJust(); }
}