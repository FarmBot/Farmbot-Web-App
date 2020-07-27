import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerRegimenScheduler as DesignerRegimenScheduler,
} from "../scheduler";
import { DesignerPanelHeader } from "../../../farm_designer/designer_panel";
import {
  fakeRegimen,
} from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { Props } from "../../interfaces";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";
import { AddButton } from "../../bulk_scheduler/add_button";

describe("<DesignerRegimenScheduler />", () => {
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
    const p = fakeProps();
    p.current = fakeRegimen();
    const wrapper = mount(<DesignerRegimenScheduler {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("schedule");
  });

  it("handles missing regimen", () => {
    const p = fakeProps();
    p.current = undefined;
    const wrapper = shallow(<DesignerRegimenScheduler {...p} />);
    expect(wrapper.find(DesignerPanelHeader).props().backTo)
      .toEqual("/app/designer/regimens/");
  });

  it("commits bulk editor", () => {
    const p = fakeProps();
    p.dispatch = jest.fn();
    const panel = shallow(<DesignerRegimenScheduler {...p} />);
    panel.find(AddButton).first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledWith(expect.any(Function));
  });
});
