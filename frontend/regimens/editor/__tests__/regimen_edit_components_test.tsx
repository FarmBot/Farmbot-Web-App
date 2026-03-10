import React from "react";
import { render, fireEvent } from "@testing-library/react";
import {
  RegimenButtonGroup, OpenSchedulerButton,
  editRegimenVariables,
} from "../regimen_edit_components";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { RegimenProps } from "../../interfaces";
import { VariableDeclaration } from "farmbot";
import { clickButton } from "../../../__test_support__/helpers";
import * as crud from "../../../api/crud";
import { cloneDeep } from "lodash";
import { Path } from "../../../internal_urls";

const fakeProps = (): RegimenProps => ({
  regimen: fakeRegimen(),
  dispatch: jest.fn(),
});

let saveSpy: jest.SpyInstance;
let destroySpy: jest.SpyInstance;
let overwriteSpy: jest.SpyInstance;

beforeEach(() => {
  saveSpy = jest.spyOn(crud, "save").mockImplementation(jest.fn());
  destroySpy = jest.spyOn(crud, "destroy").mockImplementation(jest.fn());
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
});

afterEach(() => {
  saveSpy.mockRestore();
  destroySpy.mockRestore();
  overwriteSpy.mockRestore();
});

describe("<RegimenButtonGroup />", () => {
  it("deletes regimen", () => {
    const p = fakeProps();
    p.dispatch = jest.fn(() => Promise.resolve());
    const { container } = render(<RegimenButtonGroup {...p} />);
    fireEvent.click(container.querySelector(".fa-trash") as Element);
    const expectedUuid = p.regimen.uuid;
    expect(destroySpy).toHaveBeenCalledWith(expectedUuid);
  });

  it("saves regimen", () => {
    const p = fakeProps();
    const { container } = render(<RegimenButtonGroup {...p} />);
    clickButton(container, 0, "save", { partial_match: true });
    const expectedUuid = p.regimen.uuid;
    expect(saveSpy).toHaveBeenCalledWith(expectedUuid);
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
    expect(overwriteSpy).toHaveBeenCalledWith(regimen,
      expect.objectContaining({ body: [variables] }));
  });

  it("edits bodyVariables", () => {
    const regimen = fakeRegimen();
    const existingVariable = cloneDeep(testVariable);
    existingVariable.args.data_value.args = { x: 0, y: 0, z: 0 };
    editRegimenVariables({
      dispatch: jest.fn(), regimen
    })([existingVariable])(testVariable);
    expect(overwriteSpy).toHaveBeenCalledWith(regimen,
      expect.objectContaining({ body: [testVariable] }));
  });
});

describe("<OpenSchedulerButton />", () => {
  it("opens scheduler", () => {
    const { container } = render(<OpenSchedulerButton />);
    clickButton(container, 0, "schedule item");
    expect(mockNavigate).toHaveBeenCalledWith(Path.regimens("scheduler"));
  });
});
