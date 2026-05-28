import {
  findCropIcon, findCropMetadata, normalizeCropSlug,
} from "../metadata";

describe("findCropMetadata()", () => {
  it("finds crop display data", () => {
    const result = findCropMetadata("mint");
    expect(result.name).toEqual("Mint");
    expect(result.spread).toEqual(75);
    expect(result.icon).toEqual("/crops/icons/mint.avif");
  });

  it("finds custom crop display data", () => {
    const result = findCropMetadata("foo-bar");
    expect(result.name).toEqual("Foo Bar");
    expect(result.spread).toEqual(0);
  });
});

describe("findCropIcon()", () => {
  it("finds crop icon", () => {
    expect(findCropIcon("mint")).toEqual("/crops/icons/mint.avif");
  });

  it("finds alias crop icon", () => {
    expect(findCropIcon("lettuce")).toEqual("/crops/icons/looseleaf-lettuce.avif");
  });

  it("returns fallback icon", () => {
    expect(findCropIcon("foo-bar")).toEqual("/crops/icons/generic-plant.avif");
  });
});

describe("normalizeCropSlug()", () => {
  it("normalizes crop slugs", () => {
    expect(normalizeCropSlug("Anaheim Pepper")).toEqual("anaheim-pepper");
  });
});
