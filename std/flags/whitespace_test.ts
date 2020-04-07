// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts";
import { parse } from "./mod";

Deno.test(function whitespaceShouldBeWhitespace(): void {
  assertEquals(parse(["-x", "\t"]).x, "\t");
});
