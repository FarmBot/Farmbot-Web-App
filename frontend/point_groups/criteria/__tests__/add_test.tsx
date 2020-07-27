jest.mock("../edit", () => ({
  editCriteria: jest.fn(),
  toggleStringCriteria: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { AddEqCriteria, AddNumberCriteria, editCriteria } from "..";
import {
  AddEqCriteriaProps, NumberCriteriaProps, DEFAULT_CRITERIA,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../__test_support__/fake_state/resources";

describe("<AddEqCriteria<string> />", () => {
  const fakeProps = (): AddEqCriteriaProps<string> => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    type: "string",
    eqCriteria: {},
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
    eqCriteria: {},
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
});
