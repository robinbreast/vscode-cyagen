import * as assert from 'assert';
import { parse, generate } from '../../cyagen';
import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';

suite('Cyagen Test Suite', () => {
	let tempDir = '';
	let sourceFilePath = '';
	let templatePath = '';
	let outputFilePath = '';

	suiteSetup(() => {
		tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'vscode-cyagen-'));
		sourceFilePath = path.join(tempDir, 'source.c');
		templatePath = path.join(tempDir, 'template.tpl');
		outputFilePath = path.join(tempDir, 'generated', 'output.c');

		fs.writeFileSync(sourceFilePath, 'int foo(void) { return 42; }');
		fs.writeFileSync(templatePath, 'Function from {{ sourcename }} in {{ sourcedirname }}');
	});

	test('Test parse function', () => {
		const result = parse(sourceFilePath);
		assert.ok(result.jsonData, 'jsonData should be defined');
		assert.strictEqual(result.jsonData.sourceFilePath, sourceFilePath);
		assert.strictEqual(result.jsonData.sourcename, 'source');
	});

	test('Test generate function', () => {
		const jsonData = { sourceFilePath, sourcename: 'source' };
		const result = generate(jsonData, templatePath, outputFilePath);
		assert.ok(result.includes('Function from source'), 'Generated content should interpolate sourcename');
	});

	suiteTeardown(() => {
		fs.rmSync(tempDir, { recursive: true, force: true });
	});
});
