// vscode version with the same idea as cyagen in Rust
// https://crates.io/crates/cyagen
import * as path from "path";
import * as fs from "fs";
import * as vscode from "vscode";
import { getSourceDirname, renderString } from "./utils";

export class Parser {
  public static getInstance(): Parser {
    if (!Parser._instance) {
      Parser._instance = new Parser();
    }
    return Parser._instance;
  }
  public parse(
    sourceFilePath: string = "",
    sourcename = "",
    lsvMacroName = ""
  ) {
    const fs = require("fs");
    this._code = fs.readFileSync(sourceFilePath, "utf-8");
    this._jsonData.sourceFilePath = sourceFilePath;
    if (sourcename === "") {
      const path = require("path");
      this._jsonData.sourcename = path.basename(
        sourceFilePath,
        path.extname(sourceFilePath)
      );
    } else {
      this._jsonData.sourcename = sourcename;
    }
    this._jsonData.lsvMacroName = lsvMacroName;
    // remove all the comments
    const regex = /(\/\*([^*]|[\r\n]|(\*+([^*\/]|[\r\n])))*\*+\/)|(\/\/.*)/gi;
    this._code = this._code.replace(regex, "");
    // parse c/c++/header file and build json data
    this.getIncs();
    this.getTypedefs();
    this.getFncs();
    this.getStaticVars();
    this.getLocalStaticVars(); // only for googletest to detect the pattern "LOCAL_STATIC_VARIABLE(dtype, varname, init)"
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
  private getAtypes(args: string): [string, string] {
    let atypes = "";
    let anames = "";
    let firstPos = true;
    const argList = args.split(",");
    argList.forEach((arg) => {
      const regex = /^(.*?)(\w+(?:\[.*?\])*)$/;
      let match = arg.match(regex);
      let atype = "";
      let aname = "";
      if (match) {
        atype = match[1].trim();
        aname = match[2].trim();
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
          anames += ", ";
        }
        atypes += atype;
        // add '*' by the occurrence of '[]' in name
        atypes += '*'.repeat(atype.split('').filter(c => c === '[').length);
        // remove '[]' from aname
        const re4bracket = /(\[.*?\])+/;
        if (re4bracket.test(aname)) {
          aname = aname.replace(re4bracket, "");
        }
        anames += aname;
      }
    });
    return [atypes, anames];
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
    const capList: string[] = [];
    const regex = /#include[\s]+["<].+[">]/gm;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      if (!capList.includes(match[0])) {
        capList.push(match[0]);
        const entry: any = {};
        entry.captured = match[0];
        list.push(entry);
      }
    }
    this._jsonData.incs = list;
  }
  private getTypedefs() {
    const list: {}[] = [];
    const regex = /^(typedef\s+(?:.*?{[.\s\S]*?}.*?;|[.\s\S]+?;))/gm;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      entry.captured = match[1];
      list.push(entry);
    }
    this._jsonData.typedefs = list;
  }
  private getFncs() {
    const list: {}[] = [];
    const regex =
      /((?<return>\w+[\w\s\*]*\s+)|FUNC\((?<return_ex>[^,]+),[^\)]+\)\s*)(?<name>\w+)[\w]*\s*\((?<args>[^=!><>;\(\)-]*)\)\s*\{/gm;
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
      const regex4static = /[\s\r\n]*(static|local_inline)[\s\r\n]+/i;
      entry.is_local = regex4static.test(entry.captured);
      const _return = match.groups?.return
        ? match.groups?.return
        : match.groups?.return_ex;
      if (_return) {
        entry.rtype = _return
          .trim()
          .replace(/(static|inline|local_inline)/gi, "")
          .trim();
      } else {
        entry.rtype = "int";
      }
      var args = match.groups?.args;
      if (args) {
        args = args.replace(/\\/g, "").trim();
        if (args === "void" || args === "") {
          entry.args = "";
          entry.atypes = "";
        } else {
          entry.args = args;
          const [atypes, anames] = this.getAtypes(args);
          entry.atypes = atypes;
          entry.anames = anames;
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
  private getLocalStaticVars() {
    const list: {}[] = [];
    //const regex = /LOCAL_STATIC_VARIABLE\((\w+)\s*,(.*?)\s*,\s*(\w+)\s*(?:\[(.*?)\])?\s*,\s*(.*?)\).*?;/gim;
    const regex = new RegExp(
      `${this._jsonData.lsvMacroName}\\((\\w+)\\s*,(.*?)\\s*,\\s*(\\w+)\\s*(?:\\[(.*?)\\])?\\s*,\\s*(.*?)\\).*?;`,
      "gim"
    );
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      const [, funcName, dtype, name, arraySize, value] = match;
      entry.captured = match[0];
      entry.name_expr =
        arraySize !== undefined ? `${name}[${arraySize}]` : name;
      entry.array_size = arraySize !== undefined ? parseInt(arraySize) : 0;
      entry.name = name.trim();
      entry.dtype = dtype.trim();
      entry.init =
        value !== undefined ? (value.trim() === "" ? "0" : value.trim()) : "0";
      entry.is_const = dtype.includes("const");
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
          if (entry.func_name !== funcName) {
            const msg = `mismatched function name \"${entry.func_name}\" vs. \"${funcName}\"`;
            console.log(msg);
            vscode.window.showWarningMessage(msg);
          }
        }
      });
      list.push(entry);
    }
    this._jsonData.static_vars = this._jsonData.static_vars.concat(list);
  }
  private getStaticVars() {
    const list: {}[] = [];
    const regex =
      /(static\s+|static\s+const\s+|const\s+static\s+)+(.*?)(\w+)\s*(?:\[(.*?)\])?\s*(?:=\s*(\{.*?\}|.*?))?;/gim;
    let match;
    while ((match = regex.exec(this._code)) !== null) {
      const entry: any = {};
      const [, keyword, dtype, name, arraySize, value] = match;
      entry.captured = match[0];
      entry.name_expr =
        arraySize !== undefined ? `${name}[${arraySize}]` : name;
      entry.array_size = arraySize !== undefined ? parseInt(arraySize) : 0;
      entry.name = name.trim();
      entry.dtype = dtype.trim();
      entry.init =
        value !== undefined ? (value.trim() === "" ? "0" : value.trim()) : "0";
      entry.is_const =
        (keyword !== undefined && keyword.includes("const")) ||
        dtype.includes("const");
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
          const msg = `found \"${entry.name}\" in \"${entry.func_name}\"; use \"${this._jsonData.lsvMacroName}\" macro`;
          console.log(msg);
          vscode.window.showWarningMessage(msg);
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

export function parse(
  filepath: string,
  sourcename = "",
  lsvMacroName = ""
): any {
  return Parser.getInstance().parse(filepath, sourcename, lsvMacroName);
}
export function generate(
  jsonData: any = {},
  tempPath: string,
  outputFilePath: string
) {
  const tempString = fs.readFileSync(tempPath, "utf8");
  const sourcedirname = getSourceDirname(outputFilePath, jsonData.sourceFilePath);
  let outputString = "";
  try {
    outputString = renderString(tempString, {
      ...jsonData,
      ...{ sourcename: jsonData.sourcename, sourcedirname: `${sourcedirname}` },
    });
  } catch (error) {
    const msg = `\"${tempPath}\":\n${error}`;
    console.log(msg);
    vscode.window.showWarningMessage(msg);
  }
  console.log(`Generating ${outputFilePath}`);
  if (!fs.existsSync(path.dirname(outputFilePath))) {
    fs.mkdirSync(path.dirname(outputFilePath), { recursive: true });
  }
  if (fs.existsSync(outputFilePath)) {
    // Extract the manual sections from the legacy file using IDs
    const manualSections = [
      ...fs
        .readFileSync(outputFilePath, "utf8")
        .matchAll(/MANUAL SECTION: ([a-zA-Z0-9_-]+)(.*?)MANUAL SECTION END/gs),
    ];
    // Merge the rendered template with the preserved manual sections
    if (manualSections.length > 0) {
      manualSections.forEach(([section, id, content]) => {
        const sectionPattern = new RegExp(
          `MANUAL SECTION: ${id}.*?MANUAL SECTION END`,
          "gs"
        );
        outputString = outputString.replace(
          sectionPattern,
          `MANUAL SECTION: ${id}` + content + "MANUAL SECTION END"
        );
      });
    }
  }
  fs.writeFile(outputFilePath, outputString, (err) => {
    if (err) {
      console.error(`Error writing file: ${outputFilePath}`);
    }
  });
  return outputString;
}
