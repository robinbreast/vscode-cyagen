import * as path from "path";
import * as os from "os";
const nunjucks = require("nunjucks");

export function getSourceDirname(outputFilePath: string, sourceFilePath: string): string {
  let sourcedirname = path
    .relative(path.dirname(outputFilePath), path.dirname(sourceFilePath))
    .split("/")
    .join(path.sep);
  if (os.platform() === "win32") {
    sourcedirname = sourcedirname.replace(/\\/g, "\\\\");
  }
  return sourcedirname;
}

export function renderString(templateString: string, data: any): string {
  const env = nunjucks.configure();
  return env.renderString(templateString, data);
}
