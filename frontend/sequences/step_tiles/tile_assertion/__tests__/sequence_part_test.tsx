const mockEditStep = jest.fn();

import { SequencePart } from "../sequence_part";
import { SequenceSelectBox } from "../../../sequence_select_box";
import { fakeAssertProps } from "../test_fixtures";
import { cloneDeep } from "lodash";
import * as crud from "../../../../api/crud";

let editStepSpy: jest.SpyInstance;

beforeEach(() => {
  editStepSpy = jest.spyOn(crud, "editStep")
    .mockImplementation(mockEditStep);
});

afterEach(() => {
  editStepSpy.mockRestore();
});
describe("<SequencePart />", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const rendered = SequencePart(p);
    const children = rendered.props.children as JSX.Element[];
    const selector = children.find(child => child.type === SequenceSelectBox);
    selector?.props.onChange({ value: 246, label: "y" });
    expect(editStepSpy).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args._then.args).toEqual({ sequence_id: 246 });
  });
});
