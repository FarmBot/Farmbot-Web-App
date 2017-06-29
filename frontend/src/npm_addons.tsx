// This module dynamically loads an NPM module of the author's choosing.
// In the case of FarmBot, Inc (the "public servers"), we use this file
// to load non-opensource tools, such as RollBar error reporting.
declare var SHORT_REVISION: string;
// Global variable so that the NPM_ADDON knows the version number of the FE.
SHORT_REVISION = process.env.SHORT_REVISION;

if (process.env.NPM_ADDON) {
  require(process.env.NPM_ADDON);
}
