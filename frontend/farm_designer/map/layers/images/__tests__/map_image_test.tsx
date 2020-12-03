import React from "react";
import {
  MapImage, MapImageProps, closestRotation, largeCrop, cropAmount,
  rotated90degrees,
  imageSizeCheck,
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

const NOT_DISPLAYED = "image-not-shown";

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
      hoveredMapImage: undefined,
      highlighted: false,
    };
  };

  it("doesn't render image", () => {
    const wrapper = svgMount(<MapImage {...fakeProps()} />);
    expect(wrapper.html()).toContain(NOT_DISPLAYED);
  });

  it("renders pre-calibration preview", () => {
    const p = fakeProps();
    p.image.body.meta = { x: 0, y: 0, z: 0 };
    const wrapper = svgMount(<MapImage {...p} />);
    wrapper.find(MapImage).setState({ imageWidth: 100, imageHeight: 100 });
    expect(wrapper.html()).toContain("image_url");
  });

  it("gets image size", () => {
    const p = fakeProps();
    p.image.body.meta = { x: 0, y: 0, z: 0 };
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.find(MapImage).state())
      .toEqual({ imageWidth: 0, imageHeight: 0 });
    const img = new Image();
    img.width = 100;
    img.height = 200;
    wrapper.find<MapImage>(MapImage).instance().imageCallback(img)();
    expect(wrapper.find(MapImage).state())
      .toEqual({ imageWidth: 100, imageHeight: 200 });
  });

  interface ExpectedData {
    size: { width: number, height: number };
    sx: number;
    sy: number;
    tx: number;
    ty: number;
    cropPath?: string;
    tOriginX: number,
    tOriginY: number,
    rotate: number;
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
        wrapper.find(MapImage).setState({ imageWidth: 480, imageHeight: 640 });
        expect(wrapper.find("image").props()).toEqual({
          xlinkHref: "image_url",
          x: 0,
          y: 0,
          width: expectedData.size.width,
          height: expectedData.size.height,
          clipPath: expectedData.cropPath || "none",
          "data-comment": expect.any(String),
          opacity: 1,
          style: {
            transformOrigin:
              `${expectedData.tOriginX}px ${expectedData.tOriginY}px`,
            transform: trim(`scale(${expectedData.sx}, ${expectedData.sy})
                       translate(${expectedData.tx}px, ${expectedData.ty}px)`)
              + (extra
                ? trim(` scale(${extra.sx}, ${extra.sy})
                       translate(${extra.tx}px, ${extra.ty}px)`)
                : "") + ` rotate(${expectedData.rotate}deg)`
          },
        });
      });
    };

  const INPUT_SET_1 = fakeProps();
  INPUT_SET_1.image.body.meta.x = 0;
  INPUT_SET_1.image.body.meta.y = 0;
  INPUT_SET_1.image.body.meta.z = 0;
  INPUT_SET_1.image.body.meta.name = "rotated_image";
  INPUT_SET_1.cameraCalibrationData = {
    offset: { x: "50", y: "75" },
    center: { x: "240", y: "320" },
    origin: "\"TOP_RIGHT\"",
    rotation: "-37.45",
    scale: "0.8041",
    calibrationZ: "0"
  };
  INPUT_SET_1.mapTransformProps = fakeMapTransformProps();
  INPUT_SET_1.mapTransformProps.gridSize = { x: 5900, y: 2900 };
  INPUT_SET_1.mapTransformProps.quadrant = 3;

  const INPUT_SET_2 = cloneDeep(INPUT_SET_1);
  INPUT_SET_2.image.body.meta = {
    x: 221, y: 308, z: 1, name: "marked_image"
  };
  INPUT_SET_2.cameraCalibrationData.origin = "TOP_RIGHT";
  INPUT_SET_2.mapTransformProps.quadrant = 1;

  const INPUT_SET_3 = cloneDeep(INPUT_SET_2);
  INPUT_SET_3.mapTransformProps.quadrant = 2;
  INPUT_SET_3.image.body.meta.name = "calibration_result";

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

  const INPUT_SET_16 = cloneDeep(INPUT_SET_11);
  INPUT_SET_16.image.body.meta.name = "1234";
  INPUT_SET_16.cropImage = false;
  INPUT_SET_16.cameraCalibrationData.origin = "TOP_LEFT";

  const INPUT_SET_17 = cloneDeep(INPUT_SET_16);
  INPUT_SET_17.cameraCalibrationData.origin = "BOTTOM_LEFT";

  const INPUT_SET_18 = cloneDeep(INPUT_SET_16);
  INPUT_SET_18.cameraCalibrationData.origin = "BOTTOM_RIGHT";

  const INPUT_SET_19 = cloneDeep(INPUT_SET_18);
  INPUT_SET_19.image.body.meta.name = "1234";

  const INPUT_SET_20 = cloneDeep(INPUT_SET_19);
  INPUT_SET_20.cropImage = true;
  INPUT_SET_20.image.body.meta.name = "1234";
  INPUT_SET_20.cameraCalibrationData.rotation = undefined;

  const INPUT_SET_21 = cloneDeep(INPUT_SET_20);
  INPUT_SET_21.cameraCalibrationData.rotation = "50";

  const INPUT_SET_22 = cloneDeep(INPUT_SET_18);
  INPUT_SET_22.cameraCalibrationData.origin = "TOP_RIGHT";

  const DATA = [
    INPUT_SET_1,
    INPUT_SET_1, INPUT_SET_2, INPUT_SET_3, INPUT_SET_4, INPUT_SET_5,
    INPUT_SET_6, INPUT_SET_7, INPUT_SET_8, INPUT_SET_9, INPUT_SET_10,
    INPUT_SET_11, INPUT_SET_12, INPUT_SET_13, INPUT_SET_14, INPUT_SET_15,
    INPUT_SET_16, INPUT_SET_17, INPUT_SET_18, INPUT_SET_19, INPUT_SET_20,
    INPUT_SET_21, INPUT_SET_22,
  ];

  const expectedSize = { width: 385.968, height: 514.624 };

  renderedTest(1, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: 142.984, ty: -2567.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(2, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 5436.016, ty: 125.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(3, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -78.016, ty: 125.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(4, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -78.016, ty: -2259.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(5, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: 5436.016, ty: -2259.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(6, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -5436.016, ty: 2259.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(7, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 5436.016, ty: 2259.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(8, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -5436.016, ty: -2259.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(9, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 2388.344, ty: 5307.36,
    tOriginX: 193, tOriginY: 257, rotate: 90,
  }, { rot: 90, sx: -1, sy: 1, tx: -64.328, ty: -64.328 });
  renderedTest(10, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: 142.984, ty: -2567.688,
    cropPath: "url(#rectangle-1)", tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(11, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: 142.984, ty: -2567.688,
    cropPath: "url(#circle-1)", tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(12, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: -2388.344, ty: 5307.36,
    tOriginX: 193, tOriginY: 257, rotate: 90,
  }, { rot: 90, sx: 1, sy: -1, tx: -64.328, ty: 64.328 });
  renderedTest(13, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: 2388.344, ty: 5307.36,
    tOriginX: 193, tOriginY: 257, rotate: 90,
  }, { rot: 90, sx: -1, sy: 1, tx: -64.328, ty: -64.328 });
  renderedTest(14, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: -2388.344, ty: -5307.36,
    tOriginX: 193, tOriginY: 257, rotate: 90,
  }, { rot: 90, sx: -1, sy: 1, tx: 64.328, ty: 64.328 });
  renderedTest(15, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: 2388.344, ty: -5307.36,
    tOriginX: 193, tOriginY: 257, rotate: 90,
  }, { rot: 90, sx: 1, sy: -1, tx: 64.328, ty: -64.328 });
  renderedTest(16, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: 142.984, ty: 2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -47,
  });
  renderedTest(17, DATA, {
    size: expectedSize, sx: -1, sy: -1, tx: 142.984, ty: -2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -47,
  });
  renderedTest(18, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: -142.984, ty: -2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -47,
  });
  renderedTest(19, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: -142.984, ty: -2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -47,
  });
  renderedTest(20, DATA, {
    size: expectedSize, sx: -1, sy: 1, tx: 142.984, ty: 2567.688,
    tOriginX: 193, tOriginY: 257, rotate: 0,
  });
  renderedTest(21, DATA, {
    size: expectedSize, sx: 1, sy: -1, tx: -142.984, ty: -2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -50, cropPath: "url(#rectangle-1)",
  });
  renderedTest(22, DATA, {
    size: expectedSize, sx: 1, sy: 1, tx: -142.984, ty: 2567.688,
    tOriginX: 193, tOriginY: 257, rotate: -47,
  });

  it("doesn't render placeholder image", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image.body.attachment_url = "/placehold.";
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toContain(NOT_DISPLAYED);
  });

  it("doesn't render image taken at different height than calibration", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image.body.meta.z = 100;
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toContain(NOT_DISPLAYED);
  });

  it("doesn't render images that are not adjusted for camera rotation", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.image.body.meta.name = "na";
    const wrapper = svgMount(<MapImage {...p} />);
    expect(wrapper.html()).toContain(NOT_DISPLAYED);
  });

  it("highlights image", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.hoveredMapImage = 1;
    p.image.body.id = 1;
    const wrapper = svgMount(<MapImage {...p} />);
    wrapper.find(MapImage).setState({ imageWidth: 480, imageHeight: 640 });
    expect(wrapper.find("image").props().opacity).toEqual(1);
    expect(wrapper.find("#highlight-border").length).toEqual(1);
  });

  it("doesn't highlight image", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.hoveredMapImage = 100;
    p.image.body.id = 1;
    const wrapper = svgMount(<MapImage {...p} />);
    wrapper.find(MapImage).setState({ imageWidth: 480, imageHeight: 640 });
    expect(wrapper.find("image").props().opacity).toEqual(0.3);
    expect(wrapper.find("#highlight-border").length).toEqual(0);
  });

  it("calls callback", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.callback = jest.fn();
    const wrapper = svgMount(<MapImage {...p} />);
    const img = new Image();
    wrapper.find<MapImage>(MapImage).instance().imageCallback(img)();
    expect(p.callback).toHaveBeenCalledWith(img);
  });

  it("disables translation", () => {
    const p = cloneDeep(INPUT_SET_1);
    p.disableTranslation = true;
    const wrapper = svgMount(<MapImage {...p} />);
    wrapper.find(MapImage).setState({ imageWidth: 480, imageHeight: 640 });
    expect(wrapper.find("image").props().style?.transform)
      .toEqual("scale(-1, -1)  rotate(0deg)");
  });
});

