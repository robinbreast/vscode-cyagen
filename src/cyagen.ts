// vscode version with the same idea as cyagen in Rust
// https://crates.io/crates/cyagen

import * as fs from "fs";

export class Parser {
  public static getInstance(): Parser {
    if (!Parser._instance) {
      Parser._instance = new Parser();
    }
    return Parser._instance;
  }
  public parse(sourceFilePath: string = "") {
    this._code = fs.readFileSync(sourceFilePath, "utf-8");
    // remove all the comments
    const regex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this._code = this._code.replace(regex, "");
    // parse c file and build json data
    this.getIncs();
    this.getFncs();
    this.getStaticVars();
    this.getNcls();
    return this;
  }
  get jsonData() {
    return this._jsonData;
  }
  private static _instance: Parser;
  private _jsonData: any = {};
  private _code = "";
  private constructor() {}
  private getAtypes(args: string): string {
    let atypes = "";
    let firstPos = true;
    const argList = args.split(",");
    argList.forEach((arg) => {
      let atype = arg
        .trim()
        .replace(/(\s|\*)\w+$/, "$1")
        .trim();
      console.log(atype);
      // relocate 'const' only for 'datatype const *' -> 'const datatype *'
      const regex4const = /\w[\s\r\n]+const[\s\r\n]*\*/;
      if (regex4const.test(atype)) {
        atype = atype.replace("const", "");
        atype = `const ${atype}`.replace(/\s+/, " ");
      }
      if (firstPos) {
        firstPos = false;
      } else {
        atypes += ", ";
      }
      atypes += atype;
    });
    return atypes;
  }
  private findEndOfFunc(start: number): number {
    let level = 1;
    for (let i = start; i < this._code.length; i++) {
      const c = this._code.charAt(i);
      if (c === "{") {
        level++;
      } else if (c === "}") {
        level--;
        if (level === 0) {
          return i;
        }
      }
    }
    return -1;
  }
  private getIncs() {
    const list: {}[] = [];
    const regex = /#include[\s]+["<].+[">]/gm;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      entry.captured = match[0];
      list.push(entry);
    }
    this._jsonData.incs = list;
  }
  private getFncs() {
    const list: {}[] = [];
    const regex =
      /(?<return>[A-Za-z_]+[\w\s\*]*\s+)+(?<name>[A-Za-z_]+[\w]*)\s*\((?<args>[^=!><>;\(\)-]*)\)\s*\{/gm;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      const name = match.groups?.name;
      if (name) {
        if (name.trim() === "if") {
          continue;
        }
        entry.name = name.trim();
      } else {
        continue;
      }
      entry.captured = match[0];
      const regex4static = /[\s\r\n]*static[\s\r\n]+/i;
      entry.is_local = regex4static.test(entry.captured);
      const _return = match.groups?.return;
      if (_return) {
        entry.rtype = _return
          .trim()
          .replace(/(static|inline)/gi, "")
          .trim();
      } else {
        entry.rtype = "int";
      }
      var args = match.groups?.args;
      if (args) {
        args = args.trim();
        if (args === "void" || args === "") {
          entry.args = "";
          entry.atypes = "";
        } else {
          entry.args = args;
          entry.atypes = this.getAtypes(args);
        }
      } else {
        entry.args = "";
        entry.atypes = "";
      }
      entry._idxBegin =
        this._code.indexOf(entry.captured) + entry.captured.length;
      entry._idxEnd = this.findEndOfFunc(entry._idxBegin);
      list.push(entry);
    }
    this._jsonData.fncs = list;
  }
  private getStaticVars() {
    const list: {}[] = [];
    const regex = /(static)\s+(?<captured>[^\(\{;=]+)[;=]/gim;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      entry.captured = match.groups?.captured.trim();
      entry.name_expr = entry.captured.match(/[\s*]+([^*\s]+)[*\s]*$/)?.[1];
      entry.name = entry.name_expr.match(/^([^[\]]+)/)?.[1];
      entry.dtype = entry.captured
        .substring(0, entry.captured.lastIndexOf(entry.name))
        .trim();
      entry.is_local = false;
      entry.func_name = "";
      this._jsonData.fncs.forEach((fnc: any) => {
        if (
          this._code
            .substring(fnc._idxBegin, fnc._idxEnd)
            .includes(entry.captured)
        ) {
          entry.is_local = true;
          entry.func_name = fnc.name;
        }
      });
      list.push(entry);
    }
    this._jsonData.static_vars = list;
  }
  private getNcls() {
    const list: {}[] = [];
    this._jsonData.fncs.forEach((caller: any) => {
      this._jsonData.fncs.forEach((callee: any) => {
        if (
          this._code
            .substring(caller._idxBegin, caller._idxEnd)
            .includes(callee.name + "(")
        ) {
          const entry: any = {};
          entry.caller = caller;
          entry.callee = callee;
          list.push(entry);
        }
      });
    });
    this._jsonData.ncls = list;
  }
}
