// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
const fs = require('fs');

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  // Use the console to output diagnostic information (console.log) and errors (console.error)
  // This line of code will only be executed once when your extension is activated
  console.log(
    'Congratulations, your extension "vscode-plugin-genius" is now active!'
  );

  // The command has been defined in the package.json file
  // Now provide the implementation of the command with registerCommand
  // The commandId parameter must match the command field in package.json
  let disposable = vscode.commands.registerCommand(
    'vscode-plugin-genius.watchdog',
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user
      vscode.window.showWarningMessage('Hello may!');

      let folder = vscode.workspace.workspaceFolders?.[0] || '';
      let watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(
        '**',
        false,
        false,
        false
      ); //glob search string

      watcher.onDidCreate((e) => {
        let dir = vscode.Uri.file(`${e.path}`);
        vscode.workspace.fs.stat(dir).then((stat) => {
          if (stat.type === 2) {
            let fileIndex = vscode.Uri.file(`${e.path}/index.js`);
            const templateDir = path.join(
              context.extensionPath,
              'src',
              'template'
            );
            const fileToCopyPath: string[] = [];
            const fileToCopy: string[] = [];
            travel(templateDir, (pathname: string) => {
              fileToCopyPath.push(pathname);
              fileToCopy.push(path.basename(pathname));
            });
            fileToCopyPath.forEach((value, index) => {
              let srcFile = vscode.Uri.file(value);
              let dstFile = vscode.Uri.file(`${e.path}/${fileToCopy[index]}`);
              vscode.workspace.fs.copy(srcFile, dstFile);
            });
          }
        });

        vscode.window.showInformationMessage(`create ${e.path} success!`); //In my opinion this should be called
      });
      // watcher.onDidDelete((e) => {
      //   console.log(e);
      //   vscode.window.showInformationMessage('delete applied!'); //In my opinion this should be called
      // });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}

function travel(dir: any, callback: any) {
  fs.readdirSync(dir).forEach((file: any) => {
    var pathname = path.join(dir, file);
    if (fs.statSync(pathname).isDirectory()) {
      travel(pathname, callback);
    } else {
      callback(pathname);
    }
  });
}
