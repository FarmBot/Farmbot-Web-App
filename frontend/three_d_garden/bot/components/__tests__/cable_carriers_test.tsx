import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import {
  CableCarrierSupportVertical, CableCarrierSupportVerticalProps,
  CableCarrierSupportHorizontal, CableCarrierSupportHorizontalProps,
} from "../cable_carriers";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { ASSETS } from "../../../constants";

const useGltfMock = useGLTF as unknown as jest.Mock;

beforeEach(() => {
  useGltfMock.mockClear();
});

describe("<CableCarrierVertical />", () => {
  const fakeProps = (): CableCarrierSupportVerticalProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.ccSupportVertical, expect.anything());
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("mesh").length).toBe(1);
    expect(useGltfMock).not.toHaveBeenCalledWith(
      ASSETS.models.ccSupportVertical, expect.anything());
  });
});

describe("<CableCarrierHorizontal />", () => {
  const fakeProps = (): CableCarrierSupportHorizontalProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
    expect(useGltfMock).toHaveBeenCalledWith(
      ASSETS.models.ccSupportHorizontal, expect.anything());
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("mesh").length).toBe(1);
    expect(useGltfMock).not.toHaveBeenCalledWith(
      ASSETS.models.ccSupportHorizontal, expect.anything());
  });

  it("renders v1.8: lights on", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.config.light = true;
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("mesh").length).toBe(1);
  });
});
