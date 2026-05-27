import {
  buildResourceIndex,
} from "../../__test_support__/resource_index_builder";
import { store } from "../../redux/store";
let mockResources = buildResourceIndex([]);

import React from "react";
import { render, screen } from "@testing-library/react";
import * as threeDrei from "@react-three/drei";
import {
  getVisualizationPoints, Visualization, VisualizationProps,
} from "../visualization";
import { INITIAL, INITIAL_POSITION } from "../config";
import { clone } from "lodash";
import {
  fakeFbosConfig, fakeFirmwareConfig, fakeSequence,
  fakeWebAppConfig,
} from "../../__test_support__/fake_state/resources";
import { findSequence } from "../../resources/selectors_by_kind";

let originalGetState: typeof store.getState;

describe("<Visualization />", () => {
  beforeEach(() => {
    mockResources = buildResourceIndex([]);
    console.log = jest.fn();
    originalGetState = store.getState;
    (store as unknown as { getState: () => { resources: typeof mockResources } })
      .getState = () => ({ resources: mockResources });
  });

  afterEach(() => {
    (store as unknown as { getState: typeof store.getState }).getState =
      originalGetState;
  });

  const fakeProps = (): VisualizationProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    visualizedSequenceUUID: undefined,
  });

  const moveAbsoluteStep = (x: number, y: number, z: number) => ({
    kind: "move_absolute",
    args: {
      location: { kind: "coordinate", args: { x, y, z } },
      offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      speed: 100,
    },
  });

  interface LineProps {
    name?: string;
    points?: [number, number, number][];
  }

  const linePointCalls = (spy: jest.SpyInstance) =>
    spy.mock.calls
      .map(call => call[0] as LineProps | undefined)
      .filter(call => call?.name == "visualization")
      .map(call => call?.points);

  it("doesn't render: no uuid", () => {
    render(<Visualization {...fakeProps()} />);
    expect(screen.queryByText("visualization")).toBeNull();
  });

  it("doesn't render: no sequence id", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = undefined;
    mockResources = buildResourceIndex([sequence]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.queryByText("visualization")).toBeNull();
  });

  it("renders first point", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    mockResources = buildResourceIndex([sequence]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.getByText("visualization")).toBeInTheDocument();
  });

  it("renders: with sequence id and points", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [
      {
        kind: "move_absolute",
        args: {
          location: { kind: "coordinate", args: { x: 100, y: 100, z: 0 } },
          offset: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
          speed: 100,
        },
      },
    ];
    mockResources = buildResourceIndex([
      sequence, fakeFbosConfig(), fakeFirmwareConfig(), fakeWebAppConfig(),
    ]);
    p.visualizedSequenceUUID =
      findSequence(mockResources.index, sequence.uuid)?.uuid;
    render(<Visualization {...p} />);
    expect(screen.getByText("visualization")).toBeInTheDocument();
  });

  it("reuses points during unrelated config churn", () => {
    const p = fakeProps();
    const sequence = fakeSequence();
    sequence.body.id = 1;
    sequence.body.body = [moveAbsoluteStep(100, 100, 0)] as never;
    mockResources = buildResourceIndex([
      sequence, fakeFbosConfig(), fakeFirmwareConfig(), fakeWebAppConfig(),
    ]);
    p.visualizedSequenceUUID = sequence.uuid;
    const lineSpy = jest.spyOn(threeDrei, "Line");

    const { rerender } = render(<Visualization {...p} />);
    const firstCalls = linePointCalls(lineSpy);
    const firstPoints = firstCalls[firstCalls.length - 1];
    expect(console.log).toHaveBeenCalledTimes(1);

    const churnConfig = clone(p.config);
    churnConfig.bedBrightness = 1;
    churnConfig.clouds = !churnConfig.clouds;
    rerender(<Visualization {...p} config={churnConfig} />);
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(linePointCalls(lineSpy).length).toEqual(firstCalls.length);
    expect(linePointCalls(lineSpy)[firstCalls.length - 1])
      .toBe(firstPoints);

    const geometryConfig = clone(churnConfig);
    geometryConfig.bedXOffset += 10;
    rerender(<Visualization {...p} config={geometryConfig} />);
    const geometryCalls = linePointCalls(lineSpy);
    const geometryPoints = geometryCalls[geometryCalls.length - 1];
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(geometryCalls.length).toEqual(firstCalls.length + 1);
    expect(geometryPoints).not.toEqual(firstPoints);

    const movedPosition = clone(p.configPosition);
    movedPosition.x += 10;
    rerender(<Visualization {...p}
      config={geometryConfig}
      configPosition={movedPosition} />);
    const positionCalls = linePointCalls(lineSpy);
    const positionPoints = positionCalls[positionCalls.length - 1];
    expect(console.log).toHaveBeenCalledTimes(1);
    expect(positionCalls.length).toEqual(firstCalls.length + 2);
    expect(positionPoints).not.toEqual(geometryPoints);

    const changedSequence = clone(sequence);
    changedSequence.body.body = [moveAbsoluteStep(200, 100, 0)] as never;
    mockResources = buildResourceIndex([
      changedSequence,
      fakeFbosConfig(),
      fakeFirmwareConfig(),
      fakeWebAppConfig(),
    ]);
    rerender(<Visualization {...p}
      config={geometryConfig}
      configPosition={movedPosition} />);
    const sequenceCalls = linePointCalls(lineSpy);
    expect(console.log).toHaveBeenCalledTimes(2);
    expect(sequenceCalls.length).toEqual(firstCalls.length + 3);
    expect(sequenceCalls[sequenceCalls.length - 1]).not.toEqual(positionPoints);
  });

  it("extracts visualization points from move actions", () => {
    const config = clone(INITIAL);
    const position = clone(INITIAL_POSITION);
    position.x = 10;
    position.y = 20;
    position.z = 30;

    const points = getVisualizationPoints(config, position, [
      { type: "other", args: [] } as never,
      { type: "expanded_move_absolute", args: [100, 200, 300] } as never,
    ]);

    expect(points).toEqual([
      [-2710, -1300, 830],
      [-1260, -460, 700],
    ]);
  });

  it("ignores config fields that don't affect visualization geometry", () => {
    const config = clone(INITIAL);
    const position = clone(INITIAL_POSITION);
    const actions = [
      { type: "expanded_move_absolute", args: [100, 200, 300] } as never,
    ];
    const points = getVisualizationPoints(config, position, actions);
    const churnConfig = clone(config);
    churnConfig.bedBrightness = 1;
    churnConfig.clouds = !churnConfig.clouds;

    expect(getVisualizationPoints(churnConfig, position, actions))
      .toEqual(points);

    const geometryConfig = clone(churnConfig);
    geometryConfig.bedXOffset += 10;
    expect(getVisualizationPoints(geometryConfig, position, actions))
      .not.toEqual(points);
  });
});
