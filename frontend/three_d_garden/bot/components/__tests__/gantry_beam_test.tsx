interface MockRef {
  current: {
    getWorldPosition: Function;
    copy: Function;
    target: {
      position: { copy: Function };
      updateMatrixWorld: Function;
    };
  } | undefined;
}

type MockRefCurrent = NonNullable<MockRef["current"]>;

const newMockRefCurrent = (): MockRefCurrent => ({
  getWorldPosition: jest.fn(),
  copy: jest.fn(() => ({ add: jest.fn() })),
  target: {
    position: { copy: jest.fn() },
    updateMatrixWorld: jest.fn(),
  },
});

const newMockRef = (
  current: MockRef["current"] = newMockRefCurrent(),
): MockRef => Object.defineProperty({}, "current", {
  get: () => current,
  set: jest.fn(),
  configurable: true,
}) as MockRef;

let mockRef: MockRef = newMockRef();

import React from "react";
import { render } from "@testing-library/react";
import { useHelper } from "@react-three/drei";
import { INITIAL, INITIAL_POSITION, PRESETS } from "../../../config";
import { clone, range } from "lodash";
import { GantryBeam, GantryBeamProps } from "../gantry_beam";
import { Shape, Texture } from "three";
import * as threeFiber from "@react-three/fiber";
import {
  createRenderer, unmountRenderer,
} from "../../../../__test_support__/test_renderer";
import * as mapUtil from "../../../../farm_designer/map/util";
import { Mode } from "../../../../farm_designer/map/interfaces";

let reactUseRefSpy: jest.SpyInstance;
let useFrameSpy: jest.SpyInstance;
let getModeSpy: jest.SpyInstance;

describe("<GantryBeam />", () => {
  beforeEach(() => {
    mockRef = newMockRef();
    reactUseRefSpy = jest.spyOn(React, "useRef")
      .mockImplementation(() => mockRef);
    useFrameSpy = jest.spyOn(threeFiber, "useFrame");
    getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
  });

  afterEach(() => {
    reactUseRefSpy.mockRestore();
    useFrameSpy.mockRestore();
    getModeSpy.mockRestore();
  });

  const fakeProps = (): GantryBeamProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    beamShape: new Shape(),
    aluminumTexture: new Texture(),
  });

  const lightStrip = (container: HTMLElement) =>
    container.querySelector("[name='gantry-beam-light-strip']");

  it("renders beam", () => {
    const { container } = render(<GantryBeam {...fakeProps()} />);
    expect(container).toContainHTML("beam");
    expect(container.querySelector("[name='gantry-beam-highlight']"))
      .toBeTruthy();
    expect(lightStrip(container)).toBeNull();
  });

  it("renders lights", () => {
    const p = fakeProps();
    p.config.light = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(lightStrip(container)).toBeTruthy();
  });

  it("renders alternative lights", () => {
    const p = fakeProps();
    p.config.light = true;
    p.config.kitVersion = "v1.8";
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(lightStrip(container)).toBeTruthy();
  });

  it("updates light targets in render frames", () => {
    const frameCallbacks: Parameters<typeof threeFiber.useFrame>[0][] = [];
    const helperUpdate = jest.fn();
    const helperMock = useHelper as unknown as jest.Mock;
    range(5).forEach(() => helperMock.mockReturnValueOnce({
      current: { update: helperUpdate },
    }));
    useFrameSpy.mockImplementation(
      (callback: Parameters<typeof threeFiber.useFrame>[0]) => {
        frameCallbacks.push(callback);
        return undefined;
      });
    const p = fakeProps();
    p.config.light = true;
    p.config.kitVersion = "v1.8";
    const { container } = render(<GantryBeam {...p} />);
    expect(lightStrip(container)).toBeTruthy();
    expect(frameCallbacks).toHaveLength(5);
    jest.clearAllMocks();

    frameCallbacks.forEach(callback => callback({} as never, 0));

    expect(mockRef.current?.getWorldPosition).toHaveBeenCalledTimes(5);
    expect(mockRef.current?.target.position.copy).toHaveBeenCalledTimes(5);
    expect(mockRef.current?.target.updateMatrixWorld).toHaveBeenCalledTimes(5);
    expect(helperUpdate).toHaveBeenCalledTimes(5);
  });

  it("updates light targets", () => {
    const p = fakeProps();
    p.config.light = true;
    render(<GantryBeam {...p} />);
    expect(mockRef.current?.getWorldPosition).toHaveBeenCalledTimes(10);
    expect(mockRef.current?.copy).toHaveBeenCalledTimes(10);
    expect(mockRef.current?.target.position.copy).toHaveBeenCalledTimes(10);
    expect(mockRef.current?.target.updateMatrixWorld).toHaveBeenCalledTimes(10);
  });

  it("renders debug helpers", () => {
    const p = fakeProps();
    p.config.light = true;
    p.config.lightsDebug = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(lightStrip(container)).toBeTruthy();
  });

  it("handles missing ref", () => {
    mockRef = newMockRef(undefined);
    const p = fakeProps();
    p.config.light = true;
    const { container } = render(<GantryBeam {...p} />);
    expect(container).toContainHTML("beam");
    expect(lightStrip(container)).toBeTruthy();
  });

  it("selects and hovers the beam", () => {
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    p.onHoverObject = jest.fn();
    const wrapper = createRenderer(<GantryBeam {...p} />);
    const beam = wrapper.root.find(node =>
      node.props.name == "gantry-beam");
    const stopPropagation = jest.fn();

    beam.props.onClick({ delta: 0, stopPropagation });
    beam.props.onPointerOver({ stopPropagation });
    beam.props.onPointerOut({ stopPropagation });

    expect(p.onSelectObject).toHaveBeenCalledWith({
      kind: "gantryBeam",
      id: 0,
    });
    expect(p.onHoverObject).toHaveBeenNthCalledWith(1, true);
    expect(p.onHoverObject).toHaveBeenNthCalledWith(2, false);
    expect(stopPropagation).toHaveBeenCalledTimes(3);
    unmountRenderer(wrapper);
  });

  it("doesn't select the beam after a drag", () => {
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    const wrapper = createRenderer(<GantryBeam {...p} />);
    wrapper.root.find(node => node.props.name == "gantry-beam")
      .props.onClick({ delta: 2 });
    expect(p.onSelectObject).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("doesn't select the beam in camera selection mode", () => {
    getModeSpy.mockReturnValue(Mode.cameraSelection);
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    const wrapper = createRenderer(<GantryBeam {...p} />);
    wrapper.root.find(node => node.props.name == "gantry-beam")
      .props.onClick({ delta: 0 });
    expect(p.onSelectObject).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });
});

