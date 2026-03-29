# Architecture

## High-level flow

1. `vscode-cyagen.generate` reads active editor file.
2. For `.c` files, parser extracts structured data:
   - `incs`, `typedefs`, `fncs`, `static_vars`, `ncls`
3. User selects a template set.
4. Extension resolves `templateFolder` / `outputFolder` placeholders.
5. Files are rendered and written to output path:
   - `.j2` / `.njk` files are rendered.
   - non-template files are copied as static assets.
6. Existing output files preserve manual sections by ID.

## Main modules

- `src/extension.ts`
  - Command registration
  - Settings loading
  - Template/output path resolution
  - Generation orchestration
- `src/cyagen.ts`
  - Parser implementation
  - Template rendering and manual-section preservation logic

## Manual section preservation contract

When an output file already exists, the generator preserves content for sections that match:

```text
MANUAL SECTION: <id>
...
MANUAL SECTION END
```

Preservation requires that the same section ID marker exists in the newly rendered output.

## Command surface

See [SKILLS.md](SKILLS.md) for command-level behavior.
