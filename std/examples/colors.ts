// Copyright 2018-2020 the Deno authors. All rights reserved. MIT license.
import { bgBlue, red, bold, italic } from "../fmt/colors";

if (import.meta.main) {
  console.log(bgBlue(italic(red(bold("Hello world!")))));
}
