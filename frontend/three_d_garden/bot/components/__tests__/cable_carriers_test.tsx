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
    const wrapper = render(<CableCarrierSupportVertical {...p} />);
    expect(wrapper.container).toContainHTML("ccSupportVertical");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(4);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = render(<CableCarrierSupportVertical {...p} />);
    expect(wrapper.container).toContainHTML("ccSupportVertical");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });
});

describe("<CableCarrierHorizontal />", () => {
  const fakeProps = (): CableCarrierSupportHorizontalProps => ({
    config: clone(INITIAL),
  });

  it("renders v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const wrapper = render(<CableCarrierSupportHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccSupportHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(5);
  });

  it("renders v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const wrapper = render(<CableCarrierSupportHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccSupportHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });

  it("renders v1.8: lights on", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    p.config.light = true;
    const wrapper = render(<CableCarrierSupportHorizontal {...p} />);
    expect(wrapper.container).toContainHTML("ccSupportHorizontal");
    expect(wrapper.container.querySelectorAll("mesh").length).toBe(1);
  });
});
