# Custom Templates Guide

This extension renders template files from a template folder and copies static assets.

## 1) Create a template folder

Recommended layout (example):

```text
my-template/
  CMakeLists.txt.j2
  test_{{sourcename}}.cc.j2
  include/
    test_{{sourcename}}.h.j2
```

Rules:

- Folder traversal is recursive.
- File/folder names can contain variables such as `{{sourcename}}`.
- Only `.j2` and `.njk` files are Nunjucks-rendered.
- Other files are copied as static assets (no variable substitution).

## 2) Configure the template set

Add an entry in your VS Code settings:

```json
{
  "vscode-cyagen.templates": [
    {
      "label": "my-template",
      "templateFolder": "${fileDirname}/../templates/my-template",
      "outputFolder": "${fileDirname}/../tst/test_{{sourcename}}"
    }
  ]
}
```

Important:

- `templateFolder` does **not** support Nunjucks rendering.
- `outputFolder` supports Nunjucks rendering (for example `{{sourcename}}`).
- Exact token/substitution rules are documented in [SETTINGS.md](SETTINGS.md).

## 3) Available template data

For C files, template context includes fields such as:

- `sourceFilePath`, `sourceFileName`
- `sourcename`, `sourcedirname`
- `lsvMacroName`
- `incs[]` (each item contains `captured` include line)
- `typedefs[]` (each item contains `captured` typedef block)
- `fncs[]` (function metadata)
  - `name`, `rtype`, `args`, `atypes`, `anames`, `is_local`, `captured`
- `static_vars[]`
  - `name`, `dtype`, `init`, `is_const`, `is_local`, `func_name`, `name_expr`
- `ncls[]` (caller/callee links between parsed functions)

For non-`.c` files, a minimal context is available:

- `sourceFilePath`, `sourceFileName`, `sourcename`, `sourcedirname`

## 4) Manual sections are preserved

If a generated output file already exists, sections wrapped with:

```text
MANUAL SECTION: <id>
...
MANUAL SECTION END
```

are retained on regeneration. Use stable `<id>` values so your custom edits stay intact.

## 5) Start from bundled examples

Use these as references:

- `resources/templates/gtest.basic`
- `resources/templates/gtest.c`

The `gtest.basic` template also includes build/debug usage notes in its own `README.md`.
