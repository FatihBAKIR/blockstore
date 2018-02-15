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

auto foo(std::string x, int y) -> std::function<void(Callback*)>
{
	return [=](auto cb){
		call(cb, x + x, y * 4);
	};
}

NAN_METHOD(MineAsync) { AsyncQueueWorker(bind<std::string, int>(foo, info)); }
