const mockEditStep = jest.fn();
jest.mock("../../../../api/crud", () => ({ editStep: mockEditStep }));

import React from "react";
import { LuaPart } from "../lua_part";
import { shallow } from "enzyme";
import { inputEvent } from "../../../../__test_support__/fake_html_events";
import { fakeAssertProps } from "../test_fixtures";
import { editStep } from "../../../../api/crud";
import { cloneDeep } from "lodash";

describe("<LuaPart />", () => {
  it("renders default verbiage and props", () => {
    const p = fakeAssertProps();
    const el = shallow(<LuaPart {...p} />);
    el.find("textarea").first().simulate("change", inputEvent("hello"));
    expect(editStep).toHaveBeenCalled();
    const step = cloneDeep(p.currentStep);
    mockEditStep.mock.calls[0][0].executor(step);
    expect(step.args.lua).toEqual("hello");
  });
});
