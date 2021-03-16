// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as path from 'path';
import dgit from '@dking/dgit';

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
    'vscode-plugin-genius.createFolder',
    () => {
      // The code you place here will be executed every time your command is executed

      // Display a message box to the user

      let folder = vscode.workspace.workspaceFolders?.[0] || '';
      let watcher: vscode.FileSystemWatcher = vscode.workspace.createFileSystemWatcher(
        '**',
        false,
        false,
        false
      ); //glob search string

      watcher.onDidCreate((e) => {
        let dir = vscode.Uri.file(`${e.path}`);
        let relativePath = vscode.workspace.asRelativePath(dir, false);
        vscode.workspace.fs.stat(dir).then((stat) => {
          if (stat.type === 2) {
            const includePath: string[] =
              vscode.workspace.getConfiguration('genius').get('includePath') ||
              [];
            includePath.forEach((value) => {
              const regExp = `^${escapeRegExp(value)}/\\w+`;
              const res = new RegExp(regExp, 'g').test(relativePath);
              if (res) {
                const destPath = path.join(e.path.substr(1)); // 目标下载路径
                const dgitOptions = {
                  maxRetryCount: 3, // 网络问题下载失败时尝试最大重新下载次数
                  parallelLimit: 10, // 并行下载个数
                  log: false, // 是否开启内部日志
                  logSuffix: '', // 日志前缀
                  exclude: [], // 需要排除的文件路径,
                  include: [] // 需要包含的文件路径
                };
                const link: string =
                  vscode.workspace
                    .getConfiguration('genius')
                    .get('githubAddress') || '';
                const githubLinkOption = {
                  githubLink: link // 也可以直接指定github 需要下载路径的地址
                };
                (async () => {
                  await dgit(githubLinkOption, destPath, dgitOptions);
                })();
              }
            });
          }
        });
      });
    }
  );

  context.subscriptions.push(disposable);
  vscode.commands.executeCommand('vscode-plugin-genius.createFolder');
}

// this method is called when your extension is deactivated
export function deactivate() {}

function escapeRegExp(string: string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  //$&表示整个被匹配的字符串
}
