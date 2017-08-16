jest.mock("../../../device", () => ({
  devices: {
    current: {
      findHome: jest.fn()
    }
  }
}));
import * as React from "react";
import { mount } from "enzyme";
import { HomingRow } from "../homing_row";
import { bot } from "../../../__test_support__/fake_state/bot";
import { devices } from "../../../device";

describe("<HomingRow />", () => {
  beforeEach(function () {
    jest.clearAllMocks();
  });
  // TODO: fix this test
  //       Code being run is {t("HOME {{axis}}", { axis })}
  //       Result string is "HOME {{axis}}HOME {{axis}}HOME {{axis}}"
  //       Console example (result is "HOME {{ax}}"):
  //         let ax = "x";
  // it("renders three buttons", () => {
  //   const wrapper = mount(<HomingRow hardware={bot.hardware.mcu_params} />);
  //   let txt = wrapper.text();
  //   ["X", "Y", "Z"].map(function (axis) {
  //     expect(txt).toContain(`HOME ${axis}`);
  //   });
  // });
  it("calls device", () => {
    let { mock } = devices.current.findHome as jest.Mock<{}>;
    let result = mount(<HomingRow hardware={bot.hardware.mcu_params} />);
    result.find("LockableButton").at(0).simulate("click");
    result.find("LockableButton").at(1).simulate("click");
    result.find("LockableButton").at(2).simulate("click");
    expect(mock.calls.length).toEqual(2);
    expect(mock.calls[0][0].axis).toEqual("x");
    expect(mock.calls[1][0].axis).toEqual("y");
  });
});
