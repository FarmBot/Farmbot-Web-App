import * as React from "react";
import { Circle, CircleProps } from "../circle";
import { shallow } from "enzyme";

describe("<Circle/>", () => {
  function fakeProps(): CircleProps {
    return {
      x: 10,
      y: 20,
      r: 30,
      selected: true
    };
  }

  it("renders selected plant indicator", () => {
    const wrapper = shallow(<Circle {...fakeProps()} />);
    expect(wrapper.props().cx).toEqual(10);
    expect(wrapper.props().cy).toEqual(20);
    expect(wrapper.props().r).toEqual(36);
  });

  it("hides selected plant indicator", () => {
    const p = fakeProps();
    p.selected = false;
    const wrapper = shallow(<Circle {...p} />);
    expect(wrapper.props().cx).toEqual(10);
    expect(wrapper.props().cy).toEqual(20);
    expect(wrapper.props().r).toEqual(0);
  });

});
