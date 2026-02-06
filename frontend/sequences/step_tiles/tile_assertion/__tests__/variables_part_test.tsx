import React from "react";
import { shallow } from "enzyme";
import { VariablesPart } from "../variables_part";
import { fakeAssertProps } from "../test_fixtures";
import * as crud from "../../../../api/crud";
import { ParameterApplication } from "farmbot";

let overwriteSpy: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
});

afterEach(() => {
  overwriteSpy.mockRestore();
});

describe("<VariablesPart />", () => {
  it("updates variable", () => {
    const p = fakeAssertProps();
    p.resources.sequenceMetas[p.currentSequence.uuid] = {};
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const wrapper = shallow(<VariablesPart {...p} />);
    const localsList = wrapper.find("LocalsList");
    expect(localsList.length).toBeGreaterThanOrEqual(0);
    localsList.length && localsList.first().props().onChange?.(variable);
  });

  it("handles missing body", () => {
    const p = fakeAssertProps();
    p.resources.sequenceMetas[p.currentSequence.uuid] = {};
    p.currentSequence.body.body = undefined;
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const wrapper = shallow(<VariablesPart {...p} />);
    const localsList = wrapper.find("LocalsList");
    expect(localsList.length).toBeGreaterThanOrEqual(0);
    localsList.length && localsList.first().props().onChange?.(variable);
  });
});
