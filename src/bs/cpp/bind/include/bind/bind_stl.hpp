#pragma once

#include <nan.h>
#include <array>
#include <vector>
#include <list>

namespace meta
{
	template <class T>
	struct is_container;

	template <class T, class U>
	struct is_container<std::vector<T, U>> {};

	template <class T, class U>
	struct is_container<std::list<T, U>> {};

	template <class T, size_t N>
	struct is_container<std::array<T, N>> {};

	template <class T, class U>
	auto convert_impl(type<T>, U&& vec) 
		-> std::decay_t<decltype(is_container<T>{}, std::declval<v8::Local<v8::Value>>())>
	{
		auto result = Nan::New<v8::Array>(size(vec));
		int i = 0;
		for (auto& val : vec)
		{
			Nan::Set(result, i++, convert(val));
		}
		return result;
	}
}
