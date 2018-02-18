#include "miner.hpp"
#include "bind.hpp"
#include "md5.hpp"

template< typename I >
void print_uint(I value)
{
  static_assert(std::is_unsigned< I >::value, "!");
	std::string output;
	char lookup[] = {
		'0', '1', '2', '3', '4', '5', '6', '7', 
    '8', '9', 'A', 'B', 'C', 'D', 'E', 'F'
	};
	
	if (value)
	{
		I rev = value;
		I count = 0;
		while ((rev % 16) == 0) {
			++count;
			rev /= 16;
		}
		rev = 0;
		while (value != 0) {
			rev = (rev * 16) + (value % 16);
			value /= 16;
		}
		while (rev != 0) {
			output += lookup[(rev % 16)];
			rev /= 16;
		}
	}
   
	while (output.size() < 32)
	{
		output.insert(output.begin(), '0');
	}

	std::cout << output;
}

auto hashAsync(std::string payload_hash, int difficulty)
{
	// this block is executed in a thread
	MD5 hash;
	hash.update(payload_hash.data(), payload_hash.size());

	uint32_t nonce = 0;
	while (nonce != 0xFFFFFFFF)
	{
		auto tmp = hash;
		tmp.update(reinterpret_cast<uint8_t*>(&nonce), sizeof nonce);
		tmp.finalize();
		
		if ((tmp.get_digest() >> (128 - difficulty)) == 0)
		{
			/*std::cout << "orig: ";
			print_uint(tmp.get_digest());
			std::cout << '\n';

			std::cout << "shifted: ";
			print_uint((tmp.get_digest() >> (128 - diff)));
			std::cout << '\n';

			std::cout << "found: " << tmp.hexdigest() << '\n';*/
			break;
		}
		nonce++;
	}

	return [=](auto cb){
		// this block is executed in the node event loop
		cb(nonce);
	};
}

NAN_METHOD(MineAsync) { 
	meta::bind(hashAsync, info); 
}