describe("<GantryBeam /> performance", () => {
  const realisticProps = (): GantryBeamProps => ({
    config: { ...clone(PRESETS["Genesis XL"]), light: true },
    configPosition: clone(INITIAL_POSITION),
    beamShape: new Shape(),
    aluminumTexture: new Texture(),
  });

  const lights = (container: HTMLElement) =>
    container.querySelectorAll("[distance='10000']");

  it("skips light-strip rerenders for Y/Z-only movement", () => {
    const p = realisticProps();
    const helperMock = useHelper as unknown as jest.Mock;
    const { container, rerender } = render(<GantryBeam {...p} />);
    const initialPosition = container
      .querySelector("[name='gantry-beam']")
      ?.getAttribute("position");
    helperMock.mockClear();

    for (let i = 0; i < 90; i++) {
      rerender(<GantryBeam
        {...p}
        configPosition={{
          ...p.configPosition,
          y: p.configPosition.y + i + 1,
          z: p.configPosition.z + i + 1,
        }} />);
    }

    expect(helperMock).not.toHaveBeenCalled();
    expect(lights(container).length).toEqual(10);
    expect(container.querySelector("[name='gantry-beam']")
      ?.getAttribute("position")).toEqual(initialPosition);
  });

  it("skips light-strip rerenders for unrelated config churn", () => {
    const p = realisticProps();
    const helperMock = useHelper as unknown as jest.Mock;
    const { container, rerender } = render(<GantryBeam {...p} />);
    helperMock.mockClear();

    rerender(<GantryBeam
      {...p}
      config={{ ...p.config, grid: !p.config.grid }} />);

    expect(helperMock).not.toHaveBeenCalled();
    expect(lights(container).length).toEqual(10);
  });

  it("updates beam position and lights for X movement", () => {
    const p = realisticProps();
    const helperMock = useHelper as unknown as jest.Mock;
    const { container, rerender } = render(<GantryBeam {...p} />);
    const initialPosition = container
      .querySelector("[name='gantry-beam']")
      ?.getAttribute("position");
    helperMock.mockClear();

    rerender(<GantryBeam
      {...p}
      configPosition={{
        ...p.configPosition,
        x: p.configPosition.x + 10,
      }} />);

    expect(helperMock).toHaveBeenCalledTimes(10);
    expect(lights(container).length).toEqual(10);
    expect(container.querySelector("[name='gantry-beam']")
      ?.getAttribute("position")).not.toEqual(initialPosition);
  });

  it("keeps light shadow props", () => {
    const wrapper = createRenderer(<GantryBeam {...realisticProps()} />);
    const spotLights = wrapper.root.findAll(node =>
      node.type == "div" && node.props.distance == 10000);
    expect(spotLights).toHaveLength(10);
    spotLights.forEach(light =>
      expect(light.props.castShadow).toEqual(true));
    unmountRenderer(wrapper);
  });

  it("updates light strip when beam light config changes", () => {
    const p = realisticProps();
    const { container, rerender } = render(<GantryBeam {...p} />);
    expect(lights(container).length).toEqual(10);

    rerender(<GantryBeam
      {...p}
      config={{ ...p.config, beamLength: 1500 }} />);
    expect(lights(container).length).toEqual(5);

    rerender(<GantryBeam
      {...p}
      config={{ ...p.config, beamLength: 1500, light: false }} />);
    expect(lights(container).length).toEqual(0);

    rerender(<GantryBeam
      {...p}
      config={{
        ...p.config,
        beamLength: 1500,
        kitVersion: "v1.7",
      }} />);
    expect(lights(container).length).toEqual(5);
    expect(container.querySelectorAll(".cylinder").length).toEqual(1);
  });

  it("updates light debug helpers", () => {
    const p = realisticProps();
    const helperMock = useHelper as unknown as jest.Mock;
    const { rerender } = render(<GantryBeam {...p} />);
    helperMock.mockClear();

    rerender(<GantryBeam
      {...p}
      config={{ ...p.config, lightsDebug: true }} />);

    expect(helperMock).toHaveBeenCalledTimes(10);
    expect(helperMock.mock.calls.every(([ref]) => !!ref)).toBeTruthy();
  });
});
