# Blockstore

>A distributed key-value storage system built on top of *blockchain technology*™

### About

The system is built on nodejs using TypeScript. The lower-level elements of the code such as the blockchain functions are implemented in C++17, thus we use packages that allow for an interface between the node event loop and executing C++ functions.

### Getting Started (Linux/Ubuntu)

1. Clone the repo
```
git clone git@github.com:FatihBAKIR/blockchain.git
```

2. Install the node packages in src/{cpp,ts}
```
cd src/cpp
npm install
cd src/ts
npm install
```

3. If not already installed, install cmake-js. *NOTE: This will install it globally*
```
sudo npm install -g cmake-js
```

4. If not already installed, install cmake version 3.9 or greater. *NOTE: If your Linux version is a LTS version, the apt package may be too old. In this case, you'll need to download the latest stable version of cmake and build it from source*
```
# Non-LTS Linux version
sudo apt-get install cmake

# LTS Linux version
# If you accidentaly installed the apt package of cmake but ended up needing to build it from source, remove the package
sudo apt remove cmake
# Download the latest stable release (https://cmake.org/download/), unpack the file, and cd into it
./configure
make -j8
sudo make install
```

5. Cmake will need a compiler supporting C++17 features. Check your `gcc` version, and if it isn't 7+, search for a package supporting `gcc-7`. If no results are found, Use a ppa to build it from source
```
# Check your gcc version
gcc --version

# If it isn't 7+, search to see if an apt package is available
apt search gcc-7

# If no package was avaialble, use this PPA to discover and install 7+
sudo add-apt-repository ppa:ubuntu-toolchain-r/test -y
sudo apt-get update
apt search gcc-7
sudo apt install g++-7 -y
export CXX=g++-7
export CC=gcc-7
```

6. Compile the C++ code. *NOTE: If you previously attempted to build it (and failed), you'll need to remove your build/ directory*
```
rm -rf build/
cmake-js build
```

7. Install TypeScript. *NOTE: This will install it globally*
```
sudo npm install -g typescript
```

8. Compile the TypeScript code to JavaScript
```
tsc
```

9. Use node to start the test-webserver (Http) and run calls against is (index)
```
node build/Http.js
node build/index.js
```