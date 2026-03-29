# Settings

This file is the canonical source for `vscode-cyagen` settings behavior.

## `vscode-cyagen.templates`

Array of template-set entries:

- `label`: name shown in generation quick pick
- `templateFolder`: source folder containing template files
- `outputFolder`: target folder root for rendered artifacts

### Substitution behavior (exact)

`templateFolder` supports only direct string replacements:

- `${fileDirname}`
- `${extensionPath}`
- legacy `@sourcename@`

`outputFolder` supports:

- `${fileDirname}`
- `${extensionPath}`
- legacy `@sourcename@`
- full Nunjucks rendering via template data (for example `{{sourcename}}`)

`templateFolder` is **not** Nunjucks-rendered.

### Example

```json
{
  "vscode-cyagen.templates": [
    {
      "label": "gtest.basic",
      "templateFolder": "${extensionPath}/resources/templates/gtest.basic",
      "outputFolder": "${fileDirname}/../tst/gtest/test_{{sourcename}}"
    }
  ]
}
```

## `vscode-cyagen.localStaticVariableMacroName`

- Default: `LOCAL_STATIC_VARIABLE`
- Used by parser logic to capture local static variable declarations for template context.

## `vscode-cyagen.currentTargetSource`

- Used by `vscode-cyagen.openTargetSource`.
- Interpreted as path joined to the **first workspace folder** when set.
