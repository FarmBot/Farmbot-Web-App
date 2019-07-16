import { boardType } from "../firmware_hardware_support";

describe("boardType()", () => {
  it("returns Farmduino", () => {
    expect(boardType("5.0.3.F")).toEqual("farmduino");
  });

  it("returns Farmduino k1.4", () => {
    expect(boardType("5.0.3.G")).toEqual("farmduino_k14");
  });

  it("returns Farmduino Express k1.0", () => {
    expect(boardType("5.0.3.E")).toEqual("express_k10");
  });

  it("returns Arduino/RAMPS", () => {
    expect(boardType("5.0.3.R")).toEqual("arduino");
  });

  it("returns unknown", () => {
    expect(boardType(undefined)).toEqual("unknown");
    expect(boardType("Arduino Disconnected!")).toEqual("unknown");
    expect(boardType("STUBFW")).toEqual("unknown");
  });

  it("returns None", () => {
    expect(boardType("none")).toEqual("none");
  });
});
