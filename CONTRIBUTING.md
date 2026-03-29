# Contributing

Thanks for contributing to `vscode-cyagen`.

## Development setup

Prerequisites:

- Node.js 20+ (project currently tested with npm lockfile v3)
- VS Code

Install dependencies:

```sh
npm install
```

## Build and quality checks

```sh
npm run compile
npm run lint
npm run esbuild
```

Run extension tests:

```sh
npm test
```

## Local debugging

1. Open this repository in VS Code.
2. Press `F5` to launch the Extension Development Host.
3. In the new window, open a C source file.
4. Run `Cyagen: Generate files using templates` from the command palette.

## Documentation map

- Canonical documentation index: [docs/INDEX.md](docs/INDEX.md)
- Agent Skills spec artifacts: [skills/](skills)

## Pull requests

- Keep changes focused and scoped.
- Update docs when behavior, settings, or command UX changes.
- Add changelog entries for user-visible changes.
