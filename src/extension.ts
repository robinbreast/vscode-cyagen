// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import * as cyagen from './cyagen';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"vscode-cyagen" is now active!');

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    "vscode-cyagen.googletest",
    () => {
      // The code you place here will be executed every time your command is executed
      const filepath = vscode.window.activeTextEditor?.document.uri.fsPath;
      if (filepath && filepath.endsWith(".c")) {
        const parser = cyagen.Parser.getInstance();
        console.log(parser.parse(filepath).jsonData);
        const filename = path.basename(filepath);
        const msg = `googletest script for ${filename} generated!`;
        vscode.window.showInformationMessage(msg);
      } else {
        vscode.window.showInformationMessage('no c file found!')
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}
