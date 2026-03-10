import React from "react";
import { render } from "@testing-library/react";
import { PinGuard } from "../pin_guard";
import { PinGuardProps } from "../interfaces";
import { settingsPanelState } from "../../../__test_support__/panel_state";
import { fakeState } from "../../../__test_support__/fake_state";

describe("<PinGuard />", () => {
  const fakeProps = (): PinGuardProps => ({
    dispatch: jest.fn(),
    settingsPanelState: settingsPanelState(),
    sourceFwConfig: () => ({ value: 0, consistent: true }),
    firmwareHardware: undefined,
    resources: fakeState().resources.index,
    arduinoBusy: false,
  });

  it("renders", () => {
    const p = fakeProps();
    p.settingsPanelState.pin_guard = true;
    const { container } = render(<PinGuard {...p} />);
    expect((container.textContent || "").toLowerCase()).toContain("select a pin");
  });
});
