jest.mock("../../../../api/crud", () => ({ overwrite: jest.fn() }));

import React from "react";
import { shallow } from "enzyme";
import { VariablesPart } from "../variables_part";
import { fakeAssertProps } from "../test_fixtures";
import { cloneDeep } from "lodash";
import { overwrite } from "../../../../api/crud";
import { ParameterApplication } from "farmbot";

describe("<VariablesPart />", () => {
  it("updates variable", () => {
    const p = fakeAssertProps();
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const wrapper = shallow(<VariablesPart {...p} />);
    wrapper.find("LocalsList").simulate("change", variable);
    const update = cloneDeep(p.currentSequence).body;
    update.body = [{
      kind: "assertion",
      args: {
        lua: "return 2 + 2 == 4",
        assertion_type: "recover",
        _then: { kind: "execute", args: { sequence_id: 1 }, body: [variable] },
      },
    }];
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence, update);
  });

  it("handles missing body", () => {
    const p = fakeAssertProps();
    p.currentSequence.body.body = undefined;
    const variable: ParameterApplication = {
      kind: "parameter_application",
      args: {
        label: "label",
        data_value: { kind: "coordinate", args: { x: 0, y: 0, z: 0 } },
      }
    };
    const wrapper = shallow(<VariablesPart {...p} />);
    wrapper.find("LocalsList").simulate("change", variable);
    const update = cloneDeep(p.currentSequence).body;
    update.body = [{
      kind: "assertion",
      args: {
        lua: "return 2 + 2 == 4",
        assertion_type: "recover",
        _then: { kind: "execute", args: { sequence_id: 1 }, body: [variable] },
      },
    }];
    expect(overwrite).toHaveBeenCalledWith(p.currentSequence, update);
  });
});
