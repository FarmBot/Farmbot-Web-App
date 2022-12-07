import * as Util from "../util";
import { fakeTimeSettings } from "../../__test_support__/fake_time_settings";

describe("util", () => {
  describe("scrollToBottom", () => {
    it("returns early if element is not found", () => {
      document.body.innerHTML =
        "<div>" +
        "  <button id=\"button\" />" +
        "</div>";
      jest.useFakeTimers();
      Util.scrollToBottom("wow");
      jest.runAllTimers();
    });

    it("scrolls to bottom when an element is found", () => {
      document.body.innerHTML =
        "<div>" +
        "  <span id=\"wow\" />" +
        "  <button id=\"button\" />" +
        "</div>";
      const el = document.getElementById("wow");
      Object.defineProperty(el, "scrollHeight", { value: 10, configurable: true });
      expect(el?.scrollTop).toEqual(0);
      jest.useFakeTimers();
      Util.scrollToBottom("wow");
      jest.runAllTimers();
      expect(el?.scrollTop).toEqual(10);
    });
  });

  describe("betterCompact", () => {
    it("removes falsy values", () => {
      const before = [{}, {}, undefined];
      const after: ({} | undefined)[] = Util.betterCompact(before);
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

describe("timeFormatString()", () => {
  it("returns 12hr time format", () => {
    const timeSettings = fakeTimeSettings();
    timeSettings.hour24 = false;
    expect(Util.timeFormatString(timeSettings)).toEqual("h:mma");
    timeSettings.seconds = true;
    expect(Util.timeFormatString(timeSettings)).toEqual("h:mm:ssa");
  });

  it("returns 24hr time format", () => {
    const timeSettings = fakeTimeSettings();
    timeSettings.hour24 = true;
    expect(Util.timeFormatString(timeSettings)).toEqual("H:mm");
    timeSettings.seconds = true;
    expect(Util.timeFormatString(timeSettings)).toEqual("H:mm:ss");
  });

  it("handles undefined time settings", () => {
    expect(Util.timeFormatString(undefined)).toEqual("h:mma");
  });
});
