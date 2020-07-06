import * as React from "react";
import {
  MapImage, MapImageProps, closestRotation, largeCrop, cropAmount,
} from "../map_image";
import { SpecialStatus } from "farmbot";
import { cloneDeep } from "lodash";
import { trim } from "../../../../../util";
import {
  fakeMapTransformProps,
} from "../../../../../__test_support__/map_transform_props";
import { svgMount } from "../../../../../__test_support__/svg_mount";
import {
  fakeCameraCalibrationData,
} from "../../../../../__test_support__/fake_camera_data";

const NOT_DISPLAYED = "<svg><image></image></svg>";

describe("<MapImage />", () => {
  const fakeProps = (): MapImageProps => {
    return {
      image: {
        body: {
          attachment_processed_at: "",
          attachment_url: "image_url",
          created_at: "",
          device_id: 1,
          id: 1,
          updated_at: "",
          meta: { x: undefined, y: undefined, z: undefined }
        },
        kind: "Image",
        specialStatus: SpecialStatus.DIRTY,
        uuid: "Image.0.1"
      },
      cameraCalibrationData: fakeCameraCalibrationData(),
      mapTransformProps: fakeMapTransformProps(),
      cropImage: false,
    };
  };

  it("doesn't render image", () => {
    const wrapper = svgMount(<MapImage {...fakeProps()} />);
    expect(wrapper.html()).toEqual(NOT_DISPLAYED);
  });

  it("renders pre-calibration preview", () => {
    const p = fakeProps();
    p.image && (p.image.body.meta = { x: 0, y: 0, z: 0 });
    const wrapper = svgMount(<MapImage {...p} />);
    wrapper.find(MapImage).setState({ width: 100, height: 100 });
    expect(wrapper.html()).toContain("image_url");
  });

  it("gets image size", () => {
    const p = fakeProps();
    p.image && (p.image.body.meta = { x: 0, y: 0, z: 0 });
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.find(MapImage).state()).toEqual({ width: 0, height: 0 });
    const img = new Image();
    img.width = 100;
    img.height = 200;
    wrapper.find<MapImage>(MapImage).instance().imageCallback(img)();
    expect(wrapper.find(MapImage).state()).toEqual({ width: 100, height: 200 });
  });

  interface ExpectedData {
    size: { width: number, height: number };
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    cropPath?: string;
  }

  interface ExtraTranslationData {
    rot: number;
    sx: number;
    sy: number;
    tx: number;
    ty: number;
  }

  const renderedTest =
    (num: number,
      inputData: MapImageProps[],
      expectedData: ExpectedData,
      extra?: ExtraTranslationData) => {
      it(`renders image: INPUT_SET_${num}`, () => {
        const wrapper = svgMount(<MapImage {...inputData[num]} />);
        wrapper.find(MapImage).setState({ width: 480, height: 640 });
        expect(wrapper.find("image").props()).toEqual({
          xlinkHref: "image_url",
          x: 0,
          y: 0,
          width: expectedData.size.width,
          height: expectedData.size.height,
          clipPath: expectedData.cropPath || "none",
          transform: trim(`scale(${expectedData.sx}, ${expectedData.sy})
      translate(${expectedData.tx}, ${expectedData.ty})`)
            + (extra ? trim(` rotate(${extra.rot}) scale(${extra.sx}, ${extra.sy})
      translate(${extra.tx}, ${extra.ty})`) : "")
        });
      });
    };

  const INPUT_SET_1 = fakeProps();
  INPUT_SET_1.image && (INPUT_SET_1.image.body.meta.x = 0);
  INPUT_SET_1.image && (INPUT_SET_1.image.body.meta.y = 0);
  INPUT_SET_1.image && (INPUT_SET_1.image.body.meta.z = 0);
  INPUT_SET_1.image && (INPUT_SET_1.image.body.meta.name = "rotated_image");
  INPUT_SET_1.cameraCalibrationData = {
    offset: { x: "50", y: "75" },
    center: { x: "10", y: "20" },
    origin: "\"TOP_RIGHT\"",
    rotation: "-57.45",
    scale: "0.8041",
    calibrationZ: "0"
  };
  INPUT_SET_1.mapTransformProps = fakeMapTransformProps();
  INPUT_SET_1.mapTransformProps.gridSize = { x: 5900, y: 2900 },
    INPUT_SET_1.mapTransformProps.quadrant = 3;

  const INPUT_SET_2 = cloneDeep(INPUT_SET_1);
  INPUT_SET_2.image && (INPUT_SET_2.image.body.meta = {
    x: 221, y: 308, z: 1, name: "marked_image"
  });
  INPUT_SET_2.cameraCalibrationData.origin = "TOP_RIGHT";
  INPUT_SET_2.mapTransformProps.quadrant = 1;

  const INPUT_SET_3 = cloneDeep(INPUT_SET_2);
  INPUT_SET_3.mapTransformProps.quadrant = 2;
  INPUT_SET_3.image && (INPUT_SET_3.image.body.meta.name = "calibration_result");

  const INPUT_SET_4 = cloneDeep(INPUT_SET_3);
  INPUT_SET_4.mapTransformProps.quadrant = 3;

  const INPUT_SET_5 = cloneDeep(INPUT_SET_4);
  INPUT_SET_5.mapTransformProps.quadrant = 4;

  const INPUT_SET_6 = cloneDeep(INPUT_SET_5);
  INPUT_SET_6.cameraCalibrationData.origin = "BOTTOM_LEFT";

  const INPUT_SET_7 = cloneDeep(INPUT_SET_6);
  INPUT_SET_7.cameraCalibrationData.origin = "BOTTOM_RIGHT";

  const INPUT_SET_8 = cloneDeep(INPUT_SET_6);
  INPUT_SET_8.cameraCalibrationData.origin = "TOP_LEFT";

  const INPUT_SET_9 = cloneDeep(INPUT_SET_7);
  INPUT_SET_9.mapTransformProps.xySwap = true;

  const INPUT_SET_10 = cloneDeep(INPUT_SET_1);
  INPUT_SET_10.cameraCalibrationData.rotation = "10";
  INPUT_SET_10.cropImage = true;

  const INPUT_SET_11 = cloneDeep(INPUT_SET_10);
  INPUT_SET_11.cameraCalibrationData.rotation = "47";

  const INPUT_SET_12 = cloneDeep(INPUT_SET_6);
  INPUT_SET_12.mapTransformProps.xySwap = true;

  const INPUT_SET_13 = cloneDeep(INPUT_SET_7);
  INPUT_SET_13.mapTransformProps.xySwap = true;

  const INPUT_SET_14 = cloneDeep(INPUT_SET_8);
  INPUT_SET_14.mapTransformProps.xySwap = true;

  const INPUT_SET_15 = cloneDeep(INPUT_SET_14);
  INPUT_SET_15.cameraCalibrationData.origin = "TOP_RIGHT";
  INPUT_SET_14.mapTransformProps.xySwap = true;

  const DATA = [
    INPUT_SET_1,
    INPUT_SET_1, INPUT_SET_2, INPUT_SET_3, INPUT_SET_4, INPUT_SET_5,
    INPUT_SET_6, INPUT_SET_7, INPUT_SET_8, INPUT_SET_9, INPUT_SET_10,
    INPUT_SET_11, INPUT_SET_12, INPUT_SET_13, INPUT_SET_14, INPUT_SET_15,
  ];

  const expectedSize = { width: 385.968, height: 514.624 };

  renderedTest(1, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -242.984, ty: -3082.312
  });
  renderedTest(2, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 5436.016, ty: 125.688
  });
  renderedTest(3, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -463.984, ty: 125.688
  });
  renderedTest(4, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -463.984, ty: -2774.312
  });
  renderedTest(5, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: 5436.016, ty: -2774.312
  });
  renderedTest(6, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -5821.984, ty: 2259.688
  });
  renderedTest(7, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 5436.016, ty: 2259.688
  });
  renderedTest(8, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -5821.984, ty: -2774.312
  });
  renderedTest(9, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 2388.344, ty: 5307.36
  }, { rot: 90, sx: -1, sy: 1, tx: -514.624, ty: -385.968 });
  renderedTest(10, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -242.984, ty: -3082.312,
    cropPath: "url(#rectangle-1)",
  });
  renderedTest(11, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -242.984, ty: -3082.312,
    cropPath: "url(#circle-1)",
  });
  renderedTest(12, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -2774.312, ty: 5307.36
  }, { rot: 90, sx: -1, sy: 1, tx: -514.624, ty: -514.624 });
  renderedTest(13, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 2388.344, ty: 5307.36
  }, { rot: 90, sx: -1, sy: 1, tx: -514.624, ty: -385.968 });
  renderedTest(14, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -2774.312, ty: -5821.984
  }, { rot: 90, sx: -1, sy: 1, tx: -385.968, ty: -514.624 });
  renderedTest(15, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: 2388.344, ty: -5821.984
  }, { rot: 90, sx: -1, sy: 1, tx: -385.968, ty: -385.968 });

  it("doesn't render placeholder image", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image && (p.image.body.attachment_url = "/placehold.");
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual(NOT_DISPLAYED);
  });

  it("doesn't render image taken at different height than calibration", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image && (p.image.body.meta.z = 100);
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual(NOT_DISPLAYED);
  });

  it("doesn't render images that are not adjusted for camera rotation", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image && (p.image.body.meta.name = "na");
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual(NOT_DISPLAYED);
  });
});

describe("closestRotation()", () => {
  it("returns correct angles", () => {
    expect(closestRotation(0)).toEqual(0);
    expect(closestRotation(44)).toEqual(44);
    expect(closestRotation(89)).toEqual(1);
    expect(closestRotation(91)).toEqual(1);
    expect(closestRotation(134)).toEqual(44);
    expect(closestRotation(179)).toEqual(1);
  });
});

describe("largeCrop()", () => {
  it("returns correct states", () => {
    expect(largeCrop(0)).toEqual(false);
    expect(largeCrop(10)).toEqual(false);
    expect(largeCrop(41)).toEqual(true);
    expect(largeCrop(80)).toEqual(false);
  });
});

describe("cropAmount()", () => {
  it("returns correct crop amounts", () => {
    const size = { width: 10, height: 100 };
    expect(cropAmount(0, size)).toEqual(0);
    expect(cropAmount(2, size)).toEqual(4);
    expect(cropAmount(10, size)).toEqual(14);
    expect(cropAmount(20, size)).toEqual(23);
    expect(cropAmount(30, size)).toEqual(30);
    expect(cropAmount(40, size)).toEqual(34);
  });
});
