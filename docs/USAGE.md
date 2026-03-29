# Usage

## Generate files

1. Open a source file in the editor.
2. Run `Cyagen: Generate files using templates`.
3. Pick a template set from the quick pick.
4. Review generated files in the configured output location.

### Notes

- Full parsing is applied to `.c` files.
- Non-`.c` files still support generation with minimal context (`sourceFilePath`, `sourceFileName`, `sourcename`, `sourcedirname`).
- The extension creates a `sut/<sourceFileName>` symlink in the output tree. On some systems (notably Windows), symlink permissions can block this operation.
- If symlink creation fails, generation is aborted for that run.

## Command summary

See [SKILLS.md](SKILLS.md) for detailed command behavior and activation contexts.

## Troubleshooting

- **No templates found**: verify `vscode-cyagen.templates[].templateFolder` exists and is non-empty.
- **Template output path is unexpected**: verify token behavior in [SETTINGS.md](SETTINGS.md).
- **Manual sections not preserved**: verify the same manual section marker still exists in the newly rendered template (details in [CUSTOM_TEMPLATES.md](CUSTOM_TEMPLATES.md)).
