# vscode-cyagen

`vscode-cyagen` brings [cyagen](https://crates.io/crates/cyagen)-style generation to VS Code.
It parses C source files, builds structured data (functions, includes, static vars, call graph), and renders output from template folders.

## Quick start

1. Open a C source file in VS Code.
2. Run `Cyagen: Generate files using templates`.
3. Choose a configured template set.
4. Open generated output in your target folder.

Demo:
![Demo](https://github.com/robinbreast/vscode-cyagen/blob/main/resources/images/vscode-cyagen-demo.gif?raw=true)

## Documentation

- Primary documentation map: [docs/INDEX.md](docs/INDEX.md)
- Contribution workflow: [CONTRIBUTING.md](CONTRIBUTING.md)

## Known issues

- Bundled GoogleTest CMake examples are designed for Unix-like environments.
