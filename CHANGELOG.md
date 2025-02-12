# Change Log

## [0.2.0]
- allow header files and C++ files as source file but to render with minimum dictionary data
- supports .j2 extension for template files
- `uuid` is not used anymore for manual sections
- `@` is not used anymore in template file or folder name; instead `{{` and `}}` like jinja2 syntax
## [0.1.4]
- update modules for vulnerabilities
## [0.1.3]
- fix error in parsing argument list with array pattern like 'int arg[]'
## [0.1.2]
- new command: `vscode-cyagen.openTargetSource`
- new configuration: `vscode-cyagen.currentTargetSource`
## [0.1.1]
- add reveal template folder command
- open template folder `with new instance`
- fix wrong capture with the pattern `typedef struct {}`
## [0.1.0]
- Initial release