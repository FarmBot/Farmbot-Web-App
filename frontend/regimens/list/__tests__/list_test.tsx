jest.mock("../add_regimen", () => ({
  addRegimen: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  mapStateToProps,
  RawDesignerRegimenList as DesignerRegimenList,
} from "../list";
import { RegimensListProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SearchField } from "../../../ui/search_field";
import { addRegimen } from "../add_regimen";
import { DesignerPanelTop } from "../../../farm_designer/designer_panel";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<DesignerRegimenList />", () => {
  const fakeProps = (): RegimensListProps => ({
    dispatch: jest.fn(),
    regimens: [],
    regimenUsageStats: {},
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
    expect(addRegimen).toHaveBeenCalledWith(2, {});
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources = buildResourceIndex([]);
    const props = mapStateToProps(state);
    expect(props.regimens).toEqual([]);
  });
});
