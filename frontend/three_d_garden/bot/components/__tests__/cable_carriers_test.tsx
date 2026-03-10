import React from "react";
import { render } from "@testing-library/react";
import {
  CableCarrierSupportVertical, CableCarrierSupportVerticalProps,
  CableCarrierSupportHorizontal, CableCarrierSupportHorizontalProps,
} from "../cable_carriers";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<CableCarrierVertical />", () => {
  const fakeProps = (): CableCarrierSupportVerticalProps => ({
    config: clone(INITIAL),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportVertical {...p} />);
    expect(container.innerHTML).toContain("ccSupportVertical");
    expect(container.querySelectorAll("mesh").length).toBe(1);
  });
});

describe("<CableCarrierHorizontal />", () => {
  const fakeProps = (): CableCarrierSupportHorizontalProps => ({
    config: clone(INITIAL),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("instancedmesh").length).toBe(1);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<CableCarrierSupportHorizontal {...p} />);
    expect(container.innerHTML).toContain("ccSupportHorizontal");
    expect(container.querySelectorAll("mesh").length).toBe(1);
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
