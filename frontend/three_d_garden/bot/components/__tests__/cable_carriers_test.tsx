import React from "react";
import { render } from "@testing-library/react";
import {
  CableCarrierVertical, CableCarrierVerticalProps,
  CableCarrierHorizontal, CableCarrierHorizontalProps,
} from "../cable_carriers";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<CableCarrierVertical />", () => {
  const fakeProps = (): CableCarrierVerticalProps => ({
    config: clone(INITIAL),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = render(<CableCarrierVertical {...p} />);
    expect(wrapper.container).toContainHTML("ccVertical");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(4);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = render(<CableCarrierVertical {...p} />);
    expect(wrapper.container).toContainHTML("ccVertical");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });
});

describe("<CableCarrierHorizontal />", () => {
  const fakeProps = (): CableCarrierHorizontalProps => ({
    config: clone(INITIAL),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = render(<CableCarrierHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(5);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = render(<CableCarrierHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });

  it("renders v1.8: lights on", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.config.light = true;
    const wrapper = render(<CableCarrierHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });
});
