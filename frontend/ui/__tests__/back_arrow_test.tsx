import React from "react";
import { shallow } from "enzyme";
import { BackArrow } from "../back_arrow";

describe("<BackArrow />", () => {
  it("renders", () => {
    const wrapper = shallow(<BackArrow />);
    expect(wrapper.hasClass("back-arrow")).toBeTruthy();
    expect(wrapper.find("i").at(0).hasClass("fa-arrow-left"))
      .toBeTruthy();
  });

  it("triggers callbacks", () => {
    const cb = jest.fn();
    const element = shallow(<BackArrow onClick={cb} />);
    element.simulate("click");
    expect(cb).toHaveBeenCalled();
  });

  it("doesn't trigger callback", () => {
    history.back = jest.fn();
    const element = shallow(<BackArrow />);
    element.simulate("click");
    expect(history.back).toHaveBeenCalled();
  });
});
