jest.mock("../../history", () => ({
  push: () => jest.fn(),
  history: { getCurrentLocation: () => ({ pathname: "" }) }
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawRegimens as Regimens, RegimenBackButtonProps, RegimenBackButton
} from "../index";
import { Props } from "../interfaces";
import { bot } from "../../__test_support__/fake_state/bot";
import { auth } from "../../__test_support__/fake_state/token";
import {
  buildResourceIndex
} from "../../__test_support__/resource_index_builder";
import { fakeRegimen } from "../../__test_support__/fake_state/resources";
import { Actions } from "../../constants";

describe("<Regimens />", () => {
  const fakeProps = (): Props => ({
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
    calendar: [],
    regimenUsageStats: {},
    shouldDisplay: () => false,
    variableData: {},
    schedulerOpen: false,
  });

  it("renders", () => {
    const wrapper = mount(<Regimens {...fakeProps()} />);
    ["Regimens", "Edit Regimen", "Scheduler"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("scheduler is hidden", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = mount(<Regimens {...p} />);
    expect(wrapper.text()).not.toContain("Scheduler");
  });

  it("shows scheduler", () => {
    const p = fakeProps();
    p.schedulerOpen = true;
    const wrapper = mount(<Regimens {...p} />);
    expect(wrapper.html()).toContain("inserting-item");
  });
});

describe("<SequenceBackButton />", () => {
  const fakeProps = (): RegimenBackButtonProps => ({
    dispatch: jest.fn(),
    className: "",
  });

  it("returns to regimen", () => {
    const p = fakeProps();
    p.className = "inserting-item";
    const wrapper = mount(<RegimenBackButton {...p} />);
    wrapper.find("i").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_SCHEDULER_STATE, payload: false
    });
  });

  it("returns to regimen list", () => {
    const p = fakeProps();
    p.className = "";
    const wrapper = mount(<RegimenBackButton {...p} />);
    wrapper.find("i").simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SELECT_REGIMEN, payload: undefined
    });
  });
});
