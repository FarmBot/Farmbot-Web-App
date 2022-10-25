import React from "react";
import { TargetCoordinate, TargetCoordinateProps } from "../target_coordinate";
import { shallow } from "enzyme";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import {
  fakeImage, fakePlant, fakePoint, fakeSensorReading,
} from "../../../../__test_support__/fake_state/resources";
import { svgMount } from "../../../../__test_support__/svg_mount";
import {
  TaggedPlantPointer, TaggedGenericPointer, TaggedImage, TaggedSensorReading,
} from "farmbot";

describe("<TargetCoordinate/>", () => {
  const fakeProps = (): TargetCoordinateProps => ({
    chosenLocation: {
      x: 100,
      y: 200,
      z: 0
    },
    mapTransformProps: fakeMapTransformProps(),
    hoveredPlant: undefined,
    hoveredPoint: undefined,
    hoveredSensorReading: undefined,
    hoveredImage: undefined,
    zoomLvl: 1,
  });

  it("renders target", () => {
    const wrapper = shallow(<TargetCoordinate {...fakeProps()} />);
    const boxProps = wrapper.find("rect").first().props();
    expect(boxProps.x).toEqual(78);
    expect(boxProps.y).toEqual(195.6);
    expect(boxProps.width).toEqual(22);
    expect(boxProps.height).toEqual(8.8);
    expect(wrapper.find("use").length).toEqual(8);
  });

  it("doesn't render target", () => {
    const p = fakeProps();
    p.chosenLocation = undefined;
    const wrapper = shallow(<TargetCoordinate {...p} />);
    expect(wrapper.html()).not.toContain("use");
  });

  it.each<[string,
    TaggedPlantPointer | undefined,
    TaggedGenericPointer | undefined,
    TaggedSensorReading | undefined,
    TaggedImage | undefined,
  ]>([
    ["plant", fakePlant(), undefined, undefined, undefined],
    ["point", undefined, fakePoint(), undefined, undefined],
    ["sensor reading", undefined, undefined, fakeSensorReading(), undefined],
    ["image", undefined, undefined, undefined, fakeImage()],
  ])("renders target line to %s", (_title, plant, point, sensorReading, image) => {
    const p = fakeProps();
    p.hoveredPlant = plant;
    p.hoveredPoint = point;
    p.hoveredSensorReading = sensorReading;
    p.hoveredImage = image;
    const wrapper = svgMount(<TargetCoordinate {...p} />);
    expect(wrapper.find("use").length).toEqual(8);
    expect(wrapper.find("line").length).toEqual(1);
  });

  it("doesn't render target line", () => {
    const wrapper = svgMount(<TargetCoordinate {...fakeProps()} />);
    expect(wrapper.find("use").length).toEqual(8);
    expect(wrapper.find("line").length).toEqual(0);
  });
});
