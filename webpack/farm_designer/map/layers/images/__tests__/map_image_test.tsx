import * as React from "react";
import { mount } from "enzyme";
import { MapImage, MapImageProps } from "../map_image";
import { SpecialStatus } from "farmbot";
import { cloneDeep } from "lodash";
import { trim } from "../../../../../util";
import {
  fakeMapTransformProps
} from "../../../../../__test_support__/map_transform_props";

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
      cameraCalibrationData: {
        offset: { x: undefined, y: undefined },
        origin: undefined,
        rotation: undefined,
        scale: undefined,
        calibrationZ: undefined
      },
      mapTransformProps: fakeMapTransformProps(),
    };
  };

  it("doesn't render image", () => {
    const wrapper = mount(<MapImage {...fakeProps()} />);
    expect(wrapper.html()).toEqual("<image></image>");
  });

  interface ExpectedData {
    size: { width: number, height: number };
    sx: number;
    sy: number;
    tx: number;
    ty: number;
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
        const wrapper = mount(<MapImage {...inputData[num]} />);
        expect(wrapper.find("image").props()).toEqual({
          xlinkHref: "image_url",
          x: 0,
          y: 0,
          width: expectedData.size.width,
          height: expectedData.size.height,
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
    origin: "\"TOP_RIGHT\"",
    rotation: "-57.45",
    scale: "0.8041",
    calibrationZ: "0"
  };
  INPUT_SET_1.mapTransformProps = fakeMapTransformProps();
  INPUT_SET_1.mapTransformProps.gridSize = { x: 5900, y: 2900 },
    INPUT_SET_1.mapTransformProps.quadrant = 3;
  INPUT_SET_1.sizeOverride = { width: 480, height: 640 };

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

  const INPUT_SET_8 = cloneDeep(INPUT_SET_7);
  INPUT_SET_8.mapTransformProps.xySwap = true;

  const DATA = [
    INPUT_SET_1,
    INPUT_SET_1, INPUT_SET_2, INPUT_SET_3, INPUT_SET_4, INPUT_SET_5,
    INPUT_SET_6, INPUT_SET_7, INPUT_SET_8
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
    size: expectedSize, sx: 1, sy: 1, tx: 2388.344, ty: 5307.36
  }, { rot: 90, sx: -1, sy: 1, tx: -514.624, ty: -514.624 });

  it("doesn't render placeholder image", () => {
    const p = INPUT_SET_1;
    p.image && (p.image.body.attachment_url = "/placehold.");
    const wrapper = mount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual("<image></image>");
  });

  it("doesn't render image taken at different height than calibration", () => {
    const p = INPUT_SET_1;
    p.image && (p.image.body.meta.z = 100);
    const wrapper = mount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual("<image></image>");
  });

  it("doesn't render images that are not adjusted for camera rotation", () => {
    const p = INPUT_SET_1;
    p.image && (p.image.body.meta.name = "na");
    const wrapper = mount(<MapImage {...p} />);
    expect(wrapper.html()).toEqual("<image></image>");
  });
});
