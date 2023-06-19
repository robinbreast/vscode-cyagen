# vscode-cyagen README

vscode-cyagen is based on the same idea as [cyagen](https://crates.io/crates/cyagen) but realizedd as a vscode extension.

## Features

File generator to reduce the manual efforts to prepare another scripting files which contains C code information derived by a C source file.
- Scan C source file using the simple pattern matching to capture the identifiers in the code
- Generate text based files using the given template files
- Supported identifiers are inclusion, local variables, and functions

![Demo](https://github.com/robinbreast/vscode-cyagen/blob/main/resources/images/vscode-cyagen-demo.gif)

For example if there is an image subfolder under your extension project workspace:

\!\[feature X\]\(images/feature-x.png\)

> Tip: Many popular extensions utilize animations. This is an excellent way to show off your extension! We recommend short, focused animations that are easy to follow.

## Requirements

If you have any requirements or dependencies, add a section describing those and how to install and configure them.

## Extension Settings

Include if your extension adds any VS Code settings through the `contributes.configuration` extension point.

For example:

This extension contributes the following settings:

* `vscode-cyagen.enable`: Enable/disable this extension.
* `vscode-cyagen.thing`: Set to `blah` to do something.

## Known Issues

Calling out known issues can help limit users opening duplicate issues against your extension.

## Release Notes

Users appreciate release notes as you update your extension.

### 1.0.0

Initial release of ...

### 1.0.1

Fixed issue #.

### 1.1.0

Added features X, Y, and Z.

---

## Following extension guidelines

Ensure that you've read through the extensions guidelines and follow the best practices for creating your extension.

* [Extension Guidelines](https://code.visualstudio.com/api/references/extension-guidelines)

## Working with Markdown

You can author your README using Visual Studio Code. Here are some useful editor keyboard shortcuts:

* Split the editor (`Cmd+\` on macOS or `Ctrl+\` on Windows and Linux).
* Toggle preview (`Shift+Cmd+V` on macOS or `Shift+Ctrl+V` on Windows and Linux).
* Press `Ctrl+Space` (Windows, Linux, macOS) to see a list of Markdown snippets.

## For more information

* [repository](https://github.com/robinbreast/vscode-cyagen)

**Enjoy!**
