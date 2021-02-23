import React from "react";
import { mount } from "enzyme";
import { FbosButtonRow, FbosButtonRowProps } from "../fbos_button_row";
import { DeviceSetting } from "../../../constants";

describe("<FbosButtonRow />", () => {
  const fakeProps = (): FbosButtonRowProps => ({
    botOnline: true,
    label: DeviceSetting.motors,
    description: "description",
    buttonText: "click",
    color: "green",
    action: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<FbosButtonRow {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("click");
  });
});
