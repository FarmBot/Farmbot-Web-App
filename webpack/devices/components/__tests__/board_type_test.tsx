import * as React from "react";
import { mount } from "enzyme";
import { BoardType } from "../board_type";

describe("<BoardType/>", () => {
  it("Farmduino", () => {
    const wrapper = mount(<BoardType
      currentFWVersion={"5.0.3.F"} />);
    expect(wrapper.text()).toContain("Farmduino");
  });

  it("Arduino/RAMPS", () => {
    const wrapper = mount(<BoardType
      currentFWVersion={"5.0.3.R"} />);
    expect(wrapper.text()).toContain("Arduino/RAMPS");
  });

  it("Other", () => {
    const wrapper = mount(<BoardType
      currentFWVersion={"4.0.2"} />);
    expect(wrapper.text()).toContain("unknown");
  });

  it("Unknown", () => {
    const wrapper = mount(<BoardType
      currentFWVersion={undefined} />);
    expect(wrapper.text()).toContain("unknown");
  });
});
