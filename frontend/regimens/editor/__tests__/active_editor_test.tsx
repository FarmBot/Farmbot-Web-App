jest.mock("../../../api/crud", () => ({
  overwrite: jest.fn(),
}));

import * as React from "react";
import { mount } from "enzyme";
import { ActiveEditor, editRegimenVariables } from "../active_editor";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { ActiveEditorProps } from "../interfaces";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { overwrite } from "../../../api/crud";
import { VariableDeclaration } from "farmbot";

describe("<ActiveEditor />", () => {
  const fakeProps = (): ActiveEditorProps => ({
    dispatch: jest.fn(),
    regimen: fakeRegimen(),
    calendar: [{
      day: "1",
      items: [{
        name: "Item 0",
        color: "red",
        hhmm: "10:00",
        sortKey: 0,
        day: 1,
        dispatch: jest.fn(),
        regimen: fakeRegimen(),
        item: {
          sequence_id: 0, time_offset: 1000
        }
      }]
    }],
    resources: buildResourceIndex([]).index,
    shouldDisplay: () => false,
    variableData: {},
  });

  it("renders", () => {
    const wrapper = mount(<ActiveEditor {...fakeProps()} />);
    ["Day", "Item 0", "10:00"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("removes regimen item", () => {
    const keptItem = { sequence_id: 1, time_offset: 1000 };
    const p = fakeProps();
    p.calendar[0].items[0].regimen.body.regimen_items =
      [p.calendar[0].items[0].item, keptItem];
    const wrapper = mount(<ActiveEditor {...p} />);
    wrapper.find("i").simulate("click");
    expect(overwrite).toHaveBeenCalledWith(expect.any(Object),
      expect.objectContaining({ regimen_items: [keptItem] }));
  });
});

describe("editRegimenVariables()", () => {
  const variables: VariableDeclaration = {
    kind: "variable_declaration",
    args: {
      label: "label", data_value: {
        kind: "identifier", args: { label: "new_var" }
      }
    }
  };

  it("updates bodyVariables", () => {
    const regimen = fakeRegimen();
    editRegimenVariables({ dispatch: jest.fn(), regimen })([])(variables);
    expect(overwrite).toHaveBeenCalledWith(regimen,
      expect.objectContaining({ body: [variables] }));
  });
});
