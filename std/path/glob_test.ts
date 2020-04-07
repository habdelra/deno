const { mkdir, test } = Deno;
import { assert, assertEquals } from "../testing/asserts";
import { testWalk, touch, walkArray } from "../fs/walk_test";
import { globToRegExp, isGlob, joinGlobs, normalizeGlob } from "./glob";
import { SEP, join } from "./mod";

test({
  name: "glob: glob to regex",
  fn(): void {
    assertEquals(globToRegExp("unicorn.*") instanceof RegExp, true);
    assertEquals(globToRegExp("unicorn.*").test("poney"), false);
    assertEquals(globToRegExp("unicorn.*").test("unicorn.py"), true);
    assertEquals(globToRegExp("*").test("poney"), true);
    assertEquals(globToRegExp("*").test("unicorn.js"), false);
    assertEquals(
      globToRegExp(join("unicorn", "**", "cathedral")).test(
        join("unicorn", "in", "the", "cathedral")
      ),
      true
    );
    assertEquals(
      globToRegExp(join("unicorn", "**", "cathedral")).test(
        join("unicorn", "in", "the", "kitchen")
      ),
      false
    );
    assertEquals(
      globToRegExp(join("unicorn", "**", "bathroom.*")).test(
        join("unicorn", "sleeping", "in", "bathroom.py")
      ),
      true
    );
    assertEquals(
      globToRegExp(join("unicorn", "!(sleeping)", "bathroom"), {
        extended: true,
      }).test(join("unicorn", "flying", "bathroom")),
      true
    );
    assertEquals(
      globToRegExp(join("unicorn", "(!sleeping)", "bathroom"), {
        extended: true,
      }).test(join("unicorn", "sleeping", "bathroom")),
      false
    );
  },
});

testWalk(
  async (d: string): Promise<void> => {
    await mkdir(d + "/a");
    await mkdir(d + "/b");
    await touch(d + "/a/x");
    await touch(d + "/b/z");
    await touch(d + "/b/z.js");
  },
  async function globInWalkWildcard(): Promise<void> {
    const arr = await walkArray(".", {
      match: [globToRegExp(join("*", "*"))],
    });
    assertEquals(arr.length, 2);
    assertEquals(arr[0], "a/x");
    assertEquals(arr[1], "b/z");
  }
);

testWalk(
  async (d: string): Promise<void> => {
    await mkdir(d + "/a");
    await mkdir(d + "/a/yo");
    await touch(d + "/a/yo/x");
  },
  async function globInWalkFolderWildcard(): Promise<void> {
    const arr = await walkArray(".", {
      match: [
        globToRegExp(join("a", "**", "*"), {
          flags: "g",
          globstar: true,
        }),
      ],
    });
    assertEquals(arr.length, 1);
    assertEquals(arr[0], "a/yo/x");
  }
);

testWalk(
  async (d: string): Promise<void> => {
    await mkdir(d + "/a");
    await mkdir(d + "/a/unicorn");
    await mkdir(d + "/a/deno");
    await mkdir(d + "/a/raptor");
    await touch(d + "/a/raptor/x");
    await touch(d + "/a/deno/x");
    await touch(d + "/a/unicorn/x");
  },
  async function globInWalkFolderExtended(): Promise<void> {
    const arr = await walkArray(".", {
      match: [
        globToRegExp(join("a", "+(raptor|deno)", "*"), {
          flags: "g",
          extended: true,
        }),
      ],
    });
    assertEquals(arr.length, 2);
    assertEquals(arr[0], "a/deno/x");
    assertEquals(arr[1], "a/raptor/x");
  }
);

testWalk(
  async (d: string): Promise<void> => {
    await touch(d + "/x");
    await touch(d + "/x.js");
    await touch(d + "/b.js");
  },
  async function globInWalkWildcardExtension(): Promise<void> {
    const arr = await walkArray(".", {
      match: [globToRegExp("x.*", { flags: "g", globstar: true })],
    });
    assertEquals(arr.length, 2);
    assertEquals(arr[0], "x.js");
    assertEquals(arr[1], "x");
  }
);

