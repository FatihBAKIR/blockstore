#pragma once

#include <cstdint>
#include <string>

namespace bs
{
    struct header_t
    {
        uint32_t version;
        std::string prev_hash;
        uint64_t time;
        uint8_t difficulty;
    };

    template <class PayloadT>
    struct block
    {
        const header_t header;
        const PayloadT payload;
    };
}