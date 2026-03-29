# Cyagen Commands (Skills)

This project exposes command-based "skills" through VS Code commands.

For Agent Skills-spec format artifacts, see:

- `skills/vscode-cyagen-commands/SKILL.md`

## `vscode-cyagen.generate`

- **Title**: `Generate files using templates`
- **When to use**: You have a C source file open and want generated test/scaffold output.
- **How it works**:
  1. Loads `vscode-cyagen.templates` entries.
  2. Builds template data from active file (and parser output for `.c` files).
  3. Lets you pick a template set.
  4. Renders files into the configured output folder.
- **Notes**:
  - Creates a symlink at `.../sut/<sourceFileName>` in the rendered output tree.
  - Manual section preservation details are documented in [CUSTOM_TEMPLATES.md](CUSTOM_TEMPLATES.md).

## `vscode-cyagen.openTargetSource`

- **Title**: `Open target source file`
- **When to use**: Jump back to your configured source quickly.
- **Behavior**:
  - Uses `vscode-cyagen.currentTargetSource` if configured.
  - Falls back to file picker when not configured.

## `vscode-cyagen.openTemplateFolder`

- **Title**: `Open template folder`
- **When to use**: Open bundled template root in a new VS Code window.

## `vscode-cyagen.revealTemplateFolder`

- **Title**: `Reveal template folder in explorer`
- **When to use**: Reveal bundled templates in your OS file explorer.

## `vscode-cyagen.openFolder`

- **Title**: `Open folder`
- **Where**: Explorer context menu for folders.
- **Behavior**: Opens selected folder (or prompts for one) in a new window.

## `vscode-cyagen.openFolderInWSL`

- **Title**: `Open folder in WSL`
- **Where**: Explorer context menu for folders (Windows only).
- **Behavior**: Launches `wsl.exe` and opens the folder with `code` in WSL context.

## Activation points

- `onLanguage:c`
- `onLanguage:cpp`
- `explorer`
