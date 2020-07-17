import * as React from "react";
import { mount } from "enzyme";
import {
  RawDesignerRegimenList as DesignerRegimenList,
} from "../list";
import { Props } from "../../../regimens/interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<DesignerRegimenList />", () => {
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
    const wrapper = mount(<DesignerRegimenList {...fakeProps()} />);
    expect(wrapper.text()).toContain("regimen");
  });
});
