// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.

const { test } = Deno;
import { assertEquals } from "../testing/asserts";

import { common } from "./mod";

test({
  name: "path - common - basic usage",
  fn() {
    const actual = common(
      [
        "file://deno/cli/js/deno",
        "file://deno/std/path/mod",
        "file://deno/cli/js/main",
      ],
      "/"
    );
    assertEquals(actual, "file://deno/");
  },
});

test({
  name: "path - common - no shared",
  fn() {
    const actual = common(
      ["file://deno/cli/js/deno", "https://deno.land/std/path/mod"],
      "/"
    );
    assertEquals(actual, "");
  },
});

test({
  name: "path - common - windows sep",
  fn() {
    const actual = common(
      [
        "c:\\deno\\cli\\js\\deno",
        "c:\\deno\\std\\path\\mod",
        "c:\\deno\\cli\\js\\main",
      ],
      "\\"
    );
    assertEquals(actual, "c:\\deno\\");
  },
});
