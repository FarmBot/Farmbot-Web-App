import React from "react";
import { render } from "@testing-library/react";
import { Greenhouse, GreenhouseProps } from "../greenhouse";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<Greenhouse />", () => {
  const fakeProps = (): GreenhouseProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.scene = "Greenhouse";
    p.config.people = false;
    p.activeFocus = "";
    const { container } = render(<Greenhouse {...p} />);
    expect(container).toContainHTML("greenhouse-environment");
    expect(container).not.toContainHTML("people");
    expect(container).toContainHTML("starter-tray-1");
    expect(container).toContainHTML("starter-tray-2");
    expect(container).toContainHTML("left-greenhouse-wall");
    expect(container).toContainHTML("right-greenhouse-wall");
    expect(container).toContainHTML("potted-plant");
  });

  it("not visible when scene is not greenhouse", () => {
    const p = fakeProps();
    p.config.scene = "Lab";
    const { container } = render(<Greenhouse {...p} />);
    expect(container).not.toContainHTML("greenhouse-environment");
  });

  it("renders with people", () => {
    const p = fakeProps();
    p.config.scene = "Greenhouse";
    p.config.people = true;
    p.activeFocus = "";
    const { container } = render(<Greenhouse {...p} />);
    expect(container).toContainHTML("greenhouse-environment");
    expect(container).toContainHTML("people");
  });

  it("doesn't render people or potted plant when active focus is set", () => {
    const p = fakeProps();
    p.config.scene = "Greenhouse";
    p.config.people = true;
    p.activeFocus = "foo";
    const { container } = render(<Greenhouse {...p} />);
    expect(container).toContainHTML("greenhouse-environment");
    expect(container).not.toContainHTML("people");
  });
});
