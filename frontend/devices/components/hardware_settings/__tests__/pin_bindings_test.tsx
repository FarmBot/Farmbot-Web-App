import * as React from "react";
import { mount } from "enzyme";
import { PinBindings } from "../pin_bindings";
import { PinBindingsProps } from "../../interfaces";
import { panelState } from "../../../../__test_support__/control_panel_state";
import {
  buildResourceIndex
} from "../../../../__test_support__/resource_index_builder";

describe("<PinBindings />", () => {
  const fakeProps = (): PinBindingsProps => ({
    dispatch: jest.fn(),
    controlPanelState: panelState(),
    resources: buildResourceIndex([]).index,
    firmwareHardware: undefined,
  });

  it("shows pin binding labels", () => {
    const p = fakeProps();
    const wrapper = mount(<PinBindings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pin bindings");
  });
});
