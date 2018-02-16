#pragma once

#include <cstring>
#include <iostream>
#include <cstdint> 

using uint128_t = unsigned __int128;

// a small class for calculating MD5 hashes of strings or byte arrays
// it is not meant to be fast or secure
//
// usage: 1) feed it blocks of uchars with update()
//      2) finalize()
//      3) get hexdigest() string
//      or
//      MD5(std::string).hexdigest()
//
// assumes that char is 8 bit and int is 32 bit
class MD5
{
public:
  using size_type = unsigned int ; // must be 32bit
 
  MD5();
  MD5(const std::string& text);
  void update(const unsigned char *buf, size_type length);
  void update(const char *buf, size_type length);
  MD5& finalize();
  uint128_t get_digest() const;
  std::string hexdigest() const;
  friend std::ostream& operator<<(std::ostream&, MD5 md5);
 
private:
  void init();
  static constexpr auto blocksize = 64;
 
  void transform(const uint8_t block[blocksize]);
  static void decode(uint32_t output[], const uint8_t input[], size_type len);
  static void encode(uint8_t output[], const uint32_t input[], size_type len);
 
  bool finalized;
  uint8_t buffer[blocksize]; // bytes that didn't fit in last 64 byte chunk
  uint32_t count[2];   // 64bit counter for number of bits (lo, hi)
  uint32_t state[4];   // digest so far
  uint8_t digest[16]; // the result
 
  // low level logic operations
  static inline uint32_t F(uint32_t x, uint32_t y, uint32_t z);
  static inline uint32_t G(uint32_t x, uint32_t y, uint32_t z);
  static inline uint32_t H(uint32_t x, uint32_t y, uint32_t z);
  static inline uint32_t I(uint32_t x, uint32_t y, uint32_t z);
  static inline uint32_t rotate_left(uint32_t x, int n);
  static inline void FF(uint32_t &a, uint32_t b, uint32_t c, uint32_t d, uint32_t x, uint32_t s, uint32_t ac);
  static inline void GG(uint32_t &a, uint32_t b, uint32_t c, uint32_t d, uint32_t x, uint32_t s, uint32_t ac);
  static inline void HH(uint32_t &a, uint32_t b, uint32_t c, uint32_t d, uint32_t x, uint32_t s, uint32_t ac);
  static inline void II(uint32_t &a, uint32_t b, uint32_t c, uint32_t d, uint32_t x, uint32_t s, uint32_t ac);
};
 
std::string md5(const std::string str);
 