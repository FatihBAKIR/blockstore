/*********************************************************************
 * NAN - Native Abstractions for Node.js
 *
 * Copyright (c) 2015 NAN contributors
 *
 * MIT License <https://github.com/nodejs/nan/blob/master/LICENSE.md>
 ********************************************************************/

#include "miner.hpp"
#include "bind.hpp"

using namespace meta;

auto fibonacci(int n)
{
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}

auto foo(std::string x, int y)
{
	// this block is executed in a thread
	auto res = fibonacci(y);	
	
	return [=](auto cb){
		// this block is executed in the node event loop
		call(cb, x + x, res);
	};
}

NAN_METHOD(MineAsync) { 
	AsyncQueueWorker(bind<std::string, int>(foo, info)); 
}