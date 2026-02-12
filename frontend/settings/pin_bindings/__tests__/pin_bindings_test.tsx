import React from "react";
import { render } from "@testing-library/react";
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
    const { container } = render(<PinBindings {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("pin bindings");
  });
});
