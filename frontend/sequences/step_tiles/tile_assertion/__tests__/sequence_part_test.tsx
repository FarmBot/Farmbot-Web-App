const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { shallow } from "enzyme";
import { SequencePart } from "../sequence_part";
import { SequenceSelectBox } from "../../../sequence_select_box";
import { fakeAssertProps } from "../test_fixtures";
import { cloneDeep } from "lodash";
import { editStep } from "../../../../api/crud";

describe("<SequencePart />", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<SequencePart {...p} />);
    el.find(SequenceSelectBox).simulate("change", { value: 246, label: "y" });
    expect(editStep).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args._then.args).toEqual({ sequence_id: 246 });
  });
});
