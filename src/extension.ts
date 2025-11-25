// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { promises as fsPromises } from "fs";
import * as cyagen from "./cyagen";
import { getSourceDirname, renderString } from "./utils";

/**
 * Template configuration entry from user settings
 */
interface TemplateConfig {
  label: string;
  templateFolder: string;
  outputFolder: string;
}

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log('"vscode-cyagen" is now activating!');
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-cyagen.generate", () => {
      const config = vscode.workspace.getConfiguration("vscode-cyagen");
      const templates: TemplateConfig[] = config.get("templates", []);
      const lsvMacroName = config.get(
        "localStaticVariableMacroName",
        "LOCAL_STATIC_VARIABLE"
      );
      const filepath = vscode.window.activeTextEditor?.document.uri.fsPath;
      if (filepath) {
        const extensionPath = context.extensionPath;
        const fileDirname = path.join(filepath, "..");
        const quickPickItems = templates.map((command) => ({
          label: command.label,
          templateFolder: command.templateFolder,
          outputFolder: command.outputFolder,
        }));
        console.log(`fileDirname=${fileDirname}`);
        console.log(`extensionPath=${extensionPath}`);
        const sourceFilename = path.basename(filepath);
        const sourcename = path.basename(filepath, path.extname(filepath));
        const sourcedirname = getSourceDirname(fileDirname, filepath);
        let jsonData: any = {
          sourceFilePath: filepath,
          sourceFileName: sourceFilename,
          sourcename: sourcename,
          sourcedirname: sourcedirname,
        };
        if (filepath.endsWith(".c")) {
          const parser = cyagen.parse(filepath, sourcename, lsvMacroName);
          jsonData = parser.jsonData;
        }
        vscode.window
          .showQuickPick(quickPickItems)
          .then(async (selectedItem) => {
            if (selectedItem) {
              console.log(jsonData);
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
                const renderedOutputFolder = renderString(outputFolder, jsonData);
                const sutLinkPath = path.join(renderedOutputFolder, "sut", sourceFilename);
                try {
                  if (!fs.existsSync(path.dirname(sutLinkPath))) {
                    fs.mkdirSync(path.dirname(sutLinkPath), { recursive: true });
                  }
                  // Remove existing symlink if it exists
                  if (fs.existsSync(sutLinkPath)) {
                    fs.unlinkSync(sutLinkPath);
                  }
                  fs.symlinkSync(filepath, sutLinkPath, "file");
                } catch (error) {
                  const msg = `Failed to create symlink: ${error instanceof Error ? error.message : String(error)}`;
                  console.error(msg);
                  vscode.window.showErrorMessage(msg);
                  return;
                }
                await generateFiles(jsonData, templateFolder, renderedOutputFolder);
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
                    vscode.Uri.file(path.dirname(templateFolder)),
                    true
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
        vscode.window.showInformationMessage("No supported file found!");
      }
    })
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "vscode-cyagen.openTargetSource",
      async () => {
        let targetSource = undefined;
        const config = vscode.workspace.getConfiguration("vscode-cyagen");
        const configTargetSource = config.get("currentTargetSource", undefined);
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (
          workspaceFolders !== undefined &&
          configTargetSource !== undefined
        ) {
          targetSource = vscode.Uri.joinPath(
            workspaceFolders[0].uri,
            configTargetSource
          );
        }
        if (targetSource === undefined) {
          const options: vscode.OpenDialogOptions = {
            canSelectMany: false,
            canSelectFiles: true,
            canSelectFolders: false,
            openLabel: "Open",
          };
          const selectedUri: any = await vscode.window.showOpenDialog(options);
          if (selectedUri && selectedUri[0]) {
            targetSource = selectedUri[0];
          }
        }
        console.log(`[cyagen] targetSource = ${targetSource}`);
        if (targetSource !== undefined) {
          vscode.workspace.openTextDocument(targetSource).then((document) => {
            vscode.window.showTextDocument(document);
          });
        } else {
          const msg = `undefined file uri to open`;
          console.log(msg);
          vscode.window.showErrorMessage(msg);
        }
      }
    )
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
      async () => {
        const templateFolder = `${context.extensionPath}/resources/templates`;
        const templateUri = vscode.Uri.file(templateFolder);
        const msg = `reveal folder ${templateUri.fsPath}`;
        console.log(msg);
        vscode.window.showInformationMessage(msg);
        await vscode.commands.executeCommand("revealFileInOS", templateUri);
      }
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand("vscode-cyagen.openFolder", async (uri) => {
      uri = await getFolderUri(uri);
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
        uri = await getFolderUri(uri);
        if (uri !== undefined) {
          const msg = `opening folder ${uri.fsPath} in WSL`;
          console.log(msg);
          vscode.window.showInformationMessage(msg);
          const terminal = vscode.window.createTerminal({
            shellPath: "wsl.exe",
          });
          const cmdstring = `code \$(wslpath ${uri.fsPath.replace(
            /\\/g,
            "\\\\"
          )})`;
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

async function getFolderUri(
  uri: vscode.Uri | undefined
): Promise<vscode.Uri | undefined> {
  let result = uri;
  if (uri === undefined) {
    const options: vscode.OpenDialogOptions = {
      canSelectMany: false,
      canSelectFiles: false,
      canSelectFolders: true,
      openLabel: "Open",
    };
    const selectedUri: any = await vscode.window.showOpenDialog(options);
    if (selectedUri && selectedUri[0]) {
      result = selectedUri[0];
    }
  }
  if (uri !== undefined) {
    const files = fs.readdirSync(uri.fsPath);
    const workspaceFiles = files.filter(
      (file) => path.extname(file) === ".code-workspace"
    );

    if (workspaceFiles.length > 0) {
      const workspaceFilePath = path.join(uri.fsPath, workspaceFiles[0]);
      result = vscode.Uri.file(workspaceFilePath);
    }
  }
  return result;
}

async function generateFiles(jsonData: any, tempDir: string, outputDir: string): Promise<void> {
  try {
    const files = await fsPromises.readdir(tempDir);
    for (const file of files) {
      const filePath = path.join(tempDir, file);
      console.log(`Checking template file: ${filePath}`);
      try {
        const stats = await fsPromises.stat(filePath);
        const renderedFileName = renderString(file, jsonData);
        const outputFilePath = path.join(outputDir, renderedFileName);
        if (stats.isDirectory()) {
          await generateFiles(jsonData, filePath, outputFilePath);
        } else if (stats.isFile()) {
          if (!fs.existsSync(outputDir)) {
            await fsPromises.mkdir(outputDir, { recursive: true });
          }
          const templateExtRegex = /\.(njk|j2)$/;
          if (templateExtRegex.test(filePath)) {
            cyagen.generate(jsonData, filePath, outputFilePath.replace(templateExtRegex, ""));
          } else {
            await fsPromises.copyFile(filePath, outputFilePath);
          }
        }
      } catch (error) {
        const msg = `Error processing file ${filePath}: ${error instanceof Error ? error.message : String(error)}`;
        console.error(msg);
        vscode.window.showWarningMessage(msg);
      }
    }
  } catch (error) {
    const msg = `Error reading template directory ${tempDir}: ${error instanceof Error ? error.message : String(error)}`;
    console.error(msg);
    vscode.window.showErrorMessage(msg);
  }
}
