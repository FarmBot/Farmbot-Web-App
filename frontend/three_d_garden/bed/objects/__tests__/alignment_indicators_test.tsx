import React from "react";
import { act, render } from "@testing-library/react";
import { clone, range } from "lodash";
import {
  Color as ThreeColor, DoubleSide, InstancedBufferAttribute,
} from "three";
import {
  ALIGNMENT_INDICATOR_COLOR,
  ALIGNMENT_INDICATOR_HEIGHT,
  ALIGNMENT_INDICATOR_LENGTH,
  ALIGNMENT_INDICATOR_WIDTH,
  AlignmentIndicatorController,
  AlignmentIndicators,
  buildAlignmentIndex,
  createIndicatorGeometry,
  createIndicatorMaterial,
  makeIndicatorCapacity,
  updateIndicatorGeometry,
} from "../alignment_indicators";
import { INITIAL } from "../../../config";
import {
  fakePoint, fakeWeed,
} from "../../../../__test_support__/fake_state/resources";
import { ThreeDGardenPlant } from "../../../garden";
import { get3DPositionFunc, zZero } from "../../../helpers";
import { POINT_PIN_RADIUS } from "../../../garden/point";
import { DEFAULT_WEED_RADIUS } from "../../../garden/weed";
import {
  actRenderer, createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";

const fakePlant = (
  overrides: Partial<ThreeDGardenPlant> = {},
): ThreeDGardenPlant => ({
  id: 1,
  label: "Spinach",
  icon: "/crops/icons/spinach.avif",
  size: 80,
  spread: 300,
  x: 100,
  y: 200,
  key: "",
  seed: 0,
  ...overrides,
});

const fakeProps = () => {
  const config = clone(INITIAL);
  config.bedLengthOuter = 1000;
  config.bedWidthOuter = 500;
  config.bedXOffset = 0;
  config.bedYOffset = 0;
  config.columnLength = 100;
  config.zGantryOffset = 140;
  const weed = fakeWeed();
  weed.body.x = 100;
  weed.body.y = 300;
  weed.body.radius = 0;
  const point = fakePoint();
  point.body.x = 400;
  point.body.y = 200;
  point.body.radius = 5;
  return {
    config,
    plants: [fakePlant()],
    weeds: [weed],
    points: [point],
    showPlants: true,
    showWeeds: true,
    showPoints: true,
    getZ: (x: number, y: number) => x / 10 + y / 100,
  };
};

describe("alignment indicator index", () => {
  it("indexes visible plants, weeds, and points", () => {
    const props = fakeProps();
    const index = buildAlignmentIndex(props);
    const plant = index.byX.get(100)?.[0];
    const weed = index.byY.get(300)?.[0];
    const point = index.byX.get(400)?.[0];
    const plantPosition = get3DPositionFunc(props.config)({ x: 100, y: 200 });

    expect(index.objectCount).toEqual(3);
    expect(plant).toEqual(expect.objectContaining({
      gardenX: 100,
      gardenY: 200,
      worldX: plantPosition.x,
      worldY: plantPosition.y,
      worldZ: zZero(props.config) + props.getZ(100, 200)
        + ALIGNMENT_INDICATOR_HEIGHT,
      radius: 40,
    }));
    expect(weed?.radius).toEqual(DEFAULT_WEED_RADIUS);
    expect(point?.radius).toEqual(POINT_PIN_RADIUS);
  });

  it("only indexes visible object types", () => {
    const props = fakeProps();
    const index = buildAlignmentIndex({
      ...props,
      showPlants: false,
      showPoints: false,
    });

    expect(index.objectCount).toEqual(1);
    expect(index.byY.get(300)?.[0]?.radius).toEqual(DEFAULT_WEED_RADIUS);
    expect(index.byY.has(200)).toBeFalsy();
  });

  it("preserves exact coordinates and mirrored world positions", () => {
    const props = fakeProps();
    props.config.mirrorX = true;
    props.config.mirrorY = true;
    props.plants[0].x = 103;
    props.plants[0].y = 207;
    const index = buildAlignmentIndex(props);
    const plant = index.byX.get(103)?.[0];
    const position = get3DPositionFunc(props.config)({ x: 103, y: 207 });

    expect(index.byX.get(103)).toHaveLength(1);
    expect(plant?.gardenX).toEqual(103);
    expect(plant?.worldX).toEqual(position.x);
    expect(plant?.worldY).toEqual(position.y);
  });
});

describe("alignment indicator instances", () => {
  it("configures the requested cyan segment style", () => {
    const material = createIndicatorMaterial();

    expect(ALIGNMENT_INDICATOR_HEIGHT).toEqual(5);
    expect(material.uniforms.uLength?.value)
      .toEqual(ALIGNMENT_INDICATOR_LENGTH);
    expect(ALIGNMENT_INDICATOR_LENGTH).toEqual(40);
    expect(material.uniforms.uWidth?.value)
      .toEqual(ALIGNMENT_INDICATOR_WIDTH);
    expect(ALIGNMENT_INDICATOR_WIDTH).toEqual(10);
    expect(material.uniforms.uColor?.value)
      .toEqual(new ThreeColor(ALIGNMENT_INDICATOR_COLOR));
    expect(material.depthTest).toBeTruthy();
    expect(material.depthWrite).toBeFalsy();
    expect(material.side).toEqual(DoubleSide);
    material.dispose();
  });

  it("writes horizontal, vertical, and dual-axis alignments", () => {
    const index = buildAlignmentIndex(fakeProps());
    const geometry = createIndicatorGeometry(
      makeIndicatorCapacity(index.objectCount));

    expect(updateIndicatorGeometry(geometry, index, { x: 100, y: 200 }))
      .toEqual(4);
    expect(geometry.instanceCount).toEqual(4);
    expect(Array.from(
      geometry.getAttribute("indicatorAxis").array.slice(0, 4),
    )).toEqual([0, 0, 1, 1]);
    const centers = geometry.getAttribute("indicatorCenter") as
      InstancedBufferAttribute;
    const radii = geometry.getAttribute("indicatorRadius") as
      InstancedBufferAttribute;
    expect(centers.updateRanges)
      .toEqual([{ start: 0, count: 12 }]);
    expect(radii.updateRanges)
      .toEqual([{ start: 0, count: 4 }]);
    geometry.dispose();
  });

  it("clears instances when there is no exact alignment", () => {
    const index = buildAlignmentIndex(fakeProps());
    const geometry = createIndicatorGeometry(
      makeIndicatorCapacity(index.objectCount));

    updateIndicatorGeometry(geometry, index, { x: 100, y: 200 });
    expect(updateIndicatorGeometry(geometry, index, { x: 101, y: 201 }))
      .toEqual(0);
    expect(geometry.instanceCount).toEqual(0);
    geometry.dispose();
  });

  it("uses geometric capacity growth for large indexes", () => {
    expect(makeIndicatorCapacity(0)).toEqual(1);
    expect(makeIndicatorCapacity(3)).toEqual(8);
    expect(makeIndicatorCapacity(10_000)).toEqual(32_768);
  });

  it("renders many alignments through the same geometry", () => {
    const props = fakeProps();
    props.weeds = [];
    props.points = [];
    props.plants = range(10_000).map(index => fakePlant({
      id: index,
      x: 100,
      y: index,
    }));
    const index = buildAlignmentIndex(props);
    const geometry = createIndicatorGeometry(
      makeIndicatorCapacity(index.objectCount));

    expect(updateIndicatorGeometry(geometry, index, { x: 100, y: -1 }))
      .toEqual(10_000);
    expect(geometry.instanceCount).toEqual(10_000);
    geometry.dispose();
  });
});

describe("<AlignmentIndicators />", () => {
  it("renders one mesh and exposes an imperative update", () => {
    const ref = React.createRef<AlignmentIndicatorController>();
    const { container } = render(
      <AlignmentIndicators ref={ref} {...fakeProps()} />,
    );

    expect(container.querySelectorAll("[name='alignment-indicators']"))
      .toHaveLength(1);
    act(() => ref.current?.update({ x: 100, y: 200 }));
    expect(ref.current).toBeTruthy();
  });

  it("does not participate in scene raycasting", () => {
    const wrapper = createRenderer(<AlignmentIndicators {...fakeProps()} />);
    const mesh = wrapper.root.findAll(node =>
      node.props.name == "alignment-indicators"
      && typeof node.props.raycast == "function")[0];

    actRenderer(() => expect(mesh.props.raycast()).toBeUndefined());
    unmountRenderer(wrapper);
  });
});
