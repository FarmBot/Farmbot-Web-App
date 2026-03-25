const mockEditStep = jest.fn();

import { TypePart } from "../type_part";
import { FBSelect } from "../../../../ui";
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
describe("<TypePart />", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const rendered = TypePart(p);
    const children = rendered.props.children as React.ReactElement[];
    const selector = children.find(child => child.type === FBSelect) as
      React.ReactElement<{ onChange: (item: { value: string; label: string }) => void }>
      | undefined;
    selector?.props.onChange({ value: "abort", label: "y" });
    expect(editStepSpy).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.assertion_type).toEqual("abort");
  });
});
