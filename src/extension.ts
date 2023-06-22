// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import * as cyagen from "./cyagen";

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"vscode-cyagen" is now activating!');
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-cyagen.generate", () => {
      const config = vscode.workspace.getConfiguration("vscode-cyagen");
      const templates = config.get("templates", []);
      const lsvMacroName = config.get(
        "localStaticVariableMacroName",
        "LOCAL_STATIC_VARIABLE"
      );
      const filepath = vscode.window.activeTextEditor?.document.uri.fsPath;
      if (filepath && filepath.endsWith(".c")) {
        const extensionPath = context.extensionPath;
        const fileDirname = path.join(filepath, "..");
        const quickPickItems = templates.map((command: any) => ({
          label: command.label,
          templateFolder: command.templateFolder,
          outputFolder: command.outputFolder,
        }));
        console.log(`fileDirname=${fileDirname}`);
        console.log(`extensionPath=${extensionPath}`);
        const sourceFilename = path.basename(filepath);
        const sourcename = path.basename(filepath, path.extname(filepath));
        const parser = cyagen.parse(filepath, sourcename, lsvMacroName);
        vscode.window
          .showQuickPick(quickPickItems)
          .then(async (selectedItem) => {
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
              if (
                fs.existsSync(templateFolder) &&
                fs.statSync(templateFolder).isDirectory() &&
                fs.readdirSync(templateFolder).length > 0
              ) {
                generateFiles(parser.jsonData, templateFolder, outputFolder);
                const msg = `${selectedItem.label} script for ${sourceFilename} generated!`;
                vscode.window.showInformationMessage(msg);
              } else {
                const msg = `No available template files for ${selectedItem.label}`;
                const choice = await vscode.window.showErrorMessage(
                  msg,
                  "Open Template Folder",
                  "Reveal in Explorer"
                );
                if (choice === "Open Template Folder") {
                  vscode.commands.executeCommand(
                    "vscode.openFolder",
                    vscode.Uri.file(path.dirname(templateFolder)), true
                  );
                } else if (choice === "Reveal in Explorer") {
                  vscode.commands.executeCommand(
                    "revealFileInOS",
                    vscode.Uri.file(path.dirname(templateFolder))
                  );
                }
              }
            }
          });
      } else {
        vscode.window.showInformationMessage("no c file found!");
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-cyagen.openTemplateFolder",
      async (uri) => {
        const templateFolder = `${context.extensionPath}/resources/templates`;
        const templateUri = vscode.Uri.file(templateFolder);
        const msg = `opening folder ${templateUri.fsPath}`;
        console.log(msg);
        vscode.window.showInformationMessage(msg);
        await vscode.commands.executeCommand(
          "vscode.openFolder",
          templateUri,
          true
        );
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-cyagen.revealTemplateFolder",
      async (uri) => {
        const templateFolder = `${context.extensionPath}/resources/templates`;
        const templateUri = vscode.Uri.file(templateFolder);
        const msg = `reveal folder ${templateUri.fsPath}`;
        console.log(msg);
        vscode.window.showInformationMessage(msg);
        await vscode.commands.executeCommand(
          "revealFileInOS",
          templateUri
        );
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-cyagen.openFolder", async (uri) => {
      if (uri === undefined) {
        uri = await getFolderUri();
      }
      if (uri !== undefined) {
        const msg = `opening folder ${uri.fsPath}`;
        console.log(msg);
        vscode.window.showInformationMessage(msg);
        await vscode.commands.executeCommand("vscode.openFolder", uri, true);
      } else {
        const msg = `undefined folder uri to open`;
        console.log(msg);
        vscode.window.showErrorMessage(msg);
      }
    })
  );
  // Register the "vscode-cyagen.openFolderInWSL" command
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-cyagen.openFolderInWSL",
      async (uri) => {
        if (uri === undefined) {
          uri = await getFolderUri();
        }
        if (uri !== undefined) {
          const msg = `opening folder ${uri.fsPath} in WSL`;
          console.log(msg);
          vscode.window.showInformationMessage(msg);
          const terminal = vscode.window.createTerminal({
            shellPath: "wsl.exe",
          });
          const cmdstring = `cd \$(wslpath ${uri.fsPath.replace(
            /\\/g,
            "\\\\"
          )}) && code .`;
          terminal.sendText(cmdstring);
        } else {
          const msg = `undefined folder uri to open`;
          console.log(msg);
          vscode.window.showErrorMessage(msg);
        }
      }
    )
  );
}

// This method is called when your extension is deactivated
export function deactivate() {}

async function getFolderUri(): Promise<any> {
  const options: vscode.OpenDialogOptions = {
    canSelectMany: false,
    canSelectFiles: false,
    canSelectFolders: true,
    openLabel: "Open",
  };
  const selectedUri: any = await vscode.window.showOpenDialog(options);
  if (selectedUri && selectedUri[0]) {
    return selectedUri[0];
  }
  return undefined;
}

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
          const outputFilePath = path.join(
            outputDir,
            file
              .replace("@sourcename@", jsonData.sourcename)
              .replace(/\.njk$/, "")
          );
          cyagen.generate(jsonData, filePath, outputFilePath);
        }
      });
    });
  });
}
