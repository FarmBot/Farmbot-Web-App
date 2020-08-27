const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { shallow } from "enzyme";
import { TypePart } from "../type_part";
import { FBSelect } from "../../../../ui";
import { fakeAssertProps } from "../test_fixtures";
import { cloneDeep } from "lodash";
import { editStep } from "../../../../api/crud";

describe("<TypePart />", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<TypePart {...p} />);
    el.find(FBSelect).simulate("change", { value: "abort", label: "y" });
    expect(editStep).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.assertion_type).toEqual("abort");
  });
});
