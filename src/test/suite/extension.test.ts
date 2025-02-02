import * as assert from 'assert';
import * as vscode from 'vscode';
// import * as myExtension from '../../extension';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

	test('Sample test', () => {
		assert.strictEqual(-1, [1, 2, 3].indexOf(5));
		assert.strictEqual(-1, [1, 2, 3].indexOf(0));
	});

	test('Extension activation test', async () => {
		const extension = vscode.extensions.getExtension('robinbreast.vscode-cyagen');
		if (!extension) {
			assert.fail('Extension not found');
		}

		// Trigger activation event by opening a C file
		const document = await vscode.workspace.openTextDocument({ language: 'c', content: 'int main() {}' });
		await vscode.window.showTextDocument(document);

		await extension.activate();
		assert.ok(extension.isActive, 'Extension is not active');
	});

	test('Command registration test', async () => {
		const extension = vscode.extensions.getExtension('robinbreast.vscode-cyagen');
		if (!extension) {
			assert.fail('Extension not found');
		}
		await extension.activate();
		const commands = await vscode.commands.getCommands(true);
		assert.ok(commands.includes('vscode-cyagen.generate'), 'Command "vscode-cyagen.generate" is not registered');
		assert.ok(commands.includes('vscode-cyagen.openTargetSource'), 'Command "vscode-cyagen.openTargetSource" is not registered');
		assert.ok(commands.includes('vscode-cyagen.openTemplateFolder'), 'Command "vscode-cyagen.openTemplateFolder" is not registered');
		assert.ok(commands.includes('vscode-cyagen.revealTemplateFolder'), 'Command "vscode-cyagen.revealTemplateFolder" is not registered');
		assert.ok(commands.includes('vscode-cyagen.openFolder'), 'Command "vscode-cyagen.openFolder" is not registered');
		assert.ok(commands.includes('vscode-cyagen.openFolderInWSL'), 'Command "vscode-cyagen.openFolderInWSL" is not registered');
	});

	test('Configuration test', async () => {
		const config = vscode.workspace.getConfiguration('vscode-cyagen');
		const templates = config.get('templates', []);
		const lsvMacroName = config.get('localStaticVariableMacroName', 'LOCAL_STATIC_VARIABLE');
		assert.ok(Array.isArray(templates), 'Templates configuration is not an array');
		assert.strictEqual(typeof lsvMacroName, 'string', 'localStaticVariableMacroName is not a string');
	});
});
