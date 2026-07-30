import React from "react";
import { act, render } from "@testing-library/react";
import { useFrame } from "@react-three/fiber";
import { Vector3 } from "three";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { getBotVersion } from "../../bot_versions";
import {
  AirTube, airTubePosition, airTubePropsEqual, RoutingAssemblyProps,
  xRoutingPropsEqual, yRoutingPropsEqual, zRoutingPropsEqual,
} from "../routing";

describe("routing dependency matrix", () => {
  const fakeProps = (): RoutingAssemblyProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    version: getBotVersion(INITIAL.kitVersion),
  });
  const move = (
    props: RoutingAssemblyProps,
    axis: keyof typeof props.configPosition,
  ): RoutingAssemblyProps => ({
    ...props,
    configPosition: {
      ...props.configPosition,
      [axis]: props.configPosition[axis] + 1,
    },
  });

  it("rebuilds X routing only for X movement", () => {
    const p = fakeProps();
    expect(xRoutingPropsEqual(p, move(p, "y"))).toBeTruthy();
    expect(xRoutingPropsEqual(p, move(p, "z"))).toBeTruthy();
    expect(xRoutingPropsEqual(p, move(p, "x"))).toBeFalsy();
  });

  it("updates Y routing for X transforms and Y deformation", () => {
    const p = fakeProps();
    expect(yRoutingPropsEqual(p, move(p, "z"))).toBeTruthy();
    expect(yRoutingPropsEqual(p, move(p, "x"))).toBeFalsy();
    expect(yRoutingPropsEqual(p, move(p, "y"))).toBeFalsy();
  });

  it("updates Z routing for all transform and deformation axes", () => {
    const p = fakeProps();
    expect(zRoutingPropsEqual(p, move(p, "x"))).toBeFalsy();
    expect(zRoutingPropsEqual(p, move(p, "y"))).toBeFalsy();
    expect(zRoutingPropsEqual(p, move(p, "z"))).toBeFalsy();
  });

  it("leaves frame-local routing independent of React snapshots", () => {
    const p = fakeProps();
    p.positionRef = { current: clone(p.configPosition) };
    expect(xRoutingPropsEqual(p, move(p, "x"))).toBeTruthy();
    expect(yRoutingPropsEqual(p, move(p, "y"))).toBeTruthy();
    expect(zRoutingPropsEqual(p, move(p, "z"))).toBeTruthy();
  });

  it("moves the vacuum tube from the frame-local position", () => {
    let frameCallback: Parameters<typeof useFrame>[0] | undefined;
    (useFrame as jest.Mock).mockImplementation(
      (callback: Parameters<typeof useFrame>[0]) => {
        frameCallback = callback;
        return undefined;
      });
    const p = fakeProps();
    p.positionRef = { current: clone(p.configPosition) };
    const { container, unmount } = render(React.createElement(AirTube, p));
    const mesh = container.querySelector("[name='air-tube']") as unknown as {
      position: Vector3;
    };
    mesh.position = new Vector3();
    p.positionRef.current = { x: 100, y: 200, z: 300 };

    act(() => frameCallback?.({} as never, 0));

    expect(mesh.position.toArray()).toEqual(airTubePosition(
      p.config,
      p.positionRef.current,
    ));
    unmount();
    (useFrame as jest.Mock).mockReset();
  });

  it("ignores React positions when the vacuum tube has a frame ref", () => {
    const p = fakeProps();
    p.positionRef = { current: clone(p.configPosition) };
    expect(airTubePropsEqual(p, move(p, "x"))).toBeTruthy();
    expect(airTubePropsEqual(p, {
      ...p,
      config: {
        ...p.config,
        zGantryOffset: p.config.zGantryOffset + 1,
      },
    })).toBeFalsy();
  });

  it("ignores unrelated config and updates structural config", () => {
    const p = fakeProps();
    const unrelated = { ...p, config: { ...p.config, sun: p.config.sun + 1 } };
    expect(xRoutingPropsEqual(p, unrelated)).toBeTruthy();
    expect(yRoutingPropsEqual(p, unrelated)).toBeTruthy();
    expect(zRoutingPropsEqual(p, unrelated)).toBeTruthy();
    expect(xRoutingPropsEqual(p, {
      ...p,
      config: { ...p.config, botSizeX: p.config.botSizeX + 1 },
    })).toBeFalsy();
  });
});
