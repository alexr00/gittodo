'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export class GithubIssue {
    /** 
     * Start position in document
     */
    public readonly startPosition: vscode.Position;

    /**
     * End position in document
     */
    public readonly endPosition: vscode.Position;

    /**
     * Repository owner
     */
    public readonly owner: string;

    /**
     * Repository name
     */
    public readonly repository: string;

    /**
     * Issue number
     */
    public readonly issueNumber: string;

    constructor(startPosition: vscode.Position, endPosition: vscode.Position, owner: string, repository: string, issueNumber: string) {
        this.startPosition = new vscode.Position(startPosition.line + 1, startPosition.character);
        this.endPosition = new vscode.Position(endPosition.line + 1, endPosition.character);
        this.owner = owner;
        this.repository = repository;
        this.issueNumber = issueNumber;
    }

    public link() : vscode.DocumentLink {
        let target = "https://github.com/" + this.owner + "/" + this.repository + "/issues/" + this.issueNumber;
        let targetUri:vscode.Uri = vscode.Uri.parse(target);
        // document line positions are 0 based, but document link based positions are 1 based
        let linkRange: vscode.Range = new vscode.Range(this.startPosition, this.endPosition);
        return new vscode.DocumentLink(linkRange, targetUri);
    }

    public hover() : vscode.Hover {
        return new vscode.Hover("temp", new vscode.Range(this.startPosition, this.endPosition));
    }

    public static findNextIssue(document: vscode.TextDocument, searchStartPosition: vscode.Position) : GithubIssue | null {
        let searchValue = 'TODO: github';
        let position = document.getText().indexOf(searchValue, document.offsetAt(searchStartPosition));
        if (position !== -1) {
            let startPosition = document.positionAt(position);
            let line = document.lineAt(startPosition.line + 1);
            let lineText = line.text.substr(line.text.indexOf('TODO'), line.text.length);
            let stringTokens = lineText.split(" ", 4);
            if(stringTokens.length === 4) {
                let endPosition = new vscode.Position(startPosition.line, 
                    line.text.indexOf(stringTokens[3], line.text.indexOf(searchValue)) + stringTokens[3].length);
                let ownerAndRepo = stringTokens[2].split("/", 2);
                if (ownerAndRepo.length === 2) {
                    return new GithubIssue(startPosition, endPosition, ownerAndRepo[0], ownerAndRepo[1], stringTokens[3]);
                }
            }
        }
        return null;
    }
}