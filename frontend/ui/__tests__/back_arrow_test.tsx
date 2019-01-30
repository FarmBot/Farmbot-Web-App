import * as React from "react";
import { BackArrow } from "../back_arrow";
import { shallow } from "enzyme";

describe("<BackArrow />", () => {
  it("renders", () => {
    const element = shallow(BackArrow({}));
    expect(element).toBeTruthy();
    expect(element.hasClass("back-arrow")).toBeTruthy();
    expect(element.find("i").at(0).hasClass("fa-arrow-left"))
      .toBeTruthy();
  });

  it("triggers callbacks", () => {
    const cb = jest.fn();
    const element = shallow(<BackArrow onClick={cb} />);
    element.simulate("click");
    expect(cb).toHaveBeenCalled();
  });
});
