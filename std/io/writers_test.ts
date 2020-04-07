const { copy, test } = Deno;
import { assertEquals } from "../testing/asserts";
import { StringWriter } from "./writers";
import { StringReader } from "./readers";
import { copyN } from "./ioutil";

test(async function ioStringWriter(): Promise<void> {
  const w = new StringWriter("base");
  const r = new StringReader("0123456789");
  await copyN(w, r, 4);
  assertEquals(w.toString(), "base0123");
  await copy(w, r);
  assertEquals(w.toString(), "base0123456789");
});
