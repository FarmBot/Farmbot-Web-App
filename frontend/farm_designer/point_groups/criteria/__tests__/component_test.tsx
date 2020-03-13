jest.mock("../../../../api/crud", () => ({
  overwrite: jest.fn(),
  save: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { GroupCriteria, GroupPointCountBreakdown } from "..";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, DEFAULT_CRITERIA,
} from "../interfaces";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { cloneDeep } from "lodash";
import { overwrite, save } from "../../../../api/crud";

describe("<GroupCriteria />", () => {
  const fakeProps = (): GroupCriteriaProps => ({
    dispatch: jest.fn(),
    group: fakePointGroup(),
    slugs: [],
    editGroupAreaInMap: false,
  });

  it("renders", () => {
    const wrapper = mount(<GroupCriteria {...fakeProps()} />);
    ["criteria", "age selection"].map(string =>
      expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("clears criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<GroupCriteria {...p} />);
    wrapper.find("button").last().simulate("click");
    const expectedBody = cloneDeep(p.group.body);
    expectedBody.criteria = DEFAULT_CRITERIA;
    expect(overwrite).toHaveBeenCalledWith(p.group, expectedBody);
    expect(save).toHaveBeenCalledWith(p.group.uuid);
  });

  it("toggles advanced view", () => {
    const wrapper = mount(<GroupCriteria {...fakeProps()} />);
    expect(wrapper.text()).not.toContain("number criteria");
    wrapper.find("ToggleButton").first().simulate("click");
    expect(wrapper.text()).toContain("number criteria");
  });
});

describe("<GroupPointCountBreakdown />", () => {
  const fakeProps = (): GroupPointCountBreakdownProps => ({
    manualCount: 1,
    totalCount: 3,
  });

  it("renders", () => {
    const wrapper = mount(<GroupPointCountBreakdown {...fakeProps()} />);
    ["1manually selected", "2selected by criteria"].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
