'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
const octokit = require('@octokit/rest')({
    debug: false
});

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

    private line: string;

    constructor(startPosition: vscode.Position, endPosition: vscode.Position, owner: string, repository: string, issueNumber: string, line: string) {
        this.startPosition = new vscode.Position(startPosition.line, startPosition.character);
        this.endPosition = new vscode.Position(endPosition.line, endPosition.character);
        this.owner = owner;
        this.repository = repository;
        this.issueNumber = issueNumber;
        this.line = line;
    }

    public link(document: vscode.TextDocument): vscode.DocumentLink | null {
        if (!this.isRangeStillGood(document, this.startPosition, this.endPosition)) {
            return null;
        }

        let target = "https://github.com/" + this.owner + "/" + this.repository + "/issues/" + this.issueNumber;
        let targetUri: vscode.Uri = vscode.Uri.parse(target);
        let linkRange: vscode.Range = new vscode.Range(this.startPosition, this.endPosition);
        return new vscode.DocumentLink(linkRange, targetUri);
    }

    public hover(): Promise<vscode.Hover> | null {
        return octokit.issues.get({
            owner: this.owner,
            repo: this.repository,
            number: +this.issueNumber
        }).then((data: any) => {
            let statusString: string = data.data.state;
            statusString = statusString.toUpperCase();
            let description = statusString + " - " + data.data.title + ": " + data.data.body;
            return new vscode.Hover(description, new vscode.Range(this.startPosition, this.endPosition));
        });
    }

    private isRangeStillGood(document: vscode.TextDocument, startPosition: vscode.Position, endPosition: vscode.Position): boolean {
        let newLine: string = document.lineAt(startPosition.line).text;
        return (newLine === this.line);
    }

    public static findAllIssues(document: vscode.TextDocument): GithubIssue[] {
        let issues: GithubIssue[] = [];
        let position = new vscode.Position(0, 0);
        let issue = GithubIssue.findNextIssue(document, position);
        while (issue !== null) {
            issues.push(issue);
            position = issue.endPosition;
            issue = GithubIssue.findNextIssue(document, position);
        }
        return issues;
    }

    private static findNextIssue(document: vscode.TextDocument, searchStartPosition: vscode.Position): GithubIssue | null {
        let searchValue = 'TODO: github';
        let positionNumber = document.getText().indexOf(searchValue, document.offsetAt(searchStartPosition));
        let position = document.positionAt(positionNumber);
        while (positionNumber !== -1) {
            let line: string = document.lineAt(position.line).text;
            let issue = this.lineToIssue(line, position.line);
            if (issue) {
                return issue;
            }
            let lineNo: number = position.line + 1;
            position = new vscode.Position(lineNo, position.character);
            positionNumber = document.getText().indexOf(searchValue, document.offsetAt(position));
        }
        return null;
    }

    public static lineToIssue(line: string, lineNumber: number): GithubIssue | null {
        let searchValue = 'TODO: github';
        let positionNumber = line.indexOf(searchValue);
        if (positionNumber !== -1) {
            let position = new vscode.Position(lineNumber, positionNumber);
            let lineText = line.substr(line.indexOf('TODO'), line.length);
            let stringTokens = lineText.split(" ", 4);
            if (stringTokens.length === 4) {
                let endPosition = new vscode.Position(position.line,
                    line.indexOf(stringTokens[3], line.indexOf(searchValue)) + stringTokens[3].length);
                let ownerAndRepo = stringTokens[2].split("/", 2);
                if (ownerAndRepo.length === 2) {
                    return new GithubIssue(position, endPosition, ownerAndRepo[0], ownerAndRepo[1], stringTokens[3], line);
                }
            }
        } else {
            searchValue = 'https*://github\.com';
            let match = line.match(searchValue);
            if (match) {
                let position = new vscode.Position(lineNumber, line.indexOf(match[0]));
                let lineText = line.substr(line.indexOf(match[0]), line.length);
                let stringTokens = lineText.split("/", 7);
                if (stringTokens.length === 7) {
                    let endPosition = new vscode.Position(position.line,
                        line.indexOf("issues/" + stringTokens[6]) + stringTokens[6].length + 7);
                    return new GithubIssue(position, endPosition, stringTokens[3], stringTokens[4], stringTokens[6], line);
                }
            }
        }
        return null;
    }
}