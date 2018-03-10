cmake_minimum_required(VERSION 3.9)
project (bs CXX)

set(CMAKE_CXX_STANDARD 17)

add_library(bind INTERFACE)
target_include_directories(bind INTERFACE "include")