jest.mock("../../../api/crud", () => ({
  save: jest.fn(),
  destroy: jest.fn(),
  overwrite: jest.fn(),
}));

jest.mock("../../actions", () => ({ editRegimen: jest.fn() }));

const mockPath = "/app/designer/regimens/1";
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

import React from "react";
import { shallow, mount } from "enzyme";
import {
  RegimenButtonGroup, OpenSchedulerButton,
  editRegimenVariables,
  RegimenColorPicker,
} from "../regimen_edit_components";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { editRegimen } from "../../actions";
import { RegimenProps } from "../../interfaces";
import { Color, VariableDeclaration } from "farmbot";
import { clickButton } from "../../../__test_support__/helpers";
import { destroy, save, overwrite } from "../../../api/crud";
import { push } from "../../../history";
import { cloneDeep } from "lodash";

const fakeProps = (): RegimenProps => ({
  regimen: fakeRegimen(),
  dispatch: jest.fn(),
});

describe("<RegimenColorPicker />", () => {
  it("changes color", () => {
    const p = fakeProps();
    p.regimen.body.color = "" as Color;
    const wrapper = shallow(<RegimenColorPicker {...p} />);
    wrapper.find("ColorPicker").simulate("change", "red");
    expect(editRegimen).toHaveBeenCalledWith(p.regimen, { color: "red" });
  });
});

describe("<RegimenButtonGroup />", () => {
  it("deletes regimen", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const wrapper = mount(<RegimenButtonGroup {...p} />);
    wrapper.find(".fa-trash").simulate("click");
    const expectedUuid = p.regimen.uuid;
    expect(destroy).toHaveBeenCalledWith(expectedUuid);
  });

  it("saves regimen", () => {
    const p = fakeProps();
    const wrapper = mount(<RegimenButtonGroup {...p} />);
    clickButton(wrapper, 0, "save", { partial_match: true });
    const expectedUuid = p.regimen.uuid;
    expect(save).toHaveBeenCalledWith(expectedUuid);
  });
});

describe("editRegimenVariables()", () => {
  const testVariable: VariableDeclaration = {
    kind: "variable_declaration",
    args: {
      label: "variable", data_value: {
        kind: "coordinate", args: { x: 1, y: 2, z: 3 }
      }
    }
  };

  it("adds bodyVariables", () => {
    const regimen = fakeRegimen();
    const variables = cloneDeep(testVariable);
    editRegimenVariables({ dispatch: jest.fn(), regimen })([])(variables);
    expect(overwrite).toHaveBeenCalledWith(regimen,
      expect.objectContaining({ body: [variables] }));
  });

  it("edits bodyVariables", () => {
    const regimen = fakeRegimen();
    const existingVariable = cloneDeep(testVariable);
    existingVariable.args.data_value.args = { x: 0, y: 0, z: 0 };
    editRegimenVariables({
      dispatch: jest.fn(), regimen
    })([existingVariable])(testVariable);
    expect(overwrite).toHaveBeenCalledWith(regimen,
      expect.objectContaining({ body: [testVariable] }));
  });
});

describe("<OpenSchedulerButton />", () => {
  it("opens scheduler", () => {
    const wrapper = mount(<OpenSchedulerButton />);
    clickButton(wrapper, 0, "schedule item");
    expect(push).toHaveBeenCalledWith("/app/designer/regimens/scheduler");
  });
});
