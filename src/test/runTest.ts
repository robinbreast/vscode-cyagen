import * as path from 'path';

import { runTests } from '@vscode/test-electron';

async function main() {
	try {
		// The folder containing the Extension Manifest package.json
		// Passed to `--extensionDevelopmentPath`
		const extensionDevelopmentPath = path.resolve(__dirname, '../../');

		// The path to test runner for cyagen.ts
		const cyagenTestsPath = path.resolve(__dirname, './suite/cyagen.test');

		// The path to test runner for extension.ts
		const extensionTestsPath = path.resolve(__dirname, './suite/extension.test');

		// The path to test runner for utils.ts
		const utilsTestsPath = path.resolve(__dirname, './suite/utils.test');

		// Download VS Code, unzip it and run the integration test for cyagen.ts
		await runTests({ extensionDevelopmentPath, extensionTestsPath: cyagenTestsPath });

		// Download VS Code, unzip it and run the integration test for extension.ts
		await runTests({ extensionDevelopmentPath, extensionTestsPath: extensionTestsPath });

		// Download VS Code, unzip it and run the integration test for utils.ts
		await runTests({ extensionDevelopmentPath, extensionTestsPath: utilsTestsPath });
	} catch (err) {
		console.error('Failed to run tests', err);
		process.exit(1);
	}
}

main();
