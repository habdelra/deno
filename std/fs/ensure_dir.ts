// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { getFileInfoType } from "./utils";
const { lstat, lstatSync, mkdir, mkdirSync } = Deno;

/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--alow-write` flag.
 */
export async function ensureDir(dir: string): Promise<void> {
  try {
    const fileInfo = await lstat(dir);
    if (!fileInfo.isDirectory()) {
      throw new Error(
        `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`
      );
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // if dir not exists. then create it.
      await mkdir(dir, { recursive: true });
      return;
    }
    throw err;
  }
}

/**
 * Ensures that the directory exists.
 * If the directory structure does not exist, it is created. Like mkdir -p.
 * Requires the `--allow-read` and `--alow-write` flag.
 */
export function ensureDirSync(dir: string): void {
  try {
    const fileInfo = lstatSync(dir);
    if (!fileInfo.isDirectory()) {
      throw new Error(
        `Ensure path exists, expected 'dir', got '${getFileInfoType(fileInfo)}'`
      );
    }
  } catch (err) {
    if (err instanceof Deno.errors.NotFound) {
      // if dir not exists. then create it.
      mkdirSync(dir, { recursive: true });
      return;
    }
    throw err;
  }
}
