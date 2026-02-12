import React from "react";
import { VariablesPart } from "../variables_part";
import { fakeAssertProps } from "../test_fixtures";
import * as crud from "../../../../api/crud";
import * as selectors from "../../../../resources/selectors";
import { ParameterApplication } from "farmbot";

let overwriteSpy: jest.SpyInstance;
let findSequenceByIdSpy: jest.SpyInstance;

beforeEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
  jest.useRealTimers();
  overwriteSpy = jest.spyOn(crud, "overwrite").mockImplementation(jest.fn());
  findSequenceByIdSpy = jest.spyOn(selectors, "findSequenceById")
    .mockImplementation(() => ({ uuid: "callee-sequence" } as never));
});

afterEach(() => {
  overwriteSpy.mockRestore();
  findSequenceByIdSpy.mockRestore();
});

describe("<VariablesPart />", () => {
  it("updates variable", () => {
    const p = fakeAssertProps();
    p.resources.sequenceMetas["callee-sequence"] = {};
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const rendered = VariablesPart(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const localsList =
      React.Children.toArray(rendered.props.children)[0] as JSX.Element | undefined;
    expect(localsList).toBeDefined();
    localsList?.props.onChange?.(variable);
  });

  it("handles missing body", () => {
    const p = fakeAssertProps();
    p.resources.sequenceMetas["callee-sequence"] = {};
    p.currentSequence.body.body = undefined;
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const rendered = VariablesPart(p) as React.ReactElement<{ children?: React.ReactNode }>;
    const localsList =
      React.Children.toArray(rendered.props.children)[0] as JSX.Element | undefined;
    expect(localsList).toBeDefined();
    localsList?.props.onChange?.(variable);
  });
});
