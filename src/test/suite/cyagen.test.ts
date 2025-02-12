import * as assert from 'assert';
import { parse, generate } from '../../cyagen';
import * as path from 'path';
import * as fs from 'fs';

suite('Cyagen Test Suite', () => {
	suiteSetup(() => {
		// ...setup code...
	});

	test('Test parse function', () => {
		const result = parse('path/to/source/file.c');
		assert.ok(result.jsonData, 'jsonData should be defined');
		assert.strictEqual(result.jsonData.sourceFilePath, 'path/to/source/file.c');
	});

	test('Test generate function', () => {
		const jsonData = { sourceFilePath: 'path/to/source/file.c', sourcename: 'file' };
		const tempPath = path.resolve(__dirname, 'path/to/template/file.tpl');
		const outputFilePath = path.resolve(__dirname, 'path/to/output/file.c');
		fs.writeFileSync(tempPath, 'template content');
		const result = generate(jsonData, tempPath, outputFilePath);
		assert.ok(result.includes('template content'), 'Generated content should include template content');
		fs.unlinkSync(tempPath);
		fs.unlinkSync(outputFilePath);
	});

	suiteTeardown(() => {
		// ...teardown code...
	});
});
