import React, { act } from "react";
import { render } from "@testing-library/react";
import { useFrame } from "@react-three/fiber";
import { clone } from "lodash";
import * as THREE from "three";
import {
  CAMERA_OPERATION_DURATION_MS, INITIAL,
} from "../../../config";
import { zZero } from "../../../helpers";
import {
  CameraOperationAnimations, CameraOperationAnimationsProps,
  CAMERA_LASER_COLORS, CAMERA_SOIL_GRID_LINE_WIDTH,
  cameraGridHeightOffset, cameraScanState, cameraScanTriangle,
  cameraSoilGrid, cameraWeedScanProgress,
} from "../camera_operation_animations";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";

describe("camera operation animations", () => {
  const points = () => [
    new THREE.Vector3(-2, -2, 0),
    new THREE.Vector3(-2, 2, 0),
    new THREE.Vector3(2, -2, 0),
    new THREE.Vector3(2, 2, 0),
    new THREE.Vector3(-100, -50, -200),
    new THREE.Vector3(-100, 50, -200),
    new THREE.Vector3(100, -50, -200),
    new THREE.Vector3(100, 50, -200),
  ];
  const fakeProps = (
    operation: CameraOperationAnimationsProps["operation"] = "calibration",
  ): CameraOperationAnimationsProps => ({
    operation,
    operationId: 123,
    points: points(),
    cameraPosition: new THREE.Vector3(100, 200, 300),
    config: clone(INITIAL),
    getZ: jest.fn(() => 5),
  });

  afterEach(() => jest.useRealTimers());

  it("moves a scan line back and forth", () => {
    expect(cameraScanState(-1)).toEqual({ pass: 0, progress: 0 });
    expect(cameraScanState(0.75)).toEqual({ pass: 0, progress: 0.5 });
    expect(cameraScanState(1.5)).toEqual({ pass: 1, progress: 1 });
    expect(cameraScanState(2.25)).toEqual({ pass: 1, progress: 0.5 });
    expect(cameraScanState(3)).toEqual({ pass: 2, progress: 0 });
  });

  it.each([
    ["calibration", "#009dff"],
    ["weeds", "#ff0000"],
    ["soil-height", "#8b4513"],
  ] as const)("uses the %s laser color", (operation, color) => {
    const wrapper = createRenderer(
      <CameraOperationAnimations {...fakeProps(operation)} />,
    );
    const laser = wrapper.root.findByProps({
      name: "camera-laser-scan-plane",
    });
    expect(laser.find(node => node.props.color == color).props.color)
      .toEqual(CAMERA_LASER_COLORS[operation]);
    unmountRenderer(wrapper);
  });

  it("runs one complete weed scan out and back", () => {
    expect(cameraWeedScanProgress(0, 3)).toEqual(0);
    expect(cameraWeedScanProgress(0.75, 3)).toEqual(0.5);
    expect(cameraWeedScanProgress(1.5, 3)).toEqual(1);
    expect(cameraWeedScanProgress(2.25, 3)).toEqual(0.5);
    expect(cameraWeedScanProgress(3, 3)).toEqual(0);
    expect(cameraWeedScanProgress(4, 3)).toEqual(0);
  });

  it("spans the long side of either bottom-rectangle orientation", () => {
    const wide = cameraScanTriangle(points(), 0.25);
    expect(wide.map(point => point.toArray())).toEqual([
      [0, 0, 0],
      [-100, -25, -200],
      [100, -25, -200],
    ]);
    const tallPoints = points();
    tallPoints[4].set(-25, -100, -200);
    tallPoints[5].set(-25, 100, -200);
    tallPoints[6].set(25, -100, -200);
    tallPoints[7].set(25, 100, -200);
    const tall = cameraScanTriangle(tallPoints, 0.5);
    expect(tall.map(point => point.toArray())).toEqual([
      [0, 0, 0],
      [0, -100, -200],
      [0, 100, -200],
    ]);
    expect(cameraScanTriangle(points(), -1)[1].y).toEqual(-50);
    expect(cameraScanTriangle(points(), 2)[1].y).toEqual(50);
  });

  it("builds a terrain-sampled grid at no more than 50mm spacing", () => {
    const props = fakeProps("soil-height");
    const grid = cameraSoilGrid(props);
    expect(grid.nodes).toHaveLength(15);
    expect(grid.edges).toHaveLength(22);
    expect(grid.nodes.map(point => point.z))
      .toEqual(Array(15).fill(zZero(props.config) + 5 - 300));
    expect(props.getZ).toHaveBeenCalledTimes(15);
    const tiny = fakeProps("soil-height");
    tiny.points[4].set(-10, -10, -200);
    tiny.points[5].set(-10, 10, -200);
    tiny.points[6].set(10, -10, -200);
    tiny.points[7].set(10, 10, -200);
    expect(cameraSoilGrid(tiny).nodes).toHaveLength(4);
  });

  it("keeps animated grid heights between soil and soil plus 30mm", () => {
    const offsets = [0, 1, 2, 3].flatMap(index =>
      [0, 1, 10].map(time => cameraGridHeightOffset(index, time, 123)));
    offsets.map(offset => {
      expect(offset).toBeGreaterThanOrEqual(0);
      expect(offset).toBeLessThanOrEqual(30);
    });
    expect(new Set(offsets).size).toBeGreaterThan(2);
  });

  it("renders the scan and calibration card at soil plus 10mm", () => {
    const props = fakeProps();
    const wrapper = createRenderer(<CameraOperationAnimations {...props} />);
    expect(wrapper.root.findByProps({ name: "camera-laser-scan-plane" }).props)
      .toMatchObject({ frustumCulled: false });
    const card = wrapper.root.findByProps({ name: "camera-calibration-card" });
    expect(card.props.position.z)
      .toEqual(zZero(props.config) + 5 - 300 + 10);
    expect(wrapper.root.findAll(node =>
      typeof node.type == "string"
      && `${node.props.name}`.startsWith(
        "camera-calibration-card-grid-dot-")))
      .toHaveLength(35);
    unmountRenderer(wrapper);
  });

  it("renders the red-object calibration card face", () => {
    const props = fakeProps();
    props.config.calibrationCardGrid = false;
    const wrapper = createRenderer(<CameraOperationAnimations {...props} />);
    expect(wrapper.root.findAll(node =>
      typeof node.type == "string"
      && `${node.props.name}`.startsWith(
        "camera-calibration-card-front-circle-")))
      .toHaveLength(4);
    expect(wrapper.root.findAll(node =>
      typeof node.type == "string"
      && `${node.props.name}`.startsWith(
        "camera-calibration-card-line-")))
      .toHaveLength(7);
    expect(wrapper.root.findByProps({
      name: "camera-calibration-card-center-ring",
    })).toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("renders and updates the soil-height grid", () => {
    const callbacks: Parameters<typeof useFrame>[0][] = [];
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        callbacks.push(callback);
      });
    const props = fakeProps("soil-height");
    const wrapper = createRenderer(<CameraOperationAnimations {...props} />);
    const grid = wrapper.root.findByProps({ name: "camera-soil-height-grid" });
    const geometry = grid.props.object.geometry;
    const position = geometry.getAttribute("instanceStart");
    const buffer = position.data.array;
    const initialPositions = [...buffer];
    expect(geometry.setPositions).toHaveBeenCalledTimes(1);
    expect(position.data.setUsage)
      .toHaveBeenCalledWith(THREE.DynamicDrawUsage);
    expect(grid.props.object.frustumCulled).toEqual(false);
    expect(grid.props.object.material.options).toMatchObject({
      color: "#ffffff",
      linewidth: CAMERA_SOIL_GRID_LINE_WIDTH,
      opacity: 0.8,
      worldUnits: true,
    });
    expect(CAMERA_SOIL_GRID_LINE_WIDTH).toEqual(3);
    callbacks.map(callback => callback({
      clock: { getElapsedTime: () => 10 },
    } as never, 0));
    callbacks.map(callback => callback({
      clock: { getElapsedTime: () => 11 },
    } as never, 0));
    expect(callbacks).toHaveLength(2);
    expect(geometry.setPositions).toHaveBeenCalledTimes(1);
    expect(position.data.array).toBe(buffer);
    expect(position.data.array).not.toEqual(initialPositions);
    expect(position.data.needsUpdate).toEqual(true);
    unmountRenderer(wrapper);
  });

  it("does not render temporary weeds during detection", () => {
    const props = fakeProps("weeds");
    const wrapper = createRenderer(<CameraOperationAnimations {...props} />);
    expect(wrapper.root.findAll(node =>
      `${node.props.name}`.startsWith("camera-scan-weed")))
      .toHaveLength(0);
    expect(wrapper.root.findByProps({ name: "camera-laser-scan-plane" }))
      .toBeTruthy();
    unmountRenderer(wrapper);
  });

  it("uses the three-second operation display window", () => {
    jest.useFakeTimers();
    const props = fakeProps();
    props.config.cameraOperationDurationMs = CAMERA_OPERATION_DURATION_MS;
    const { container } = render(
      <CameraOperationAnimations {...props} />,
    );
    expect(container.querySelector("[name='camera-operation-animation']"))
      .toBeTruthy();
    act(() => {
      jest.advanceTimersByTime(CAMERA_OPERATION_DURATION_MS - 1);
    });
    expect(container.querySelector("[name='camera-operation-animation']"))
      .toBeTruthy();
    act(() => { jest.advanceTimersByTime(1); });
    expect(container.querySelector("[name='camera-operation-animation']"))
      .toBeFalsy();
  });
});
