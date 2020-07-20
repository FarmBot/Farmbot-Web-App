import * as React from "react";
import { mount } from "enzyme";
import { FlashFirmwareRow } from "../../firmware/flash_firmware_row";
import { FlashFirmwareRowProps } from "../interfaces";
import { DeviceSetting } from "../../../constants";

describe("<FlashFirmwareRow />", () => {
  const fakeProps = (): FlashFirmwareRowProps => ({
    botOnline: true,
    firmwareHardware: undefined,
  });

  it("renders", () => {
    const wrapper = mount(<FlashFirmwareRow {...fakeProps()} />);
    expect(wrapper.text()).toContain(DeviceSetting.flashFirmware);
  });
});
