import React from "react";
import { mount } from "enzyme";
import { UpdateRow } from "../update_row";
import { UpdateRowProps } from "../interfaces";

describe("<UpdateRow />", () => {
  const fakeProps = (): UpdateRowProps => ({
    version: "1.0.0",
    botOnline: true,
  });

  it("renders", () => {
    const wrapper = mount(<UpdateRow {...fakeProps()} />);
    expect(wrapper.text()).toContain("1.0.0");
  });
});
