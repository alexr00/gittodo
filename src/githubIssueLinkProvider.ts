'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { GithubIssue } from './githubIssue';

export class GithubIssueLinkProvider implements vscode.DocumentLinkProvider {

    private issues: GithubIssue[];

    constructor(issues: GithubIssue[]) {
        this.issues = issues;
    }

    /**
     * Provides git hub issue links for the given document. For comments structured as:
     * 
     * // TODO: github <repository> <issue number> <optional descrptions>
     * // TODO: github alexr00/gittodo 1 this is an issue
     * 
     * A link will be created to the corresponding github issue.
     *
     * @param document The document in which the command was invoked.
     * @param token A cancellation token.
     * @return An array of [document links](#DocumentLink) or a thenable that resolves to such. The lack of a result
     * can be signaled by returning `undefined`, `null`, or an empty array.
     */
    provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink[]> {
        let links: vscode.DocumentLink[] = [];
        let hasRefreshed: boolean = false;
        for (var issueCount = 0; issueCount < this.issues.length; issueCount++) {
            let link = this.issues[issueCount].link(document);
            if (!link && !hasRefreshed) {
                this.issues = GithubIssue.findAllIssues(document);
                hasRefreshed = true;
                issueCount--;
            } else if (link) {
                links.push(link);
            }
        }
        return links;
    }
}