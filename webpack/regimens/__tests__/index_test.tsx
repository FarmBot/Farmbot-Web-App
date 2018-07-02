jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../history", () => ({
  push: () => jest.fn(),
  history: {
    getCurrentLocation: () => ({ pathname: "" })
  }
}));

import * as React from "react";
import { mount } from "enzyme";
import { Regimens } from "../index";
import { Props } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import { auth } from "../../__test_support__/fake_state/token";
import { buildResourceIndex } from "../../__test_support__/resource_index_builder";
import { fakeRegimen } from "../../__test_support__/fake_state/resources";

describe("<Regimens />", () => {
  function fakeProps(): Props {
    return {
      dispatch: jest.fn(),
      sequences: [],
      resources: buildResourceIndex([]).index,
      auth,
      current: fakeRegimen(),
      regimens: [],
      selectedSequence: undefined,
      dailyOffsetMs: 1000,
      weeks: [],
      bot,
      calendar: []
    };
  }

  it("renders", () => {
    const wrapper = mount<{}>(<Regimens {...fakeProps()} />);
    ["Regimens", "Regimen Editor", "Scheduler"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("scheduler is hidden", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = mount<{}>(<Regimens {...p} />);
    expect(wrapper.text()).not.toContain("Scheduler");
  });
});
