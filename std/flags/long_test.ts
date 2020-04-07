// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { assertEquals } from "../testing/asserts";
import { parse } from "./mod";

Deno.test(function longOpts(): void {
  assertEquals(parse(["--bool"]), { bool: true, _: [] });
  assertEquals(parse(["--pow", "xixxle"]), { pow: "xixxle", _: [] });
  assertEquals(parse(["--pow=xixxle"]), { pow: "xixxle", _: [] });
  assertEquals(parse(["--host", "localhost", "--port", "555"]), {
    host: "localhost",
    port: 555,
    _: [],
  });
  assertEquals(parse(["--host=localhost", "--port=555"]), {
    host: "localhost",
    port: 555,
    _: [],
  });
});
