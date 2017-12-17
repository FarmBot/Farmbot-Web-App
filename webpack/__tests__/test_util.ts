import {
  prettyPrintApiErrors,
  defensiveClone,
  getParam,
  betterCompact,
  safeStringFetch,
  oneOf,
  semverCompare,
  SemverResult,
  trim,
  bitArray,
  withTimeout,
  minFwVersionCheck,
  move,
  shortRevision,
  clampUnsignedInteger,
  isUndefined,
  IntegerSize
} from "../util";
describe("util", () => {
  describe("safeStringFetch", () => {
    const data = {
      // tslint:disable-next-line:no-null-keyword
      "null": null,
      "undefined": undefined,
      "number": 0,
      "string": "hello",
      "boolean": false,
      "other": () => { "not allowed!"; }
    };

    it("fetches null", () => {
      expect(safeStringFetch(data, "null")).toEqual("");
    });

    it("fetches undefined", () => {
      expect(safeStringFetch(data, "undefined")).toEqual("");
    });

    it("fetches number", () => {
      expect(safeStringFetch(data, "number")).toEqual("0");
    });

    it("fetches string", () => {
      expect(safeStringFetch(data, "string")).toEqual("hello");
    });

    it("fetches boolean", () => {
      expect(safeStringFetch(data, "boolean")).toEqual("false");
    });

    it("handles others with exception", () => {
      expect(() => safeStringFetch(data, "other")).toThrow();
    });
  });

  describe("betterCompact", () => {
    it("removes falsy values", () => {
      const before = [{}, {}, undefined];
      const after = betterCompact(before);
      expect(after.length).toBe(2);
      expect(after).not.toContain(undefined);
    });
  });

  describe("defensiveClone", () => {
    it("deep clones any serializable object", () => {
      const origin = { a: "b", c: 2, d: [{ e: { f: "g" } }] };
      const child = defensiveClone(origin);
      origin.a = "--";
      origin.c = 0;
      origin.d[0].e.f = "--";
      expect(child).not.toBe(origin);
      expect(child.a).toEqual("b");
      expect(child.c).toEqual(2);
      expect(child.d[0].e.f).toEqual("g");
    });
  });

  describe("getParam", () => {
    it("gets params", () => {
      Object.defineProperty(window.location, "search", {
        writable: true,
        value: "?foo=bar&baz=wow"
      });
      expect(getParam("foo")).toEqual("bar");
      expect(getParam("baz")).toEqual("wow");
      expect(getParam("blah")).toEqual("");
    });
  });

  describe("prettyPrintApiErrors", () => {
    it("handles properly formatted API error messages", () => {
      const result = prettyPrintApiErrors({
        response: {
          data: {
            email: "can't be blank"
          }
        }
      });
      expect(result).toEqual("Email: can't be blank");
    });
  });

  describe("oneOf()", () => {
    it("determines matches", () => {
      expect(oneOf(["foo"], "foobar")).toBeTruthy();
      expect(oneOf(["foo", "baz"], "foo bar baz")).toBeTruthy();
    });

    it("determines non-matches", () => {
      expect(oneOf(["foo"], "QMMADSDASDASD")).toBeFalsy();
      expect(oneOf(["foo", "baz"], "nothing to see here.")).toBeFalsy();
    });
  });

  describe("semver compare", () => {
    it("knows when RIGHT_IS_GREATER", () => {
      expect(semverCompare("3.1.6", "4.0.0"))
        .toBe(SemverResult.RIGHT_IS_GREATER);

      expect(semverCompare("2.1.6", "4.1.0"))
        .toBe(SemverResult.RIGHT_IS_GREATER);

      expect(semverCompare("4.1.6", "5.1.9"))
        .toBe(SemverResult.RIGHT_IS_GREATER);

      expect(semverCompare("1.1.9", "2.0.2"))
        .toBe(SemverResult.RIGHT_IS_GREATER);

      expect(semverCompare("", "1.0.0"))
        .toBe(SemverResult.RIGHT_IS_GREATER);
    });

    it("knows when LEFT_IS_GREATER", () => {
      expect(semverCompare("4.0.0", "3.1.6"))
        .toBe(SemverResult.LEFT_IS_GREATER);

      expect(semverCompare("4.1.0", "2.1.6"))
        .toBe(SemverResult.LEFT_IS_GREATER);

      expect(semverCompare("5.1.9", "4.1.6"))
        .toBe(SemverResult.LEFT_IS_GREATER);

      expect(semverCompare("2.0.2", "1.1.9"))
        .toBe(SemverResult.LEFT_IS_GREATER);

      expect(semverCompare("1.0.0", ""))
        .toBe(SemverResult.LEFT_IS_GREATER);
    });
  });
});

