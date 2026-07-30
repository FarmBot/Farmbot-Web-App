import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import * as THREE from "three";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import {
  ElectronicsBox,
  ElectronicsBoxProps,
  getElectronicsBoxPosition,
  makeHardwareInstanceAttributes,
} from "../electronics_box";
import { ASSETS } from "../../../constants";
import * as mapUtil from "../../../../farm_designer/map/util";
import { Mode } from "../../../../farm_designer/map/interfaces";

const useGltfMock = useGLTF as unknown as jest.Mock;
let getModeSpy: jest.SpyInstance;

interface ReactPropsElement extends Element {
  [key: string]: unknown;
}

const electronicsBoxPosition = (container: HTMLElement) => {
  const element = container.querySelector("group[name='electronics-box']");
  if (!element) {
    throw new Error("electronics-box group missing");
  }
  const propsKey = Object.keys(element as ReactPropsElement)
    .find(key => key.startsWith("__reactProps"));
  const props = propsKey
    ? (element as ReactPropsElement)[propsKey]
    : undefined;
  const position = (props as {
    position?: THREE.Vector3;
  } | undefined)?.position;
  if (!position) {
    throw new Error("electronics-box position missing");
  }
  return position;
};

beforeEach(() => {
  useGltfMock.mockClear();
  getModeSpy = jest.spyOn(mapUtil, "getMode").mockReturnValue(Mode.none);
});

afterEach(() => {
  getModeSpy.mockRestore();
});

describe("<ElectronicsBox />", () => {
  const fakeProps = (): ElectronicsBoxProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders box", () => {
    const { container } = render(<ElectronicsBox {...fakeProps()} />);
    expect(container).toContainHTML("electronics-box");
    expect(container.querySelector("[name='electronics-highlight']"))
      .toBeTruthy();
    expect(container.querySelector("[name='button-housings']"))
      .toBeTruthy();
    expect(container.querySelectorAll("[name^='button-']"))
      .toHaveLength(3);
  });

  it("builds colored hardware instance transforms", () => {
    const attributes = makeHardwareInstanceAttributes([
      { position: -30, color: "red" },
      { position: 30, color: "blue" },
    ], -50, 1000);
    const matrix = new THREE.Matrix4().fromArray(
      attributes.instanceMatrix.array,
      16,
    );

    expect(attributes.instanceMatrix.count).toEqual(2);
    expect(attributes.instanceColor.count).toEqual(2);
    expect(matrix.elements.slice(12, 15)).toEqual([-50, 30, 0]);
  });

  it("selects and hovers the electronics box", () => {
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    p.onHoverObject = jest.fn();
    const { container } = render(<ElectronicsBox {...p} />);
    const box = container.querySelector("group[name='box']");
    box && fireEvent.pointerOver(box);
    box && fireEvent.pointerOut(box);
    box && fireEvent.click(box);
    expect(p.onHoverObject).toHaveBeenCalledWith(true);
    expect(p.onHoverObject).toHaveBeenCalledWith(false);
    expect(p.onSelectObject).toHaveBeenCalledWith({
      kind: "electronics",
      id: 0,
    });
  });

  it("doesn't select the electronics box in camera selection mode", () => {
    getModeSpy.mockReturnValue(Mode.cameraSelection);
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    const { container } = render(<ElectronicsBox {...p} />);
    const box = container.querySelector("group[name='box']");
    box && fireEvent.click(box);
    expect(p.onSelectObject).not.toHaveBeenCalled();
  });

  it("calculates the electronics box position", () => {
    const p = fakeProps();
    const position = getElectronicsBoxPosition(p.config, p.configPosition);
    expect(position.z).toEqual(p.config.columnLength - 190);
  });

  it("reuses static model internals while x position changes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { rerender } = render(<ElectronicsBox {...p} />);
    const initialModelCalls = useGltfMock.mock.calls.length;
    p.config = { ...p.config, label: "updated config object" };
    p.configPosition = { ...p.configPosition, x: p.configPosition.x + 1 };
    rerender(<ElectronicsBox {...p} />);
    expect(useGltfMock.mock.calls.length).toEqual(initialModelCalls);
  });

  it("skips y/z-only movement and unrelated config churn", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container, rerender } = render(<ElectronicsBox {...p} />);
    const initialPosition = electronicsBoxPosition(container).clone();
    const initialHtml = container.innerHTML;
    const initialModelCalls = useGltfMock.mock.calls.length;
    rerender(<ElectronicsBox
      config={{ ...p.config, label: "updated config object" }}
      configPosition={{
        ...p.configPosition,
        y: p.configPosition.y + 10,
        z: p.configPosition.z + 10,
      }} />);
    expect(electronicsBoxPosition(container).equals(initialPosition))
      .toBeTruthy();
    expect(container.innerHTML).toEqual(initialHtml);
    expect(useGltfMock.mock.calls.length).toEqual(initialModelCalls);
  });

  it("updates position when x changes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container, rerender } = render(<ElectronicsBox {...p} />);
    const initialPosition = electronicsBoxPosition(container).clone();
    rerender(<ElectronicsBox
      config={{ ...p.config, label: "updated config object" }}
      configPosition={{
        ...p.configPosition,
        x: p.configPosition.x + 25,
        y: p.configPosition.y + 10,
        z: p.configPosition.z + 10,
      }} />);
    const nextPosition = electronicsBoxPosition(container);
    expect(nextPosition.x).toEqual(initialPosition.x + 25);
    expect(nextPosition.y).toEqual(initialPosition.y);
    expect(nextPosition.z).toEqual(initialPosition.z);
  });

  it("updates model when kit version changes", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container, rerender } = render(<ElectronicsBox {...p} />);
    expect(container).not.toContainHTML("leds");
    rerender(<ElectronicsBox
      {...p}
      config={{ ...p.config, kitVersion: "v1.7" }} />);
    expect(container).toContainHTML("leds");
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.led, expect.anything());
  });

  it("doesn't load hidden LEDs for v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<ElectronicsBox {...p} />);
    expect(container).not.toContainHTML("leds");
    expect(useGltfMock).not.toHaveBeenCalledWith(
      ASSETS.models.led, expect.anything());
  });

  it("renders LEDs for v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<ElectronicsBox {...p} />);
    expect(container).toContainHTML("leds");
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.led, expect.anything());
  });
});
