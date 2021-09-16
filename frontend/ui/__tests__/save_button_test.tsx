import React from "react";
import { shallow } from "enzyme";
import { SaveBtn, SaveBtnProps } from "../save_button";
import { SpecialStatus } from "farmbot";

describe("<SaveBtn />", () => {
  const fakeProps = (): SaveBtnProps => ({
    status: SpecialStatus.SAVED,
  });

  it("returns button", () => {
    const wrapper = shallow(<SaveBtn {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("saved");
  });
});
