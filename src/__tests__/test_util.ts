import {
  prettyPrintApiErrors,
  defensiveClone,
  getParam,
  betterCompact,
  safeStringFetch,
  oneOf,
  semverCompare,
  SemverResult
} from "../util";
describe("util", () => {
  describe("safeStringFetch", () => {
    let data = {
      "null": null,
      "undefined": undefined,
      "number": 0,
      "string": "hello",
      "boolean": false,
      "other": () => { "not allowed!" }
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
      let before = [{}, {}, undefined];
      let after = betterCompact(before);
      expect(after.length).toBe(2);
      expect(after).not.toContain(undefined);
    });
  });

  describe("defensiveClone", () => {
    it("deep clones any serializable object", () => {
      let origin = { a: "b", c: 2, d: [{ e: { f: "g" } }] };
      let child = defensiveClone(origin);
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
      let result = prettyPrintApiErrors({
        response: {
          data: {
            email: "can't be blank"
          }
        }
      });
      expect(result).toEqual("Email: can't be blank.");
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
    })
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
    });
  })
});
