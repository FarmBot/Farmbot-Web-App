import React from "react";
import { render } from "@testing-library/react";
import { Lab, labPropsEqual, LabProps } from "../lab";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Lab />", () => {
  const fakeProps = (): LabProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    p.config.people = false;
    p.activeFocus = "";
    render(<Lab {...p} />);
    const { container } = render(<Lab {...p} />);
    expect(container).toContainHTML("shelf");
    expect(container).not.toContainHTML("people");
  });

  it("memoizes unchanged scene props", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    render(<Lab {...p} />);
    const memoized = Lab as unknown as { $$typeof: symbol };
    expect(memoized.$$typeof.toString()).toContain("react.memo");
  });

  it("compares lab-relevant config fields", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    expect(labPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(labPropsEqual(p, {
      ...p,
      config: { ...p.config, desk: !p.config.desk },
    })).toBeFalsy();
    expect(labPropsEqual(p, { ...p, activeFocus: "desk" })).toBeFalsy();
  });

  it("not visible when scene is not lab", () => {
    const p = fakeProps();
    p.config.scene = "Greenhouse";
    render(<Lab {...p} />);
    const { container } = render(<Lab {...p} />);
    expect(container).not.toContainHTML("shelf");
    expect(container).not.toContainHTML("people");
  });

  it("renders with people", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    p.config.people = true;
    p.activeFocus = "";
    render(<Lab {...p} />);
    const { container } = render(<Lab {...p} />);
    expect(container).toContainHTML("shelf");
    expect(container).toContainHTML("people");
  });

  it("animates scene details in", () => {
    const p = fakeProps();
    const onDetailsLoadInRest = jest.fn();
    p.config.scene = "Lab";
    const { container } = render(<Lab {...p}
      onDetailsLoadInRest={onDetailsLoadInRest} />);
    expect(container).toContainHTML("lab-scene-details-load-in");
    expect(onDetailsLoadInRest).toHaveBeenCalled();
  });
});