describe("trim()", () => {
  it("formats whitespace", () => {
    const string = `foo
      bar`;
    const formattedString = trim(string);
    expect(formattedString).toEqual("foo bar");
  });
});

describe("bitArray", () => {
  it("converts flags to numbers", () => {
    expect(bitArray(true)).toBe(0b1);
    expect(bitArray(true, false)).toBe(0b10);
    expect(bitArray(false, true)).toBe(0b01);
    expect(bitArray(true, true)).toBe(0b11);
  });
});

describe("withTimeout()", () => {
  it("rejects promises that do not meet a particular deadline", (done) => {
    const p = new Promise(res => setTimeout(() => res("Done"), 10));
    withTimeout(1, p).then(fail, (y) => {
      expect(y).toContain("Timed out");
      done();
    });
  });

  it("resolves promises that meet a particular deadline", (done) => {
    withTimeout(10, new Promise(res => setTimeout(() => res("Done"), 1)))
      .then(y => {
        expect(y).toContain("Done");
        done();
      }, fail);
  });
});

describe("minFwVersionCheck()", () => {
  it("firmware version meets or exceeds minimum", () => {
    expect(minFwVersionCheck("1.0.1R", "1.0.1")).toBeTruthy();
    expect(minFwVersionCheck("1.0.2F", "1.0.1")).toBeTruthy();
  });

  it("firmware version doesn't meet minimum", () => {
    expect(minFwVersionCheck("1.0.0R", "1.0.1")).toBeFalsy();
    expect(minFwVersionCheck(undefined, "1.0.1")).toBeFalsy();
    expect(minFwVersionCheck("1.0.0", "1.0.1")).toBeFalsy();
  });
});

describe("move()", () => {
  it("shuffles array elems", () => {
    const fixture = [0, 1, 2];
    const case1 = move(fixture, 0, 2);
    expect(case1[0]).toEqual(1);
    expect(case1[1]).toEqual(2);
    expect(case1[2]).toEqual(0);

    const case2 = move(fixture, 1, 0);
    expect(case2[0]).toEqual(1);
    expect(case2[1]).toEqual(0);
    expect(case2[2]).toEqual(2);

    const case3 = move(fixture, 0, 0);
    expect(case3).toEqual(fixture);
  });
});

describe("shortRevision()", () => {
  it("none", () => {
    globalConfig.SHORT_REVISION = "";
    const short = shortRevision();
    expect(short).toEqual("NONE");
  });

  it("slices", () => {
    globalConfig.SHORT_REVISION = "0123456789";
    const short = shortRevision();
    expect(short).toEqual("01234567");
  });
});

describe("clampUnsignedInteger()", () => {
  function clampTest(
    input: string,
    output: number | undefined,
    message: string,
    size: IntegerSize) {
    it(`${size}: ${message}`, () => {
      const result = clampUnsignedInteger(input, size);
      expect(result.outcome).toEqual(message);
      expect(result.result).toEqual(output);
    });
  }
  clampTest("nope", undefined, "malformed", "short");
  clampTest("100000", 32000, "high", "short");
  clampTest("-100000", 0, "low", "short");
  clampTest("1000", 1000, "ok", "short");
  clampTest("1000000", 1000000, "ok", "long");
  clampTest("-1000000", 0, "low", "long");
});

describe("isUndefined()", () => {
  it("undefined", () => {
    const result = isUndefined(undefined);
    expect(result).toBeTruthy();
  });

  it("defined", () => {
    const result = isUndefined({});
    expect(result).toBeFalsy();
  });
});
