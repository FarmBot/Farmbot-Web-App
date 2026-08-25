import {
  parseFilterSetting, imageInRange, notHidden, getImageShownStatusFlags,
  calculateImageAgeInfo,
  filterImagesByType,
  getImageTypeLabel,
} from "../util";
import {
  fakeImage, fakeWebAppConfig,
} from "../../../__test_support__/fake_state/resources";
import {
  GetImageShownStatusFlagsProps, ImageShowFlags,
} from "../../images/interfaces";
import { fakeImageShowFlags } from "../../../__test_support__/fake_camera_data";
import { StringSetting } from "../../../session_keys";
import { fakeDesignerState } from "../../../__test_support__/fake_designer_state";

describe("parseFilterSetting()", () => {
  it("returns set image filter setting", () => {
    const setting = "2017-09-03T20:01:40.336Z";
    expect(parseFilterSetting(() => setting)(StringSetting.photo_filter_begin))
      .toEqual(setting);
  });

  it("returns unset image filter setting", () => {
    const setting = "";
    expect(parseFilterSetting(() => setting)(StringSetting.photo_filter_begin))
      .toEqual(undefined);
  });
});

describe("calculateImageAgeInfo()", () => {
  it("returns image age info", () => {
    const image1 = fakeImage();
    image1.body.created_at = "2020-02-20T20:20:20.000Z";
    const image2 = fakeImage();
    image2.body.created_at = "2010-01-10T10:10:10.000Z";
    const result = calculateImageAgeInfo([image1, image2]);
    expect(result).toEqual({
      newestDate: "2020-02-20T20:20:20.000Z",
      toOldest: 3693,
    });
  });
});

describe("imageInRange()", () => {
  it("is before", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-22T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "";
    expect(imageInRange(image, begin, end).value).toEqual(false);
  });

  it("is after", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "";
    const end = "2018-01-23T05:00:00.000Z";
    expect(imageInRange(image, begin, end).value).toEqual(false);
  });

  it("is within", () => {
    const image = fakeImage();
    image.body.created_at = "2018-01-24T05:00:00.000Z";
    const begin = "2018-01-23T05:00:00.000Z";
    const end = "2018-01-25T05:00:00.000Z";
    expect(imageInRange(image, begin, end).value).toEqual(true);
  });
});

describe("notHidden()", () => {
  it.each<[
    number, number[], number[], boolean, number | undefined, boolean | undefined,
  ]>([
    [1, [], [], false, undefined, true],
    [2, [], [], false, 1, true],
    [3, [], [1], false, 1, true],
    [4, [], [1], true, 1, true],
    [5, [], [], true, 1, false],
    [6, [1], [], true, 1, false],
    [7, [1], [1], true, 1, false],
    [8, [1], [1], false, 1, false],
  ])("is hidden: case %i",
    (_, hiddenImages, shownImages, hideUnShownImages, imageId, expected) => {
      expect(notHidden(
        hiddenImages, shownImages, hideUnShownImages, imageId).value)
        .toEqual(expected);
    });
});

describe("getImageShownStatusFlags()", () => {
  const mockConfig = fakeWebAppConfig();
  mockConfig.body.photo_filter_begin = "";
  mockConfig.body.photo_filter_end = "";

  beforeEach(() => {
    mockConfig.body.show_images = true;
    mockConfig.body.photo_filter_begin = "";
    mockConfig.body.photo_filter_end = "";
  });

  const fakeProps = (): GetImageShownStatusFlagsProps => ({
    image: undefined,
    designer: fakeDesignerState(),
    getConfigValue: key => mockConfig.body[key],
    env: {},
    size: { width: undefined, height: undefined },
  });

  it("returns true flags", () => {
    const p = fakeProps();
    p.image = fakeImage();
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    expectedFlags.notHidden.reason = expect.stringContaining(
      "hidden: []\nshown: []");
    expectedFlags.zMatch.reason = "image z: 0\ncalibration z: none";
    expectedFlags.inRange.reason = expect.stringContaining(
      "begin: none\nend: none\nafterBegin: true\nbeforeEnd: true");
    Object.keys(expectedFlags).map(key => {
      expectedFlags[key as keyof ImageShowFlags].value = true;
    });
    expectedFlags.alwaysShow.value = false;
    expect(flags).toEqual(expectedFlags);
  });

  it("handles missing image", () => {
    const p = fakeProps();
    p.image = undefined;
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    Object.keys(expectedFlags).map(key => {
      expectedFlags[key as keyof ImageShowFlags].value = true;
    });
    expectedFlags.inRange.value = false;
    expectedFlags.alwaysShow.value = false;
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
    p.image.body.meta.name = "calibration";
    p.designer.hiddenImages = [p.image.body.id];
    p.designer.showCalibrationImages = false;
    const flags = getImageShownStatusFlags(p);
    const expectedFlags = fakeImageShowFlags();
    expectedFlags.layerOn.reason = "show_images: false";
    expectedFlags.notHidden.reason = "1\nhidden: [1]\nshown: []";
    expectedFlags.zMatch.reason = "image z: 0\ncalibration z: 100";
    expectedFlags.inRange.reason = expect.stringContaining(
      "afterBegin: true\nbeforeEnd: false");
    expectedFlags.sizeMatch.reason =
      "image size: {}\ncalibration size: {\"width\":200,\"height\":200}";
    expectedFlags.typeShown.reason = "calibration: calibration\nshowPhotoImages: "
      + "true\nshowCalibrationImages: false\nshowDetectionImages: true\n"
      + "showHeightImages: true";
    Object.keys(expectedFlags).map(key => {
      expectedFlags[key as keyof ImageShowFlags].value = false;
    });
    expect(flags).toEqual(expectedFlags);
  });
});

describe("getImageTypeLabel()", () => {
  it.each<[string, string]>([
    ["calibration", "calibration"],
    ["weed detector", "marked"],
    ["soil height", "map"],
    ["photo", "0"],
  ])("returns label for %s images", (expected, imageName) => {
    const image = fakeImage();
    image.body.meta.name = imageName;
    expect(getImageTypeLabel(image).toLowerCase()).toEqual(expected);
  });
});

describe("filterImagesByType()", () => {
  it.each<[string, string, boolean]>([
    ["out photo", "0", false],
    ["out calibration", "calibration", false],
    ["out detection", "marked", false],
    ["out height", "map", false],
    ["photo", "0", true],
    ["calibration", "calibration", true],
    ["detection", "marked", true],
    ["height", "map", true],
  ])("filters %s images", (_type, imageName, expected) => {
    const designer = fakeDesignerState();
    designer.showPhotoImages = expected;
    designer.showCalibrationImages = expected;
    designer.showDetectionImages = expected;
    designer.showHeightImages = expected;
    const image = fakeImage();
    image.body.meta.name = imageName;
    expect(filterImagesByType(designer)(image).value).toEqual(expected);
  });
});
