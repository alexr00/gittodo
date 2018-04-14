'use strict';
// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

export class GithubTodoLinkProvider implements vscode.DocumentLinkProvider{
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
		provideDocumentLinks(document: vscode.TextDocument, token: vscode.CancellationToken): vscode.ProviderResult <vscode.DocumentLink[]> {
            let links:vscode.DocumentLink[] = [];
            let searchValue = 'TODO: github';
            let position = document.getText().indexOf(searchValue);
            while (position !== -1) {
                let startPosition = document.positionAt(position);
                let line = document.lineAt(startPosition.line + 1);
                let lineText = line.text.substr(line.text.indexOf('TODO'), line.text.length);
                let stringTokens = lineText.split(" ", 4);
                if(stringTokens.length === 4) {
                    let target = "https://github.com/" + stringTokens[2] + "/issues/" + stringTokens[3];
                    let targetUri:vscode.Uri = vscode.Uri.parse(target);
                    // document line positions are 0 based, but document link based positions are 1 based
                    startPosition = new vscode.Position(startPosition.line + 1, startPosition.character);
                    let endPosition = new vscode.Position(startPosition.line, 
                        line.text.indexOf(stringTokens[3], line.text.indexOf(searchValue)) + stringTokens[3].length);
                    let linkRange: vscode.Range = new vscode.Range(startPosition, endPosition);
                    let documentLink = new vscode.DocumentLink(linkRange, targetUri);
                    links.push(documentLink);
                }
                position = document.getText().indexOf(searchValue, position + 1);
            }
            return links;
        }

		/**
		 * Given a link fill in its [target](#DocumentLink.target). This method is called when an incomplete
		 * link is selected in the UI. Providers can implement this method and return incomplete links
		 * (without target) from the [`provideDocumentLinks`](#DocumentLinkProvider.provideDocumentLinks) method which
		 * often helps to improve performance.
		 *
		 * @param link The link that is to be resolved.
		 * @param token A cancellation token.
		 */
		resolveDocumentLink?(link: vscode.DocumentLink, token: vscode.CancellationToken): vscode.ProviderResult<vscode.DocumentLink> {
            return null;
        }
}