test({
  name: "isGlob: pattern to test",
  fn(): void {
    // should be true if valid glob pattern
    assert(isGlob("!foo.js"));
    assert(isGlob("*.js"));
    assert(isGlob("!*.js"));
    assert(isGlob("!foo"));
    assert(isGlob("!foo.js"));
    assert(isGlob("**/abc.js"));
    assert(isGlob("abc/*.js"));
    assert(isGlob("@.(?:abc)"));
    assert(isGlob("@.(?!abc)"));

    // should be false if invalid glob pattern
    assert(!isGlob(""));
    assert(!isGlob("~/abc"));
    assert(!isGlob("~/abc"));
    assert(!isGlob("~/(abc)"));
    assert(!isGlob("+~(abc)"));
    assert(!isGlob("."));
    assert(!isGlob("@.(abc)"));
    assert(!isGlob("aa"));
    assert(!isGlob("who?"));
    assert(!isGlob("why!?"));
    assert(!isGlob("where???"));
    assert(!isGlob("abc!/def/!ghi.js"));
    assert(!isGlob("abc.js"));
    assert(!isGlob("abc/def/!ghi.js"));
    assert(!isGlob("abc/def/ghi.js"));

    // Should be true if path has regex capture group
    assert(isGlob("abc/(?!foo).js"));
    assert(isGlob("abc/(?:foo).js"));
    assert(isGlob("abc/(?=foo).js"));
    assert(isGlob("abc/(a|b).js"));
    assert(isGlob("abc/(a|b|c).js"));
    assert(isGlob("abc/(foo bar)/*.js"));

    // Should be false if the path has parens but is not a valid capture group
    assert(!isGlob("abc/(?foo).js"));
    assert(!isGlob("abc/(a b c).js"));
    assert(!isGlob("abc/(ab).js"));
    assert(!isGlob("abc/(abc).js"));
    assert(!isGlob("abc/(foo bar).js"));

    // should be false if the capture group is imbalanced
    assert(!isGlob("abc/(?ab.js"));
    assert(!isGlob("abc/(ab.js"));
    assert(!isGlob("abc/(a|b.js"));
    assert(!isGlob("abc/(a|b|c.js"));

    // should be true if the path has a regex character class
    assert(isGlob("abc/[abc].js"));
    assert(isGlob("abc/[^abc].js"));
    assert(isGlob("abc/[1-3].js"));

    // should be false if the character class is not balanced
    assert(!isGlob("abc/[abc.js"));
    assert(!isGlob("abc/[^abc.js"));
    assert(!isGlob("abc/[1-3.js"));

    // should be false if the character class is escaped
    assert(!isGlob("abc/\\[abc].js"));
    assert(!isGlob("abc/\\[^abc].js"));
    assert(!isGlob("abc/\\[1-3].js"));

    // should be true if the path has brace characters
    assert(isGlob("abc/{a,b}.js"));
    assert(isGlob("abc/{a..z}.js"));
    assert(isGlob("abc/{a..z..2}.js"));

    // should be false if (basic) braces are not balanced
    assert(!isGlob("abc/\\{a,b}.js"));
    assert(!isGlob("abc/\\{a..z}.js"));
    assert(!isGlob("abc/\\{a..z..2}.js"));

    // should be true if the path has regex characters
    assert(isGlob("!&(abc)"));
    assert(isGlob("!*.js"));
    assert(isGlob("!foo"));
    assert(isGlob("!foo.js"));
    assert(isGlob("**/abc.js"));
    assert(isGlob("*.js"));
    assert(isGlob("*z(abc)"));
    assert(isGlob("[1-10].js"));
    assert(isGlob("[^abc].js"));
    assert(isGlob("[a-j]*[^c]b/c"));
    assert(isGlob("[abc].js"));
    assert(isGlob("a/b/c/[a-z].js"));
    assert(isGlob("abc/(aaa|bbb).js"));
    assert(isGlob("abc/*.js"));
    assert(isGlob("abc/{a,b}.js"));
    assert(isGlob("abc/{a..z..2}.js"));
    assert(isGlob("abc/{a..z}.js"));

    assert(!isGlob("$(abc)"));
    assert(!isGlob("&(abc)"));
    assert(!isGlob("Who?.js"));
    assert(!isGlob("? (abc)"));
    assert(!isGlob("?.js"));
    assert(!isGlob("abc/?.js"));

    // should be false if regex characters are escaped
    assert(!isGlob("\\?.js"));
    assert(!isGlob("\\[1-10\\].js"));
    assert(!isGlob("\\[^abc\\].js"));
    assert(!isGlob("\\[a-j\\]\\*\\[^c\\]b/c"));
    assert(!isGlob("\\[abc\\].js"));
    assert(!isGlob("\\a/b/c/\\[a-z\\].js"));
    assert(!isGlob("abc/\\(aaa|bbb).js"));
    assert(!isGlob("abc/\\?.js"));
  },
});

test(function normalizeGlobGlobstar(): void {
  assertEquals(normalizeGlob(`**${SEP}..`, { globstar: true }), `**${SEP}..`);
});

test(function joinGlobsGlobstar(): void {
  assertEquals(joinGlobs(["**", ".."], { globstar: true }), `**${SEP}..`);
});
