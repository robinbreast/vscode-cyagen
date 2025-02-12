import * as assert from 'assert';
import { getSourceDirname, renderString } from '../../utils';

suite('Utils Test Suite', () => {
	suiteSetup(() => {
		// ...setup code...
	});

	test('Test getSourceDirname', () => {
		const outputFilePath = 'path/to/output/file.c';
		const sourceFilePath = 'path/to/source/file.c';
		const result = getSourceDirname(outputFilePath, sourceFilePath);
		assert.strictEqual(result, 'source', 'Should return the correct relative path');
	});

	test('Test renderString', () => {
		const templateString = 'Hello, {{ name }}!';
		const data = { name: 'World' };
		const result = renderString(templateString, data);
		assert.strictEqual(result, 'Hello, World!', 'Should render the template string correctly');
	});

	suiteTeardown(() => {
		// ...teardown code...
	});
});
