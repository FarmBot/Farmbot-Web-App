import * as Util from "../util";
import { times } from "lodash";

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
      const result = Util.validBotLocationData(undefined);
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

describe("parseIntInput()", () => {
  it("parses int from number input", () => {
    expect(Util.parseIntInput("-1.1e+2")).toEqual(-110);
    expect(Util.parseIntInput("-1.1e-1")).toEqual(0);
    expect(Util.parseIntInput("1.1E1")).toEqual(11);
    expect(Util.parseIntInput("+123")).toEqual(123);
    expect(Util.parseIntInput("1.5")).toEqual(1);
    expect(Util.parseIntInput("e")).toEqual(NaN);
    expect(Util.parseIntInput("")).toEqual(NaN);
  });
});
