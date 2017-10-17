jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import { Regimens } from "../index";
import { Props } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import { auth } from "../../__test_support__/fake_state/token";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";

describe("<Regimens />", () => {
  it("renders", () => {
    const fakeProps: Props = {
      dispatch: jest.fn(),
      sequences: [],
      resources: buildResourceIndex([]).index,
      auth,
      current: undefined,
      regimens: [],
      selectedSequence: undefined,
      dailyOffsetMs: 1000,
      weeks: [],
      bot,
      calendar: []
    };
    const wrapper = mount(<Regimens {...fakeProps } />);
    ["Regimens", "Regimen Editor", "Scheduler"].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
