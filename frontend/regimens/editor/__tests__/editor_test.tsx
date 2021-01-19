jest.mock("../../../regimens/set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

import React from "react";
import { mount } from "enzyme";
import {
  RawDesignerRegimenEditor as DesignerRegimenEditor,
} from "../../editor/editor";
import { RegimenEditorProps } from "../interfaces";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";
import {
  setActiveRegimenByName,
} from "../../set_active_regimen_by_name";

describe("<DesignerRegimenEditor />", () => {
  const fakeProps = (): RegimenEditorProps => ({
    dispatch: jest.fn(),
    resources: buildResourceIndex([]).index,
    current: fakeRegimen(),
    calendar: [],
    variableData: {},
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
