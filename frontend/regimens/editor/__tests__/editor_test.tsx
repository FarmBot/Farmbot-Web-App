jest.mock("../../../regimens/set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

import * as React from "react";
import { mount } from "enzyme";
import {
  RawDesignerRegimenEditor as DesignerRegimenEditor,
} from "../../editor/editor";
import { Props } from "../../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  setActiveRegimenByName,
} from "../../set_active_regimen_by_name";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";

describe("<DesignerRegimenEditor />", () => {
  const fakeProps = (): Props => {
    const regimen = fakeRegimen();
    return {
      dispatch: jest.fn(),
      sequences: [],
      resources: buildResourceIndex([]).index,
      auth: auth,
      current: regimen,
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
    };
  };

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

  it("active editor", () => {
    const wrapper = mount(<DesignerRegimenEditor {...fakeProps()} />);
    ["Foo", "Saved", "Schedule item"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("empty editor", () => {
    const props = fakeProps();
    props.current = undefined;
    const wrapper = mount(<DesignerRegimenEditor {...props} />);
    ["No Regimen selected."].map(string =>
      expect(wrapper.text()).toContain(string));
  });
});
