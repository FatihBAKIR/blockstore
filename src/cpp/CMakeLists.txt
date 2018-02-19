cmake_minimum_required(VERSION 3.9)
project (bs CXX)

set(CMAKE_CXX_STANDARD 17)

add_library(bind INTERFACE)
target_include_directories(bind INTERFACE "include")

set(SOURCE_FILES  
    src/addon.cpp 
    include/bs/md5.hpp 
    src/md5.cpp 
    include/bs/miner.hpp 
    src/miner.cpp
)

add_library(bs_native SHARED ${SOURCE_FILES})
set_target_properties(bs_native PROPERTIES cxx_standard 14)
target_include_directories(bs_native PUBLIC "include")
target_link_libraries(bs_native PUBLIC bind)

set_target_properties(bs_native PROPERTIES PREFIX "" SUFFIX ".node")
target_include_directories(bs_native PUBLIC ${CMAKE_JS_INC})
target_link_libraries(bs_native ${CMAKE_JS_LIB})