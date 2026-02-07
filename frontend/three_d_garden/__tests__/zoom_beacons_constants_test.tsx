let mockIsDesktop = false;

import {
  Camera,
  FOCI,
  getCamera,
  getCameraOffset,
  getFocus,
  getFocusFromUrlParams,
  setUrlParam,
} from "../zoom_beacons_constants";
import { clone } from "lodash";
import { INITIAL } from "../config";
import * as screenSize from "../../screen_size";

let isDesktopSpy: jest.SpyInstance;

beforeEach(() => {
  isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
    .mockImplementation(() => mockIsDesktop);
});

afterEach(() => {
  isDesktopSpy.mockRestore();
});
describe("FOCI()", () => {
  it("returns foci", () => {
    const config = clone(INITIAL);
    expect(FOCI(config)[0].label).toEqual("What you can grow");
    expect(FOCI(config)[0].info.scale).toEqual(3000);
  });

  it("returns FOCI(): XL", () => {
    const config = clone(INITIAL);
    config.sizePreset = "Genesis XL";
    expect(FOCI(config)[0].label).toEqual("What you can grow");
    expect(FOCI(config)[0].info.scale).toEqual(6000);
  });
});

describe("getFocus()", () => {
  it("returns focus", () => {
    const config = clone(INITIAL);
    expect(getFocus(config, "What you can grow").label)
      .toEqual("What you can grow");
  });
});

describe("getCameraOffset()", () => {
  it("returns camera offset: wide", () => {
    mockIsDesktop = true;
    const config = clone(INITIAL);
    const focus = FOCI(config)[0];
    expect(getCameraOffset(focus).position[1]).toEqual(0);
  });

  it("returns camera offset: narrow", () => {
    mockIsDesktop = false;
    const config = clone(INITIAL);
    const focus = FOCI(config)[0];
    expect(getCameraOffset(focus).position[1]).toEqual(-1000);
  });
});

describe("getCamera()", () => {
  it("returns camera", () => {
    const config = clone(INITIAL);
    const fallback: Camera = {
      position: [0, 0, 0],
      target: [0, 0, 0],
    };
    expect(getCamera(config, "What you can grow", fallback).position[0])
      .toEqual(0);
  });
});

describe("setUrlParam()", () => {
  let pushStateSpy: jest.SpyInstance;
  const getPushedUrl = () => {
    const pushedUrl: unknown = pushStateSpy.mock.calls[0]?.[2];
    if (typeof pushedUrl !== "string") {
      throw new Error("Expected pushState URL to be a string");
    }
    return new URL(pushedUrl);
  };

  beforeEach(() => {
    pushStateSpy = jest.spyOn(history, "pushState").mockImplementation(jest.fn());
  });

  afterEach(() => {
    pushStateSpy.mockRestore();
  });

  it("sets URL param", () => {
    history.replaceState(undefined, "", "/app/designer");
    setUrlParam("focus", "What you can grow");
    const url = getPushedUrl();
    expect(url.searchParams.get("focus")).toEqual("What you can grow");
  });

  it("removes URL param", () => {
    history.replaceState(undefined, "", "/app/designer?focus=What+you+can+grow");
    setUrlParam("focus", "");
    const url = getPushedUrl();
    expect(url.searchParams.get("focus")).toBeNull();
  });
});

describe("getFocusFromUrlParams()", () => {
  it("returns focus", () => {
    window.location.search = "?focus=What+you+can+grow";
    expect(getFocusFromUrlParams()).toEqual("What you can grow");
  });

  it("returns default", () => {
    window.location.search = "";
    expect(getFocusFromUrlParams()).toEqual("");
  });
});
