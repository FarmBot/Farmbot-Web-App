import { FAKE_CROPS } from "../../__test_support__/fake_crops";
jest.mock("../constants", () => ({
  CROPS: FAKE_CROPS,
}));

import { findCrop, findCrops, findIcon, findImage } from "../find";

describe("findCrop()", () => {
  it("finds crop", () => {
    const result = findCrop("mint");
    expect(result.name).toEqual("Mint");
  });

  it("finds custom crop", () => {
    const result = findCrop("foo-bar");
    expect(result.name).toEqual("Foo Bar");
  });
});

describe("findCrops()", () => {
  it("finds crops", () => {
    const result = findCrops("mint");
    expect(Object.keys(result)).toEqual(["mint"]);
  });

  it("finds custom crop", () => {
    const result = findCrops("foo-bar");
    expect(Object.keys(result)).toEqual(["foo-bar"]);
  });
});

describe("findIcon()", () => {
  it("finds crop icon", () => {
    const result = findIcon("mint");
    expect(result).toEqual("/crops/icons/mint.avif");
  });

  it("returns fallback icon", () => {
    const result = findIcon("foo-bar");
    expect(result).toEqual("/crops/icons/generic-plant.avif");
  });
});

describe("findImage()", () => {
  it("finds crop image", () => {
    const result = findImage("mint");
    expect(result).toEqual("/crops/images/mint.jpg");
  });
});
