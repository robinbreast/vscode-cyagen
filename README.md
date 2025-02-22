# vscode-cyagen

`vscode-cyagen` is based on the same idea as [cyagen](https://crates.io/crates/cyagen) but realized as a vscode extension.

## Features

File generator to reduce the manual efforts to prepare another scripting files which contains C code identifiers from a given C source file. The default embedded templates are to generate [GoogleTest](https://google.github.io/googletest/) scripts.

- Scan C source file using the simple pattern matching to capture its identifiers in the code
- Generate text based files by rendering the given set of template files (`*.njk`, in `nunjucks` format).
- Supported identifiers are inclusion, local variables, and functions; refer to [cyagen](https://crates.io/crates/cyagen)
- Demo: to generate the Google Test skeleton files to test a C file which is active in editor.
  ![Demo](https://github.com/robinbreast/vscode-cyagen/blob/main/resources/images/vscode-cyagen-demo.gif?raw=true)

> Tip: The default template set for Google Test provides the full fledged cmake build scripts but this cmake project is compatible only with Unix-like system.

> Tip: you can prepare your own template set by adding an entry in `vscode-cyagen.templates`.

## Extension Settings

This extension contributes the following settings:

- `vscode-cyagen.templates`: the array of template set; every set has to have the below settings
  - `label`: the name or label for this set; to be displayed as a selection option when trying to generate. e.g., `gtest` or `cantata`; this extension doesn't include the template set for `cantata` but you can complete by referring to `gtest` ones.
  - `templateFolder`: the template folders containing template files to be used for file generation.
    - All the template files should be compatible with [nunjucks](https://mozilla.github.io/nunjucks/templating.html) format and `.njk` file extension.
    - The template folder can be recursive; you can have sub folders for further template files; the same structure of folders to be created as output.
    - `{{sourcename}}` in template file or folder name: to be replaced with source file name without file extension 
  - `outputFolder`: the output root folder where the generated files are placed.
- `vscode-cyagen.localStaticVariableMacroName`: the user defined macro name string which is used for the definition of a local static variable. e.g., LOCAL_STATIC_VARIABLE. Using this special macro, it makes test script access to local static variable. more details are found in `README.md` generated with `gtest`

## Known Issues

No known issues yet
