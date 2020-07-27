jest.mock("../add_regimen", () => ({
  addRegimen: jest.fn(),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawDesignerRegimenList as DesignerRegimenList,
} from "../list";
import { Props } from "../../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import { auth } from "../../../__test_support__/fake_state/token";
import { bot } from "../../../__test_support__/fake_state/bot";
import { SearchField } from "../../../ui/search_field";
import { addRegimen } from "../add_regimen";
import { DesignerPanelTop } from "../../../farm_designer/designer_panel";

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

  it("renders empty", () => {
    const wrapper = mount(<DesignerRegimenList {...fakeProps()} />);
    expect(wrapper.text().toLowerCase()).toContain("regimen");
    expect(wrapper.text().toLowerCase()).not.toContain("foo");
  });

  it("renders", () => {
    const p = fakeProps();
    const regimen = fakeRegimen();
    regimen.body.name = "foo";
    p.regimens = [regimen];
    const wrapper = mount(<DesignerRegimenList {...p} />);
    expect(wrapper.text().toLowerCase()).toContain("foo");
    expect(wrapper.text().toLowerCase()).not.toContain("regimen");
  });

  it("sets search term", () => {
    const wrapper = shallow<DesignerRegimenList>(
      <DesignerRegimenList {...fakeProps()} />);
    wrapper.find(SearchField).simulate("change", "term");
    expect(wrapper.state().searchTerm).toEqual("term");
  });

  it("filters regimens", () => {
    const p = fakeProps();
    const regimen1 = fakeRegimen();
    regimen1.body.name = "foo";
    const regimen2 = fakeRegimen();
    regimen2.body.name = "bar";
    p.regimens = [regimen1, regimen2];
    const wrapper = mount(<DesignerRegimenList {...p} />);
    wrapper.setState({ searchTerm: "foo" });
    expect(wrapper.text().toLowerCase()).toContain("foo");
    expect(wrapper.text().toLowerCase()).not.toContain("bar");
  });

  it("adds new regimen", () => {
    const p = fakeProps();
    p.regimens = [fakeRegimen(), fakeRegimen()];
    const wrapper = shallow(<DesignerRegimenList {...p} />);
    wrapper.find(DesignerPanelTop).simulate("click");
    expect(addRegimen).toHaveBeenCalledWith(2);
  });
});
