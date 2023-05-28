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
  console.log('"vscode-cyagen" is now activating!');
  let disposable = vscode.commands.registerCommand(
    "vscode-cyagen.generate",
    () => {
      const config = vscode.workspace.getConfiguration("vscode-cyagen");
      const customCommands = config.get("customCommands", []);
      const filepath = vscode.window.activeTextEditor?.document.uri.fsPath;
      if (filepath && filepath.endsWith(".c")) {
        const extensionPath = context.extensionPath;
        const fileDirname = path.join(filepath, "..");
        const quickPickItems = customCommands.map((command: any) => ({
          label: command.label,
          templateFolder: command.templateFolder,
          outputFolder: command.outputFolder,
        }));
        console.log(`fileDirname=${fileDirname}`);
        console.log(`extensionPath=${extensionPath}`);
        const sourceFilename = path.basename(filepath);
        const sourcename = path.basename(filepath, path.extname(filepath));
        const parser = cyagen.parse(filepath, sourcename);
        vscode.window.showQuickPick(quickPickItems).then((selectedItem) => {
          if (selectedItem) {
            console.log(parser.jsonData);
            const templateFolder = selectedItem.templateFolder
              .replace(/\$\{fileDirname\}/, fileDirname)
              .replace(/\$\{extensionPath\}/, extensionPath)
              .replace(/@sourcename@/, sourcename);
            const outputFolder = selectedItem.outputFolder
              .replace(/\$\{fileDirname\}/, fileDirname)
              .replace(/\$\{extensionPath\}/, extensionPath)
              .replace(/@sourcename@/, sourcename);
            generateFiles(parser.jsonData, templateFolder, outputFolder);
            const msg = `${selectedItem.label} script for ${sourceFilename} generated!`;
            vscode.window.showInformationMessage(msg);
          }
        });
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
        } else if (stats.isFile() && path.extname(filePath) === ".njk") {
          const outputString = cyagen.generate(jsonData, filePath);
          const outputFilePath = path.join(
            outputDir,
            file
              .replace("@sourcename@", jsonData.sourcename)
              .replace(/\.njk$/, "")
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
