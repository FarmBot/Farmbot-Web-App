jest.mock("../edit", () => ({
  editCriteria: jest.fn(),
  toggleStringCriteria: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  AddEqCriteria, AddNumberCriteria, editCriteria, AddStringCriteria,
  toggleStringCriteria,
  POINTER_TYPE_LIST,
} from "..";
import {
  AddEqCriteriaProps, NumberCriteriaProps, DEFAULT_CRITERIA,
  AddStringCriteriaProps,
} from "../interfaces";
import {
  fakePointGroup
} from "../../../../__test_support__/fake_state/resources";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { PLANT_STAGE_LIST } from "../../../plants/edit_plant_status";

describe("<AddEqCriteria<string> />", () => {
  const fakeProps = (): AddEqCriteriaProps<string> => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    type: "string",
    criteriaField: undefined,
    criteriaKey: "string_eq",
  });

  it("renders string_eq add", () => {
    const wrapper = mount(<AddEqCriteria<string> {...fakeProps()} />);
    expect(wrapper.text()).toContain("=");
  });

  it("changes field", () => {
    const wrapper = shallow<AddEqCriteria<string>>(
      <AddEqCriteria<string> {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "openfarm_slug" }
    });
    expect(wrapper.state().key).toEqual("openfarm_slug");
  });

  it("changes value", () => {
    const wrapper = shallow<AddEqCriteria<string>>(
      <AddEqCriteria<string> {...fakeProps()} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "slug" }
    });
    expect(wrapper.state().value).toEqual("slug");
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<AddEqCriteria<string> {...p} />);
    wrapper.setState({ key: "openfarm_slug", value: "slug" });
    wrapper.find("button").last().simulate("click");
    expect(editCriteria).toHaveBeenCalledWith(p.group, {
      string_eq: { openfarm_slug: ["slug"] }
    });
  });
});

describe("<AddEqCriteria<number> />", () => {
  const fakeProps = (): AddEqCriteriaProps<number> => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    type: "number",
    criteriaField: {},
    criteriaKey: "number_eq",
  });

  it("renders number_eq add", () => {
    const wrapper = mount(<AddEqCriteria<number> {...fakeProps()} />);
    expect(wrapper.text()).toContain("=");
  });

  it("changes field", () => {
    const wrapper = shallow<AddEqCriteria<number>>(
      <AddEqCriteria<number> {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "x" }
    });
    expect(wrapper.state().key).toEqual("x");
  });

  it("changes value", () => {
    const wrapper = shallow<AddEqCriteria<number>>(
      <AddEqCriteria<number> {...fakeProps()} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "1" }
    });
    expect(wrapper.state().value).toEqual("1");
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<AddEqCriteria<number> {...p} />);
    wrapper.setState({ key: "x", value: 1 });
    wrapper.find("button").last().simulate("click");
    expect(editCriteria).toHaveBeenCalledWith(p.group, {
      number_eq: { x: [1] }
    });
  });
});

describe("<AddStringCriteria />", () => {
  const fakeProps = (): AddStringCriteriaProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    slugs: ["apple", "orange"],
  });

  it("renders", () => {
    const wrapper = mount(<AddStringCriteria {...fakeProps()} />);
    expect(wrapper.text()).toContain("None");
  });

  it("changes key", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.find("FBSelect").first().simulate("change", {
      value: "openfarm_slug", label: ""
    });
    expect(wrapper.state().key).toEqual("openfarm_slug");
  });

  it("changes value", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "openfarm_slug" });
    wrapper.find("FBSelect").last().simulate("change", {
      label: "", value: "slug"
    });
    expect(wrapper.state().value).toEqual("slug");
  });

  it("renders slug list", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "openfarm_slug", value: "pear" });
    expect(wrapper.find("FBSelect").last().props().list).toEqual([
      { label: "Apple", value: "apple" },
      { label: "Orange", value: "orange" },
    ]);
    expect(wrapper.instance().selected).toEqual({
      label: "Pear", value: "pear"
    });
  });

  it("returns selected point type", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "pointer_type", value: "" });
    expect(wrapper.instance().selected).toEqual(undefined);
  });

  it("renders point type list", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "pointer_type", value: "Plant" });
    expect(wrapper.find("FBSelect").last().props().list)
      .toEqual(POINTER_TYPE_LIST());
    expect(wrapper.instance().selected).toEqual({
      label: "Plants", value: "Plant"
    });
  });

  it("returns selected plant stage", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "plant_stage", value: "" });
    expect(wrapper.instance().selected).toEqual(undefined);
  });

  it("renders plant stage list", () => {
    const wrapper = shallow<AddStringCriteria>(
      <AddStringCriteria {...fakeProps()} />);
    wrapper.setState({ key: "plant_stage", value: "planted" });
    expect(wrapper.find("FBSelect").last().props().list)
      .toEqual(PLANT_STAGE_LIST());
    expect(wrapper.instance().selected).toEqual({
      label: "Planted", value: "planted"
    });
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<AddStringCriteria {...p} />);
    wrapper.setState({ key: "openfarm_slug", value: "slug" });
    wrapper.find("button").last().simulate("click");
    expect(toggleStringCriteria).toHaveBeenCalledWith(
      p.group, "openfarm_slug", "slug");
  });

  it("doesn't update criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<AddStringCriteria {...p} />);
    wrapper.setState({ key: "openfarm_slug", value: "" });
    wrapper.find("button").last().simulate("click");
    expect(toggleStringCriteria).not.toHaveBeenCalled();
  });
});

describe("<AddNumberCriteria />", () => {
  const fakeProps = (): NumberCriteriaProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    criteriaKey: "number_lt",
    criteria: DEFAULT_CRITERIA,
  });

  it("renders", () => {
    const wrapper = mount(<AddNumberCriteria {...fakeProps()} />);
    expect(wrapper.text()).toContain("<");
  });

  it("changes field", () => {
    const wrapper = shallow<AddNumberCriteria>(
      <AddNumberCriteria {...fakeProps()} />);
    wrapper.find("input").first().simulate("change", {
      currentTarget: { value: "x" }
    });
    expect(wrapper.state().key).toEqual("x");
  });

  it("changes value", () => {
    const wrapper = shallow<AddNumberCriteria>(
      <AddNumberCriteria {...fakeProps()} />);
    wrapper.find("input").last().simulate("change", {
      currentTarget: { value: "1" }
    });
    expect(wrapper.state().value).toEqual(1);
  });

  it("updates criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<AddNumberCriteria {...p} />);
    wrapper.setState({ key: "x", value: 1 });
    wrapper.find("button").last().simulate("click");
    expect(editCriteria).toHaveBeenCalledWith(p.group, { number_lt: { x: 1 } });
  });

  it("handles missing criteria", () => {
    const p = fakeProps();
    p.group.body.criteria = undefined as unknown as PointGroup["criteria"];
    const wrapper = mount(<AddNumberCriteria {...p} />);
    expect(wrapper.text()).toContain("<");
  });
});