describe("rotated90degrees()", () => {
  it("returns correct rotation", () => {
    expect(rotated90degrees(0)).toEqual(false);
    expect(rotated90degrees(44)).toEqual(false);
    expect(rotated90degrees(46)).toEqual(true);
    expect(rotated90degrees(89)).toEqual(true);
    expect(rotated90degrees(91)).toEqual(true);
    expect(rotated90degrees(134)).toEqual(true);
    expect(rotated90degrees(136)).toEqual(false);
    expect(rotated90degrees(-44)).toEqual(false);
    expect(rotated90degrees(-46)).toEqual(true);
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

describe("imageSizeCheck()", () => {
  it("passes", () => {
    expect(imageSizeCheck(
      { width: 1000, height: 500 },
      { x: undefined, y: undefined },
    )).toEqual(true);
    expect(imageSizeCheck(
      { width: 1000, height: 500 },
      { x: "250", y: "500" },
    )).toEqual(true);
    expect(imageSizeCheck(
      { width: 640, height: 480 },
      { x: "320", y: "240" },
    )).toEqual(true);
    expect(imageSizeCheck(
      { width: 603, height: 404 },
      { x: "300", y: "200" },
    )).toEqual(true);
    expect(imageSizeCheck(
      { width: 480, height: 640 },
      { x: "320", y: "240" },
    )).toEqual(true);
  });

  it("fails", () => {
    expect(imageSizeCheck(
      { width: 640, height: 640 },
      { x: "300", y: "200" },
    )).toEqual(false);
    expect(imageSizeCheck(
      { width: 1000, height: 500 },
      { x: "500", y: "1000" },
    )).toEqual(false);
  });
});
