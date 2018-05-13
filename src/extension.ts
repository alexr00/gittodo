'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GithubIssueLinkProvider } from './githubIssueLinkProvider';
import { GithubIssue } from './githubIssue';
import { GithubIssueHoverProvider } from './githubIssueHoverProvider';

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {

    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('GitHub todo is active');

    let textEditor = vscode.window.activeTextEditor;
    if (textEditor !== undefined) {
        let issues: GithubIssue[] = GithubIssue.findAllIssues(textEditor.document);
    
        vscode.languages.registerDocumentLinkProvider('*', new GithubIssueLinkProvider(issues));
        vscode.languages.registerHoverProvider("*", new GithubIssueHoverProvider());
    }

    // The command has been defined in the package.json file
    // Now provide the implementation of the command with registerCommand
    // The commandId parameter must match the command field in package.json
    let disposable = vscode.commands.registerCommand('extension.findGitHubIssue', () => {
        
    });

    context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {
}