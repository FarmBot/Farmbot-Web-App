import { Path } from "../../../internal_urls";
const mockPath = Path.mock(Path.regimens("1"));
jest.mock("../../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

import React from "react";
import { mount } from "enzyme";
import { ActiveEditor } from "../active_editor";
import { fakeRegimen } from "../../../__test_support__/fake_state/resources";
import { ActiveEditorProps } from "../interfaces";
import {
  buildResourceIndex,
} from "../../../__test_support__/resource_index_builder";

describe("<ActiveEditor />", () => {
  const fakeProps = (): ActiveEditorProps => ({
    dispatch: jest.fn(),
    regimen: fakeRegimen(),
    calendar: [],
    resources: buildResourceIndex([]).index,
    variableData: {},
  });

  it("renders", () => {
    const wrapper = mount(<ActiveEditor {...fakeProps()} />);
    ["Saved", "Schedule item"].map(string =>
      expect(wrapper.text()).toContain(string));
  });

  it("toggles variable form state", () => {
    const wrapper = mount<ActiveEditor>(<ActiveEditor {...fakeProps()} />);
    wrapper.instance().toggleVarShow();
    expect(wrapper.state()).toEqual({ variablesCollapsed: true });
  });
});
