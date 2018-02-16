cmake_minimum_required(VERSION 3.9)

# Name of the project (will be the name of the plugin)
project (addon)

# Essential include files to build a node addon,
# you should add this line in every CMake.js based project.
include_directories(${CMAKE_JS_INC})
set(CMAKE_CXX_STANDARD 17)

set(SOURCE_FILES src/bind.hpp src/addon.cpp src/md5.hpp src/md5.cpp src/miner.hpp src/miner.cpp)

# This line will tell CMake that we're building a shared library
# from the above source files
# named after the project's name
add_library(${PROJECT_NAME} SHARED ${SOURCE_FILES})
set_target_properties(${PROJECT_NAME} PROPERTIES cxx_standard 14)

# This line will give our library file a .node extension without any "lib" prefix
set_target_properties(${PROJECT_NAME} PROPERTIES PREFIX "" SUFFIX ".node")

# Essential library files to link to a node addon,
# you should add this line in every CMake.js based project.
target_link_libraries(${PROJECT_NAME} ${CMAKE_JS_LIB})
