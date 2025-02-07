import React from "react";
import { render } from "@testing-library/react";
import { Lab, LabProps } from "../lab";
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
});
