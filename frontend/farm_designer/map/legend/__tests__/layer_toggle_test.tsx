import React from "react";
import { LayerToggle, LayerToggleProps } from "../layer_toggle";
import { DeviceSetting } from "../../../../constants";
import { BooleanSetting } from "../../../../session_keys";
import { fireEvent, render } from "@testing-library/react";

describe("<LayerToggle />", () => {
  const fakeProps = (): LayerToggleProps => ({
    settingName: BooleanSetting.show_farmbot,
    label: DeviceSetting.showFarmbot,
    value: true,
    onClick: jest.fn(),
  });

  it("renders", () => {
    const { container } = render(<LayerToggle {...fakeProps()} />);
    expect(container.textContent).toContain("FarmBot");
    expect(container.innerHTML).toContain("green");
  });

  it("toggles", () => {
    const p = fakeProps();
    const { container } = render(<LayerToggle {...p} />);
    const button = container.querySelector(".fb-layer-toggle");
    if (!button) { throw new Error("Missing layer toggle button"); }
    fireEvent.click(button);
    expect(p.onClick).toHaveBeenCalled();
  });
});
