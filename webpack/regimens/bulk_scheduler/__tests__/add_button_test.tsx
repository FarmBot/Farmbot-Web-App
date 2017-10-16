import * as React from "react";
import { shallow, mount } from "enzyme";
import { AddButton } from "../add_button";

describe("<AddButton/>", () => {
  it("renders a <div> when inactive", () => {
    const props = { active: false, click: jest.fn() };
    const el = shallow(<AddButton {...props} />);
    expect(el).toBeTruthy();
    expect(el.length).toBe(1);
    expect(el.find("div").length).toBe(1);
    expect(el.find("button").length).toBe(0);
  });

  it("renders an add button when active", () => {
    const props = { active: true, click: jest.fn() };
    const el = mount(<AddButton {...props} />);
    expect(el).toBeTruthy();
    const btn = el.find("button");
    expect(btn.length).toBe(1);
    btn.simulate("click");
    expect(props.click).toHaveBeenCalled();
  });
});
