import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { ElectronicsBox, ElectronicsBoxProps } from "../electronics_box";
import { ASSETS } from "../../../constants";

const useGltfMock = useGLTF as unknown as jest.Mock;

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
