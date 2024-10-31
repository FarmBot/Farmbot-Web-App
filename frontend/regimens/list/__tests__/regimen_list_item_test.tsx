jest.mock("../../actions", () => ({ selectRegimen: jest.fn() }));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
}));

import React from "react";
import { RegimenListItemProps } from "../../interfaces";
import { RegimenListItem } from "../regimen_list_item";
import { render, shallow, mount } from "enzyme";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SpecialStatus, Color } from "farmbot";
import { selectRegimen } from "../../actions";
import { edit } from "../../../api/crud";
import { Path } from "../../../internal_urls";

describe("<RegimenListItem/>", () => {
  const fakeProps = (): RegimenListItemProps => ({
    regimen: fakeRegimen(),
    dispatch: jest.fn(),
    inUse: false
  });

  it("renders the base case", () => {
    const p = fakeProps();
    const wrapper = render(<RegimenListItem {...p} />);
    expect(wrapper.html()).toContain(p.regimen.body.name);
    expect(wrapper.html()).toContain(p.regimen.body.color);
  });

  it("shows unsaved data indicator", () => {
    const p = fakeProps();
    p.regimen.specialStatus = SpecialStatus.DIRTY;
    const wrapper = render(<RegimenListItem {...p} />);
    expect(wrapper.text()).toContain("Foo *");
  });

  it("shows in-use indicator", () => {
    const p = fakeProps();
    p.inUse = true;
    const wrapper = render(<RegimenListItem {...p} />);
    expect(wrapper.find(".in-use").length).toEqual(1);
  });

  it("doesn't show in-use indicator", () => {
    const p = fakeProps();
    const wrapper = render(<RegimenListItem {...p} />);
    expect(wrapper.find(".in-use").length).toEqual(0);
  });

  it("selects regimen", () => {
    const p = fakeProps();
    p.regimen.body.name = "foo";
    const wrapper = shallow(<RegimenListItem {...p} />);
    wrapper.simulate("click");
    expect(selectRegimen).toHaveBeenCalledWith(p.regimen.uuid);
    expect(mockNavigate).toHaveBeenCalledWith(Path.regimens("foo"));
  });

  it("changes color", () => {
    const p = fakeProps();
    const wrapper = shallow(<RegimenListItem {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(edit).toHaveBeenCalledWith(p.regimen, { color: "red" });
  });

  it("handles missing data", () => {
    const p = fakeProps();
    p.regimen.body.name = "";
    p.regimen.body.color = "" as Color;
    p.regimen.specialStatus = SpecialStatus.DIRTY;
    location.pathname = Path.mock(Path.regimens());
    const wrapper = mount(<RegimenListItem {...p} />);
    expect(wrapper.text()).toEqual(" *");
    expect(wrapper.find(".saucer").hasClass("gray")).toBeTruthy();
  });

  it("doesn't open regimen", () => {
    const wrapper = shallow(<RegimenListItem {...fakeProps()} />);
    const e = { stopPropagation: jest.fn() };
    wrapper.find(".regimen-color").simulate("click", e);
    expect(e.stopPropagation).toHaveBeenCalled();
  });
});
