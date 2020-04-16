import React from "react";
import { mount, shallow } from "enzyme";
import { SearchField, SearchFieldProps } from "../search_field";
import { changeEvent } from "../../__test_support__/fake_html_events";

describe("<SearchField />", () => {
  const fakeProps = (): SearchFieldProps => ({
    onChange: jest.fn(),
    searchTerm: "",
    placeholder: "search...",
  });

  it("renders", () => {
    const wrapper = mount(<SearchField {...fakeProps()} />);
    expect(wrapper.find("input").props().placeholder).toEqual("search...");
  });

  it("changes search term", () => {
    const p = fakeProps();
    const wrapper = shallow(<SearchField {...p} />);
    const e = changeEvent("new");
    wrapper.find("input").simulate("change", e);
    expect(p.onChange).toHaveBeenCalledWith("new");
  });

  it("changes search term on key press", () => {
    const p = fakeProps();
    p.onKeyPress = jest.fn();
    const wrapper = shallow(<SearchField {...p} />);
    const e = changeEvent("new");
    wrapper.find("input").simulate("KeyPress", e);
    expect(p.onKeyPress).toHaveBeenCalledWith("new");
  });

  it("doesn't change search term on key press", () => {
    const p = fakeProps();
    p.onKeyPress = undefined;
    const wrapper = shallow(<SearchField {...p} />);
    const e = changeEvent("new");
    wrapper.find("input").simulate("KeyPress", e);
    expect(p.onChange).not.toHaveBeenCalled();
  });

  it("clears search term", () => {
    const p = fakeProps();
    p.searchTerm = "old";
    const wrapper = shallow(<SearchField {...p} />);
    wrapper.find("i").last().simulate("click");
    expect(p.onChange).toHaveBeenCalledWith("");
  });
});
