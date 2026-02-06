import React from "react";
import { mount, shallow } from "enzyme";
import {
  mapStateToProps,
  RawDesignerRegimenList as DesignerRegimenList,
} from "../list";
import { RegimensListProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { SearchField } from "../../../ui/search_field";
import * as addRegimenModule from "../add_regimen";
import { DesignerPanelTop } from "../../../farm_designer/designer_panel";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<DesignerRegimenList />", () => {
  let addRegimenSpy: jest.SpyInstance;

  beforeEach(() => {
    addRegimenSpy = jest.spyOn(addRegimenModule, "addRegimen")
      .mockImplementation(jest.fn());
  });

  afterEach(() => {
    addRegimenSpy.mockRestore();
  });

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
    const wrapper = shallow<DesignerRegimenList>(<DesignerRegimenList {...p} />);
    wrapper.instance().context = jest.fn();
    wrapper.find(DesignerPanelTop).simulate("click");
    expect(addRegimenModule.addRegimen).toHaveBeenCalledWith(
      2, wrapper.instance().context);
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
