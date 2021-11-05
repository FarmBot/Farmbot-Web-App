import React from "react";
import { mount } from "enzyme";
import { PinBindings } from "../../pin_bindings/pin_bindings";
import { PinBindingsProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<PinBindings />", () => {
  const fakeProps = (): PinBindingsProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    resources: buildResourceIndex([]).index,
    firmwareHardware: undefined,
  });

  it("shows pin binding labels", () => {
    const p = fakeProps();
    const wrapper = mount(<PinBindings {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("pin bindings");
  });
});
