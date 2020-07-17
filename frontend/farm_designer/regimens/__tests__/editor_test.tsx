jest.mock("../../../regimens/set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawDesignerRegimenEditor as DesignerRegimenEditor,
} from "../editor";
import { Props } from "../../../regimens/interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  setActiveRegimenByName,
} from "../../../regimens/set_active_regimen_by_name";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<DesignerRegimenEditor />", () => {
  const fakeProps = (): Props => ({
    dispatch: jest.fn(),
    sequences: [],
    resources: buildResourceIndex([]).index,
    auth: auth,
    current: fakeRegimen(),
    regimens: [],
    selectedSequence: undefined,
    dailyOffsetMs: 1000,
    weeks: [],
    bot: bot,
    calendar: [],
    regimenUsageStats: {},
    shouldDisplay: () => false,
    variableData: {},
    schedulerOpen: false,
  });

  it("renders", () => {
    const wrapper = mount(<DesignerRegimenEditor {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("save");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = mount(<DesignerRegimenEditor {...p} />);
    expect(setActiveRegimenByName).toHaveBeenCalled();
    expect(wrapper.text().toLowerCase()).toContain("no regimen selected");
  });
});
