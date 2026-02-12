import React from "react";
import { Header, HeaderProps } from "../header";
import TestRenderer from "react-test-renderer";
import { ExpandableHeader } from "../../../ui/expandable_header";
import { DeviceSetting, Actions } from "../../../constants";

describe("<Header />", () => {
  const fakeProps = (): HeaderProps => ({
    dispatch: jest.fn(),
    panel: "motors",
    title: DeviceSetting.motors,
    expanded: true,
  });

  it("renders", () => {
    const wrapper = TestRenderer.create(<Header {...fakeProps()} />);
    const header = wrapper.root.findByType(ExpandableHeader);
    expect((header.props.title || "").toLowerCase()).toContain("motors");
    expect(header.props.expanded).toBe(true);
    wrapper.unmount();
  });

  it("handles click", () => {
    const p = fakeProps();
    const wrapper = TestRenderer.create(<Header {...p} />);
    const header = wrapper.root.findByType(ExpandableHeader);
    header.props.onClick();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
      payload: "motors",
    });
    wrapper.unmount();
  });
});
