import React from "react";
import {
  ZDisplay, ZDisplayProps, ZDisplayToggle, ZDisplayToggleProps,
} from "../z_display";
import {
  fakeBotLocationData, fakeBotSize,
} from "../../../../__test_support__/fake_bot_data";
import {
  fakeFbosConfig,
  fakeFirmwareConfig, fakePoint, fakeToolSlot,
} from "../../../../__test_support__/fake_state/resources";
import { tagAsSoilHeight } from "../../../../points/soil_height";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";
import { fireEvent, render } from "@testing-library/react";

describe("<ZDisplayToggle />", () => {
  const fakeProps = (): ZDisplayToggleProps => ({
    open: false,
    setOpen: jest.fn(),
  });

  it("sets open", () => {
    const p = fakeProps();
    const { container } = render(<ZDisplayToggle {...p} />);
    const button = container.querySelector("button");
    if (!button) { throw new Error("Missing z display toggle button"); }
    fireEvent.click(button);
    expect(p.setOpen).toHaveBeenCalledWith(true);
  });

  it("sets closed", () => {
    const p = fakeProps();
    p.open = true;
    const { container } = render(<ZDisplayToggle {...p} />);
    const button = container.querySelector("button");
    if (!button) { throw new Error("Missing z display toggle button"); }
    fireEvent.click(button);
    expect(p.setOpen).toHaveBeenCalledWith(false);
  });
});

describe("<ZDisplay />", () => {
  const fakeProps = (): ZDisplayProps => {
    const soilPoint = fakePoint();
    tagAsSoilHeight(soilPoint);
    soilPoint.body.z = -200;
    const slot = fakeToolSlot();
    slot.body.z = -100;
    const fbosConfig = fakeFbosConfig().body;
    fbosConfig.soil_height = -400;
    return {
      allPoints: [soilPoint, slot],
      sourceFbosConfig: x => ({
        value: fbosConfig[x as keyof FbosConfig],
        consistent: true,
      }),
      firmwareConfig: fakeFirmwareConfig().body,
      botLocationData: fakeBotLocationData(),
      botSize: fakeBotSize(),
    };
  };

  it("renders z display", () => {
    const { container } = render(<ZDisplay {...fakeProps()} />);
    ["-100", "soil", "z", "safe", "slots"].map(string =>
      expect(container.innerHTML).toContain(string));
  });

  it("renders z display without negative coordinates", () => {
    const p = fakeProps();
    p.firmwareConfig.movement_home_up_z = 0;
    const { container } = render(<ZDisplay {...p} />);
    expect(container.innerHTML).not.toContain("-100");
  });
});
