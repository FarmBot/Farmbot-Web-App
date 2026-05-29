import React from "react";
import { render } from "@testing-library/react";
import {
  Clouds, CloudsBase, CloudsProps, cloudsConfigEquals,
} from "../clouds";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Clouds />", () => {
  const fakeProps = (): CloudsProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<CloudsBase {...fakeProps()} />);
    expect(container).toContainHTML("clouds");
  });

  it("doesn't mount zero-opacity clouds", () => {
    const p = fakeProps();
    p.config.plants = "Summer";
    const { container } = render(<CloudsBase {...p} />);
    expect(container).not.toContainHTML("clouds");
  });

  it("renders through the memoized export", () => {
    const p = fakeProps();
    const { container, rerender } = render(<Clouds {...p} />);
    rerender(<Clouds config={{
      ...p.config,
      grid: !p.config.grid,
    }} />);
    expect(container).toContainHTML("clouds");
  });

  it("compares cloud-relevant config fields", () => {
    const config = fakeProps().config;
    expect(cloudsConfigEquals(config, {
      ...config,
      grid: !config.grid,
      labels: !config.labels,
      viewpointHeading: config.viewpointHeading + 90,
      sun: config.sun + 1,
    })).toBeTruthy();
    expect(cloudsConfigEquals(config, {
      ...config,
      clouds: !config.clouds,
    })).toBeFalsy();
    expect(cloudsConfigEquals(config, {
      ...config,
      animate: !config.animate,
    })).toBeFalsy();
    expect(cloudsConfigEquals(config, {
      ...config,
      plants: "Fall",
    })).toBeFalsy();
  });
});
