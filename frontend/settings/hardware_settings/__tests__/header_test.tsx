import React from "react";
import { Header, HeaderProps } from "../header";
import { ExpandableHeader } from "../../../ui/expandable_header";
import { DeviceSetting, Actions } from "../../../constants";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<Header />", () => {
  const fakeProps = (): HeaderProps => ({
    dispatch: jest.fn(),
    panel: "motors",
    title: DeviceSetting.motors,
    expanded: true,
  });

  it("renders", () => {
    const wrapper = createRenderer(<Header {...fakeProps()} />);
    const header = wrapper.root.findByType(ExpandableHeader);
    expect((header.props.title || "").toLowerCase()).toContain("motors");
    expect(header.props.expanded).toBe(true);
    unmountRenderer(wrapper);
  });

  it("handles click", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<Header {...p} />);
    const header = wrapper.root.findByType(ExpandableHeader);
    actRenderer(() => {
      header.props.onClick();
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
      payload: "motors",
    });
    unmountRenderer(wrapper);
  });
});
