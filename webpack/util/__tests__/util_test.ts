import * as Util from "../util";
import { times } from "lodash";
import { validBotLocationData } from "../index";
import { parseClassNames } from "../../ui/util";
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
      expect(Util.safeStringFetch(data, "null")).toEqual("");
    });

    it("fetches undefined", () => {
      expect(Util.safeStringFetch(data, "undefined")).toEqual("");
    });

    it("fetches number", () => {
      expect(Util.safeStringFetch(data, "number")).toEqual("0");
    });

    it("fetches string", () => {
      expect(Util.safeStringFetch(data, "string")).toEqual("hello");
    });

    it("fetches boolean", () => {
      expect(Util.safeStringFetch(data, "boolean")).toEqual("false");
    });

    it("handles others with exception", () => {
      expect(() => Util.safeStringFetch(data, "other")).toThrow();
    });
  });

  describe("betterCompact", () => {
    it("removes falsy values", () => {
      const before = [{}, {}, undefined];
      const after = Util.betterCompact(before);
      expect(after.length).toBe(2);
      expect(after).not.toContain(undefined);
    });
  });

  describe("defensiveClone", () => {
    it("deep clones any serializable object", () => {
      const origin = { a: "b", c: 2, d: [{ e: { f: "g" } }] };
      const child = Util.defensiveClone(origin);
      origin.a = "--";
      origin.c = 0;
      origin.d[0].e.f = "--";
      expect(child).not.toBe(origin);
      expect(child.a).toEqual("b");
      expect(child.c).toEqual(2);
      expect(child.d[0].e.f).toEqual("g");
    });
  });

  describe("oneOf()", () => {
    it("determines matches", () => {
      expect(Util.oneOf(["foo"], "foobar")).toBeTruthy();
      expect(Util.oneOf(["foo", "baz"], "foo bar baz")).toBeTruthy();
    });

    it("determines non-matches", () => {
      expect(Util.oneOf(["foo"], "QMMADSDASDASD")).toBeFalsy();
      expect(Util.oneOf(["foo", "baz"], "nothing to see here.")).toBeFalsy();
    });
  });

  describe("trim()", () => {
    it("formats whitespace", () => {
      const string = `foo
      bar`;
      const formattedString = Util.trim(string);
      expect(formattedString).toEqual("foo bar");
    });
  });

  describe("bitArray", () => {
    it("converts flags to numbers", () => {
      expect(Util.bitArray(true)).toBe(0b1);
      expect(Util.bitArray(true, false)).toBe(0b10);
      expect(Util.bitArray(false, true)).toBe(0b01);
      expect(Util.bitArray(true, true)).toBe(0b11);
    });
  });

  describe("withTimeout()", () => {
    it("rejects promises that do not meet a particular deadline", (done) => {
      const p = new Promise(res => setTimeout(() => res("Done"), 10));
      Util.withTimeout(1, p).then(fail, (y) => {
        expect(y).toContain("Timed out");
        done();
      });
    });

    it("resolves promises that meet a particular deadline", (done) => {
      Util.withTimeout(10, new Promise(res => setTimeout(() => res("Done"), 1)))
        .then(y => {
          expect(y).toContain("Done");
          done();
        }, fail);
    });
  });

  describe("shortRevision()", () => {
    it("none", () => {
      globalConfig.SHORT_REVISION = "";
      const short = Util.shortRevision();
      expect(short).toEqual("NONE");
    });

    it("slices", () => {
      globalConfig.SHORT_REVISION = "0123456789";
      const short = Util.shortRevision();
      expect(short).toEqual("01234567");
    });
  });

  describe("isUndefined()", () => {
    it("undefined", () => {
      const result = Util.isUndefined(undefined);
      expect(result).toBeTruthy();
    });

    it("defined", () => {
      const result = Util.isUndefined({});
      expect(result).toBeFalsy();
    });
  });

  describe("randomColor()", () => {
    it("only picks valid colors", () => {
      times(Util.colors.length * 1.5, () =>
        expect(Util.colors).toContain(Util.randomColor()));
    });
  });

  describe("validBotLocationData()", () => {
    it("returns valid location_data object", () => {
      const result = validBotLocationData(undefined);
      expect(result).toEqual({
        position: { x: undefined, y: undefined, z: undefined },
        scaled_encoders: { x: undefined, y: undefined, z: undefined },
        raw_encoders: { x: undefined, y: undefined, z: undefined }
      });
    });
  });

  describe("fancyDebug()", () => {
    it("debugs in a fanciful manner", () => {
      const test = { testing: "fancy debug" };
      console.log = jest.fn();
      const result = Util.fancyDebug(test);
      expect(result).toBe(test);
      expect(console.log)
        .toHaveBeenCalledWith("             testing => \"fancy debug\"");
    });
  });

});

describe("parseClassNames", () => {
  it("parses class names correctly", () => {
    const base = "hello, base.";
    const results = parseClassNames({
      xs: 1,
      sm: 2,
      md: 3,
      lg: 4,
      xsOffset: 5,
      smOffset: 6,
      mdOffset: 7,
      lgOffset: 8,
    }, base);

    [
      base,
      "col-xs-1",
      "col-sm-2",
      "col-md-3",
      "col-lg-4",
      "col-xs-offset-5",
      "col-sm-offset-6",
      "col-md-offset-7",
      "col-lg-offset-8",
    ].map(string => expect(results).toContain(string));
  });
});
