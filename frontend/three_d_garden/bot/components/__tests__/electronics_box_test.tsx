import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import type { Vector3 } from "three";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { ElectronicsBox, ElectronicsBoxProps } from "../electronics_box";
import { ASSETS } from "../../../constants";

const useGltfMock = useGLTF as unknown as jest.Mock;

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
  const position = (props as { position?: Vector3 } | undefined)?.position;
  if (!position) {
    throw new Error("electronics-box position missing");
  }
  return position;
};

beforeEach(() => {
  useGltfMock.mockClear();
});

describe("<ElectronicsBox />", () => {
  const fakeProps = (): ElectronicsBoxProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders box", () => {
    const { container } = render(<ElectronicsBox {...fakeProps()} />);
    expect(container).toContainHTML("electronics-box");
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
