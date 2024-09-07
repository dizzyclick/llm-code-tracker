import * as vscode from 'vscode';
import { StatisticsViewProvider } from './statisticsView';

// Interface for storing code snippets
interface CodeSnippet {
    id: string;
    content: string;
    isLLMGenerated: boolean;
    timestamp: Date;
    filePath: string;
}

// Global state to store code snippets
let codeSnippets: CodeSnippet[] = [];

function generateUniqueId(): string {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

function saveData(context: vscode.ExtensionContext) {
    context.globalState.update('llmCodeSnippets', codeSnippets);
}

function loadData(context: vscode.ExtensionContext) {
    const savedSnippets = context.globalState.get('llmCodeSnippets') as CodeSnippet[] | undefined;
    if (savedSnippets) {
        codeSnippets = savedSnippets;
    }
}

export function activate(context: vscode.ExtensionContext) {
    console.log('LLM Code Usage Tracker is now active');

	loadData(context);

    // Register a command to toggle LLM-generated code
	let toggleLLMCode = vscode.commands.registerCommand('llm-tracker.toggleLLMCode', () => {
		const editor = vscode.window.activeTextEditor;
		if (editor) {
			const selection = editor.selection;
			const text = editor.document.getText(selection);
			
			if (text) {
				const snippet: CodeSnippet = {
					id: generateUniqueId(),
					content: text,
					isLLMGenerated: true,
					timestamp: new Date(),
					filePath: editor.document.uri.fsPath
				};
				codeSnippets.push(snippet);
				vscode.window.showInformationMessage('Code marked as LLM-generated');
				
				// Highlight the LLM-generated code
				const decoration = vscode.window.createTextEditorDecorationType({
					backgroundColor: 'rgba(65, 105, 225, 0.3)' // Light blue background
				});
				editor.setDecorations(decoration, [selection]);
			}
		}
	});

	const provider = new StatisticsViewProvider(context.extensionUri);
    context.subscriptions.push(
        vscode.window.registerWebviewViewProvider(StatisticsViewProvider.viewType, provider)
    );

   	// Update the showStats command to use the new view
   	let showStats = vscode.commands.registerCommand('llm-tracker.showStats', () => {
		const totalLines = codeSnippets.reduce((acc, snippet) => acc + snippet.content.split('\n').length, 0);
		const llmLines = codeSnippets
			.filter(snippet => snippet.isLLMGenerated)
			.reduce((acc, snippet) => acc + snippet.content.split('\n').length, 0);
		
		const llmPercentage = (llmLines / totalLines * 100).toFixed(2);
		
		provider.updateStats({
			totalLines,
			llmLines,
			llmPercentage
		});
	});

    context.subscriptions.push(toggleLLMCode, showStats);
}

export function deactivate(context: vscode.ExtensionContext) {
	saveData(context);
}

