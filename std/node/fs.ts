// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

import { access, accessSync } from "./_fs/_fs_access";
import { appendFile, appendFileSync } from "./_fs/_fs_appendFile";
import { chmod, chmodSync } from "./_fs/_fs_chmod";
import { chown, chownSync } from "./_fs/_fs_chown";
import { close, closeSync } from "./_fs/_fs_close";
import * as constants from "./_fs/_fs_constants";
import { readFile, readFileSync } from "./_fs/_fs_readFile";
import { readlink, readlinkSync } from "./_fs/_fs_readlink";

export {
  access,
  accessSync,
  appendFile,
  appendFileSync,
  chmod,
  chmodSync,
  chown,
  chownSync,
  close,
  closeSync,
  constants,
  readFile,
  readFileSync,
  readlink,
  readlinkSync,
};
