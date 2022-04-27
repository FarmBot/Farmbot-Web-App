jest.mock("../../../regimens/set_active_regimen_by_name", () => ({
  setActiveRegimenByName: jest.fn()
}));

jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
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
import { Color } from "farmbot";
import { edit } from "../../../api/crud";

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

  it("changes color", () => {
    const p = fakeProps();
    const regimen = fakeRegimen();
    regimen.body.color = "" as Color;
    p.current = regimen;
    const wrapper = shallow(<DesignerRegimenEditor {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(edit).toHaveBeenCalledWith(p.current, { color: "red" });
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
