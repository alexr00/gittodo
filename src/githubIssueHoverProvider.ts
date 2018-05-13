'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GithubIssue } from './githubIssue';

export class GithubIssueHoverProvider implements vscode.HoverProvider {

    /**
     * Maps the ranges of the TODO comment with the corresponding github issue.
     */

    constructor() {
    }

    /**
     * Provides hovers for github issue tile and body for the given document. For comments structured as:
     * 
     * // TODO: github <repository> <issue number> <optional descrptions>
     * // TODO: github alexr00/gittodo 1 this is an issue
     * 
     * And for comments that just contain a link
     * // https://github.com/alexr00/gittodo/issues/1
     * 
     * A hover will be created with the title and body of the github issue.
     *
     * @param document The document in which the command was invoked.
     * @param position The position at which the command was invoked.
     * @param token A cancellation token.
     * @return A hover or a thenable that resolves to such. The lack of a result can be
     * signaled by returning `undefined` or `null`.
     */
    provideHover(document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken): vscode.ProviderResult<vscode.Hover> {
        var hover: Promise<vscode.Hover> | null = null;

        let issue = GithubIssue.lineToIssue(document.lineAt(position).text, position.line);
        if (issue) {
            hover = issue.hover();
        }
        return hover;
    }
}