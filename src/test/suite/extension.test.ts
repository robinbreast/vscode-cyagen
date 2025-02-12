import * as assert from 'assert';
import * as vscode from 'vscode';
import * as path from 'path';
import * as fs from 'fs';
import * as cyagen from '../../cyagen';
import { renderString } from '../../utils';

suite('Extension Test Suite', () => {
	vscode.window.showInformationMessage('Start all tests.');

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

	test('Generate command test', async () => {
		const extension = vscode.extensions.getExtension('robinbreast.vscode-cyagen');
		if (!extension) {
			assert.fail('Extension not found');
		}
		await extension.activate();

		const config = vscode.workspace.getConfiguration('vscode-cyagen');
		const templates = config.get('templates', []);
		const lsvMacroName = config.get('localStaticVariableMacroName', 'LOCAL_STATIC_VARIABLE');
		const filepath = vscode.window.activeTextEditor?.document.uri.fsPath;

		if (filepath) {
			const sourceFilename = path.basename(filepath);
			const sourcename = path.basename(filepath, path.extname(filepath));
			const jsonData = { sourcename, sourcedirname: 'source' };

			if (filepath.endsWith('.c')) {
				const parser = cyagen.parse(filepath, sourcename, lsvMacroName);
				Object.assign(jsonData, parser.jsonData);
			}

			if (templates.length === 0) {
				assert.fail('Templates array is empty');
			}
			const selectedItem = templates[0] as { templateFolder: string, outputFolder: string }; // Assuming the first template is selected
			const templateFolder = renderString(selectedItem.templateFolder, jsonData);
			const outputFolder = renderString(selectedItem.outputFolder, jsonData);

			assert.ok(fs.existsSync(templateFolder), 'Template folder does not exist');
			assert.ok(fs.statSync(templateFolder).isDirectory(), 'Template folder is not a directory');
			assert.ok(fs.readdirSync(templateFolder).length > 0, 'Template folder is empty');

			// Simulate file generation
			cyagen.generate(jsonData, path.join(templateFolder, 'template.tpl'), path.join(outputFolder, 'output.c'));
			assert.ok(fs.existsSync(path.join(outputFolder, 'output.c')), 'Output file was not generated');
		}
	});
});
