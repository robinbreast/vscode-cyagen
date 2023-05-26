// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as cyagen from "./cyagen";
import * as fs from "fs";
import { json } from "stream/consumers";

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
        const sourceFilename = path.basename(filepath);
        const sourcename = path.basename(filepath, path.extname(filepath));
        const parser = cyagen.parse(filepath, sourcename);
        console.log(parser.jsonData);
        generateFiles(
          parser.jsonData,
          path.join(context.extensionPath, "resources/templates/googletest"),
          // TODO: add setting for output dir
          path.join(context.extensionPath, "generated")
        );
        const msg = `googletest script for ${sourceFilename} generated!`;
        vscode.window.showInformationMessage(msg);
      } else {
        vscode.window.showInformationMessage("no c file found!");
      }
    }
  );

  context.subscriptions.push(disposable);
}

// This method is called when your extension is deactivated
export function deactivate() {}

function generateFiles(jsonData: any, tempDir: string, outputDir: string) {
  fs.readdir(tempDir, (err: any, files: any) => {
    if (err) {
      console.error(`Error reading directory: ${tempDir}`);
      return;
    }
    files.forEach((file: any) => {
      const filePath = path.join(tempDir, file);
      console.log(`Checking templete file: ${filePath}`);
      fs.stat(filePath, (err, stats) => {
        if (err) {
          console.error(`Error reading file stats: ${filePath}`);
          return;
        }
        if (stats.isDirectory()) {
          generateFiles(
            jsonData,
            filePath,
            path.join(
              outputDir,
              file.replace("@sourcename@", jsonData.sourcename)
            )
          );
        } else if (stats.isFile() && path.extname(filePath) === ".j2") {
          const outputString = cyagen.generate(jsonData, filePath);
          const outputFilePath = path.join(
            outputDir,
            file
              .replace("@sourcename@", jsonData.sourcename)
              .replace(/\.j2$/, "")
          );
          console.log(`Generating ${outputFilePath}`);

          if (!fs.existsSync(path.dirname(outputFilePath))) {
            fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
          }
          fs.writeFile(outputFilePath, outputString, (err) => {
            if (err) {
              console.error(`Error writing file: ${outputFilePath}`);
            }
          });
        }
      });
    });
  });
}
