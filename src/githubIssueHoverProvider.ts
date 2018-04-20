'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GithubIssue } from './githubIssue';

export class GithubIssueHoverProvider implements vscode.HoverProvider {

    /**
     * Maps the ranges of the TODO comment with the corresponding github issue.
     */
    private issueMap: Map<vscode.Range, GithubIssue>;

    constructor(issues: GithubIssue[]) {
        this.issueMap = new Map<vscode.Range, GithubIssue>();
        for(var issueCount = 0; issueCount < issues.length; issueCount++) {
            this.issueMap.set(new vscode.Range(issues[issueCount].startPosition, issues[issueCount].endPosition), issues[issueCount]);
        }
    }

    /**
     * Provides hovers for github issue tile and body for the given document. For comments structured as:
     * 
     * // TODO: github <repository> <issue number> <optional descrptions>
     * // TODO: github alexr00/gittodo 1 this is an issue
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

        this.issueMap.forEach((value: GithubIssue, key: vscode.Range, map: Map<vscode.Range, GithubIssue>) => {
            if(key.contains(position)) {
                hover = value.hover();
            }
        });

        return hover;
    }
}