# gtest.basic Template

## Environment Setup

To build and launch debug for this project, you need to have the following tools installed:

1. **g++**: The GNU C++ compiler.
2. **lcov**: A graphical front-end for GCC's coverage testing tool gcov.
3. **gdb**: The GNU Project Debugger.

### Installing g++

On Ubuntu:
```sh
sudo apt-get update
sudo apt-get install g++
```

On macOS using Homebrew:
```sh
brew install gcc
```

### Installing lcov

On Ubuntu:
```sh
sudo apt-get install lcov
```

On macOS using Homebrew:
```sh
brew install lcov
```

### Installing gdb

On Ubuntu:
```sh
sudo apt-get install gdb
```

On macOS using Homebrew:
```sh
brew install gdb
```

### Building the Project

To build the project, run:
```sh
mkdir build
cd build
cmake ..
make
```

### Running Tests with Coverage

To run tests and generate a coverage report:
```sh
cd build
```
```sh
ctest
```
```sh
make test_coverage
```

### Using VSCode for Building and Debugging

1. Open the project folder in VSCode
2. Use the provided tasks and launch configurations:
   - To build the project, press `Ctrl+Shift+B` (or `F7`) and select `Build Google Test`.
   - To debug the project, press `F5` and select `Debug Google Test`.
