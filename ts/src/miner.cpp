#include "miner.hpp"
#include "bind.hpp"

int fibonacci(int n)
{
	if (n <= 1) return n;
	return fibonacci(n - 1) + fibonacci(n - 2);
}

auto entry_point(std::string x, int y)
{
	// this block is executed in a thread
	auto res = fibonacci(y);

	return [=](auto cb){
		// this block is executed in the node event loop
		cb(x + x, res);
	};
}

NAN_METHOD(MineAsync) { 
	AsyncQueueWorker(meta::bind(entry_point, info)); 
}