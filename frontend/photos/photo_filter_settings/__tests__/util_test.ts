import {
  parseFilterSetting, imageInRange, imageIsHidden, getImageShownStatusFlags,
} from "../util";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  GetImageShownStatusFlagsProps, ImageShowFlags,
} from "../../images/interfaces";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";

describe("parseFilterSetting()", () => {
  it("returns set image filter setting", () => {
    const setting = "2017-09-03T20:01:40.336Z";
    expect(parseFilterSetting(() => setting)("photo_filter_begin"))
      .toEqual(setting);
  });

  it("returns unset image filter setting", () => {
    const setting = "";
    expect(parseFilterSetting(() => setting)("photo_filter_begin"))
      .toEqual(undefined);
  });
});

describe("imageInRange()", () => {
  it("is before", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-22T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "";
    expect(imageInRange(image, begin, end)).toEqual(false);
  });

  it("is after", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "";
    const end = "2018-01-23T05:00:00.000Z";
    expect(imageInRange(image, begin, end)).toEqual(false);
  });

  it("is within", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "2018-01-25T05:00:00.000Z";
    expect(imageInRange(image, begin, end)).toEqual(true);
  });
});

describe("imageIsHidden()", () => {
  it.each<[
    number, number[], number[], boolean, number | undefined, boolean | undefined,
  ]>([
    [1, [], [], false, undefined, undefined],
    [2, [], [], false, 1, false],
    [3, [], [1], false, 1, false],
    [4, [], [1], true, 1, false],
    [5, [], [], true, 1, true],
    [6, [1], [], true, 1, true],
    [7, [1], [1], true, 1, true],
    [8, [1], [1], false, 1, true],
  ])("is hidden: case %s",
    (_, hiddenImages, shownImages, hideUnShownImages, imageId, expected) => {
      expect(imageIsHidden(
        hiddenImages, shownImages, hideUnShownImages, imageId))
        .toEqual(expected);
    });
});

describe("getImageShownStatusFlags()", () => {
  const mockConfig = fakeWebAppConfig();
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  const fakeProps = (): GetImageShownStatusFlagsProps => ({
    image: undefined,
    hiddenImages: [],
    getConfigValue: key => mockConfig.body[key],
    env: {},
    size: { width: undefined, height: undefined },
  });

  it("returns true flags", () => {
    mockConfig.body.show_images = true;
    const p = fakeProps();
    p.image = fakeImage();
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    Object.keys(expectedFlags).map((key: keyof ImageShowFlags) => {
      expectedFlags[key] = true;
    });
    expect(flags).toEqual(expectedFlags);
  });

  it("handles missing image", () => {
    mockConfig.body.show_images = true;
    const p = fakeProps();
    p.image = undefined;
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    Object.keys(expectedFlags).map((key: keyof ImageShowFlags) => {
      expectedFlags[key] = true;
    });
    expectedFlags.inRange = false;
    expect(flags).toEqual(expectedFlags);
  });

  it("returns false flags", () => {
    mockConfig.body.show_images = false;
    mockConfig.body.photo_filter_begin = "2018-01-22T05:00:00.000Z";
    mockConfig.body.photo_filter_end = "2018-02-22T05:00:00.000Z";
    const p = fakeProps();
    p.env = {
      CAMERA_CALIBRATION_camera_z: "100",
      CAMERA_CALIBRATION_center_pixel_location_x: "100",
      CAMERA_CALIBRATION_center_pixel_location_y: "100",
    };
    p.image = fakeImage();
    p.image.body.id = 1;
    p.image.body.created_at = "2018-03-22T05:00:00.000Z";
    p.image.body.meta.z = 0;
    p.hiddenImages = [p.image.body.id];
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    Object.keys(expectedFlags).map((key: keyof ImageShowFlags) => {
      expectedFlags[key] = false;
    });
    expect(flags).toEqual(expectedFlags);
  });
});
