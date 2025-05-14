import {
  boardType, getFwHardwareValue, getBoardCategory, hasSensors, isExpress, isUpgrade,
} from "../firmware_hardware_support";
import { fakeFbosConfig } from "../../../__test_support__/fake_state/resources";

describe("boardType()", () => {
  it("returns Farmduino", () => {
    expect(boardType("5.0.3.F.extra")).toEqual("farmduino");
  });

  it("returns Farmduino k1.4", () => {
    expect(boardType("5.0.3.G")).toEqual("farmduino_k14");
  });

  it("returns Farmduino k1.5", () => {
    expect(boardType("5.0.3.H")).toEqual("farmduino_k15");
  });

  it("returns Farmduino k1.6", () => {
    expect(boardType("5.0.3.I")).toEqual("farmduino_k16");
  });

  it("returns Farmduino k1.7", () => {
    expect(boardType("5.0.3.J")).toEqual("farmduino_k17");
  });

  it("returns Farmduino k1.8", () => {
    expect(boardType("5.0.3.K")).toEqual("farmduino_k18");
  });

  it("returns Farmduino Express k1.0", () => {
    expect(boardType("5.0.3.E")).toEqual("express_k10");
  });

  it("returns Farmduino Express k1.1", () => {
    expect(boardType("5.0.3.D")).toEqual("express_k11");
  });

  it("returns Farmduino Express k1.2", () => {
    expect(boardType("5.0.3.C")).toEqual("express_k12");
  });

  it("returns Arduino/RAMPS", () => {
    expect(boardType("5.0.3.R")).toEqual("arduino");
  });

  it("returns unknown", () => {
    expect(boardType(undefined)).toEqual("unknown");
    expect(boardType("Arduino Disconnected!")).toEqual("unknown");
    expect(boardType("STUBFW")).toEqual("unknown");
    expect(boardType("0.0.0.S.STUB")).toEqual("unknown");
  });

  it("returns None", () => {
    expect(boardType("none")).toEqual("none");
  });
});

describe("getFwHardwareValue()", () => {
  it("returns undefined", () => {
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "wrong";
    expect(getFwHardwareValue(fbosConfig)).toEqual(undefined);
    expect(getFwHardwareValue(undefined)).toEqual(undefined);
  });

  it("returns real value", () => {
    const fbosConfig = fakeFbosConfig();
    fbosConfig.body.firmware_hardware = "express_k10";
    expect(getFwHardwareValue(fbosConfig)).toEqual("express_k10");
  });
});

describe("getBoardCategory()", () => {
  it("returns category", () => {
    expect(getBoardCategory("1.0.0.R")).toEqual("Arduino");
    expect(getBoardCategory("1.0.0.X")).toEqual("Farmduino");
    expect(getBoardCategory(undefined)).toEqual("Farmduino");
  });
});

describe("hasSensors()", () => {
  it("has sensors", () => {
    expect(hasSensors(undefined)).toEqual(true);
    expect(hasSensors("arduino")).toEqual(true);
    expect(hasSensors("farmduino")).toEqual(true);
  });

  it("doesn't have sensors", () => {
    expect(hasSensors("express_k10")).toEqual(false);
  });
});

describe("isExpress()", () => {
  it("is express", () => {
    expect(isExpress("express_k10")).toEqual(true);
  });

  it("isn't express", () => {
    expect(isExpress(undefined)).toEqual(false);
    expect(isExpress("arduino")).toEqual(false);
    expect(isExpress("farmduino")).toEqual(false);
  });
});

describe("isUpgrade()", () => {
  it("returns result", () => {
    expect(isUpgrade("arduino", "farmduino")).toBeTruthy();
    expect(isUpgrade("arduino", "farmduino_k16")).toBeTruthy();
    expect(isUpgrade("farmduino_k16", "arduino")).toBeFalsy();
    expect(isUpgrade(undefined, "farmduino_k16")).toBeFalsy();
  });
});
