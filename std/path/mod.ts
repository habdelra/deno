// Copyright the Browserify authors. MIT License.
// Ported mostly from https://github.com/browserify/path-browserify/

import * as _win32 from "./win32";
import * as _posix from "./posix";

import { isWindows } from "./constants";

const path = isWindows ? _win32 : _posix;

export const win32 = _win32;
export const posix = _posix;
export const {
  resolve,
  normalize,
  isAbsolute,
  join,
  relative,
  toNamespacedPath,
  dirname,
  basename,
  extname,
  format,
  parse,
  sep,
  delimiter,
} = path;

export { common } from "./common";
export { EOL, SEP, SEP_PATTERN, isWindows } from "./constants";
export * from "./interface";
export * from "./glob";
export * from "./globrex";
