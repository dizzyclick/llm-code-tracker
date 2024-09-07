import * as vscode from 'vscode';

export class StatisticsViewProvider implements vscode.WebviewViewProvider {
    public static readonly viewType = 'llm-tracker.statisticsView';

    private _view?: vscode.WebviewView;

    constructor(private readonly _extensionUri: vscode.Uri) {}

    public resolveWebviewView(
        webviewView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        _token: vscode.CancellationToken,
    ) {
        this._view = webviewView;

        webviewView.webview.options = {
            enableScripts: true,
            localResourceRoots: [this._extensionUri]
        };

        webviewView.webview.html = this._getHtmlForWebview(webviewView.webview);
    }

    private _getHtmlForWebview(webview: vscode.Webview) {
        // Implement your HTML here, including charts or tables for statistics
        return `<!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>LLM Code Usage Statistics</title>
            </head>
            <body>
                <h1>LLM Code Usage Statistics</h1>
                <div id="stats"></div>
                <script>
                    // You can add JavaScript here to update the statistics dynamically
                </script>
            </body>
            </html>`;
    }

    public updateStats(stats: any) {
        if (this._view) {
            this._view.webview.postMessage({ type: 'updateStats', stats });
        }
    }
}