import * as React from "react";
import { mount } from "enzyme";
import { AddButtonProps } from "../interfaces";
import { AddButton } from "../add_button";

describe("<AddButton />", () => {
  it("renders an add button when active", () => {
    const props: AddButtonProps = { active: true, click: jest.fn() };
    const wrapper =mount<>(<AddButton {...props} />);
    const button = wrapper.find("button");
    ["green", "add"].map(klass => {
      expect(button.hasClass(klass)).toBeTruthy();
    });
    expect(wrapper.find("i").hasClass("fa-plus")).toBeTruthy();
    button.simulate("click");
    expect(props.click).toHaveBeenCalled();
  });

  it("renders a <div> when inactive", () => {
    const props: AddButtonProps = { active: false, click: jest.fn() };
    const wrapper =mount<>(<AddButton {...props} />);
    expect(wrapper.html()).toEqual("<div></div>");
  });
});
