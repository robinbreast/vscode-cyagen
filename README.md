# vscode-cyagen

vscode-cyagen is based on the same idea as [cyagen](https://crates.io/crates/cyagen) but realized as a vscode extension.

## Features

File generator to reduce the manual efforts to prepare another scripting files which contains C code identifiers from a given C source file.
- Scan C source file using the simple pattern matching to capture the identifiers in the code
- Generate text based files using the given template files
- Supported identifiers are inclusion, local variables, and functions; refer to [cyagen](https://crates.io/crates/cyagen)
- Demo: generate the Google Test skeleton files to test an open C file
![Demo](https://github.com/robinbreast/vscode-cyagen/blob/main/resources/images/vscode-cyagen-demo.gif?raw=true)

> Tip: The default template for Google Test provides the full fledged cmake build scripts as well but this cmake project is compatible only with Unix-like system.

> Tip: you can prepare your own set of template files by adding additional set into `vscode-cyagen.templates` in Settings

## Extension Settings

This extension contributes the following settings:

* `vscode-cyagen.templates`: array of template set; every set has to have the below settings
	* `label`: the name or label for this set; to be displayed as a selection option when trying to generate. e.g., `gtest` or `cantata`; this extension doesn't include the set of template files for `cantata` but you can complete by referring to `gtest` ones.
	* `templateFolder`: template folders containing template files to be used for file generation. the template should be compatible with `nunjucks` format.
	* `outputFolder`: output folder where all the generated files are placed.
* `vscode-cyagen.localStaticVariableMacroName`: user defined macro name string which is used for the definition of a local static variable. e.g., LOCAL_STATIC_VARIABLE. Using this special macro, it makes test script access to local static variable. more details are found in `README.md` generated with `gtest`

## Known Issues

No known issues yet

## Release Notes

### 0.1.0

Initial release
