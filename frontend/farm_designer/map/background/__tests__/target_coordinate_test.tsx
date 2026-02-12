import React from "react";
import { TargetCoordinate, TargetCoordinateProps } from "../target_coordinate";
import { render } from "@testing-library/react";
import {
  fakeMapTransformProps,
} from "../../../../__test_support__/map_transform_props";
import {
  fakeImage, fakePlant, fakePoint, fakeSensorReading,
} from "../../../../__test_support__/fake_state/resources";
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

  const renderTarget = (props: TargetCoordinateProps) =>
    render(<svg><TargetCoordinate {...props} /></svg>);

  const getRequiredAttribute = (
    element: Element,
    attribute: string,
  ): number => {
    const value = element.getAttribute(attribute);
    if (value === null) { throw new Error(`Missing attribute: ${attribute}`); }
    return Number(value);
  };

  it("renders target", () => {
    const { container } = renderTarget(fakeProps());
    const box = container.querySelector("#target-coordinate-crosshair-segment rect");
    if (!box) { throw new Error("Missing target crosshair segment"); }
    expect(getRequiredAttribute(box, "x")).toEqual(78);
    expect(getRequiredAttribute(box, "y")).toEqual(195.6);
    expect(getRequiredAttribute(box, "width")).toEqual(22);
    expect(getRequiredAttribute(box, "height")).toEqual(8.8);
    expect(container.querySelectorAll("use").length).toEqual(8);
  });

  it("doesn't render target", () => {
    const p = fakeProps();
    p.chosenLocation = undefined;
    const { container } = renderTarget(p);
    expect(container.querySelector("use")).toBeNull();
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
    const { container } = renderTarget(p);
    expect(container.querySelectorAll("use").length).toEqual(8);
    expect(container.querySelectorAll("#target-line").length).toEqual(1);
  });

  it("doesn't render target line", () => {
    const { container } = renderTarget(fakeProps());
    expect(container.querySelectorAll("use").length).toEqual(8);
    expect(container.querySelectorAll("#target-line").length).toEqual(0);
  });
});
