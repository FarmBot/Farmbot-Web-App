jest.mock("../edit", () => ({
  toggleAndEditEqCriteria: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { toggleAndEditEqCriteria } from "..";
import { CheckboxListProps } from "../interfaces";
import {
  fakePointGroup,
} from "../../../../__test_support__/fake_state/resources";
import { CheckboxList } from "../subcriteria";

describe("<CheckboxList />", () => {
  const fakeProps = (): CheckboxListProps<string> => ({
    criteriaKey: "openfarm_slug",
    list: [{ label: "label", value: "value" }],
    dispatch: jest.fn(),
    group: fakePointGroup(),
    pointerType: "Plant",
    disabled: false,
  });

  it("toggles criteria", () => {
    const p = fakeProps();
    const wrapper = mount(<CheckboxList {...p} />);
    expect(wrapper.text()).toContain("label");
    wrapper.find("input").first().simulate("change");
    expect(toggleAndEditEqCriteria).toHaveBeenCalledWith(
      p.group, "openfarm_slug", "value", "Plant");
  });
});
