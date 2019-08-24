jest.mock("react-redux", () => ({ connect: jest.fn() }));

jest.mock("../../../api/crud", () => ({ edit: jest.fn() }));

jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => "/app/designer/tools/1".split("/"),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { EditTool, EditToolProps, mapStateToProps } from "../edit_tool";
import { fakeTool } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { SaveBtn } from "../../../ui";
import { history } from "../../../history";
import { edit } from "../../../api/crud";

describe("<EditTool />", () => {
  const fakeProps = (): EditToolProps => ({
    findTool: jest.fn(() => fakeTool()),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Edit Foo");
  });

  it("redirects", () => {
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount(<EditTool {...p} />);
    expect(wrapper.text()).toContain("Redirecting...");
  });

  it("edits tool name", () => {
    const wrapper = shallow<EditTool>(<EditTool {...fakeProps()} />);
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("saves", () => {
    const wrapper = shallow(<EditTool {...fakeProps()} />);
    wrapper.find(SaveBtn).simulate("click");
    expect(edit).toHaveBeenCalledWith(expect.any(Object), { name: "Foo" });
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    const tool = fakeTool();
    tool.body.id = 123;
    state.resources = buildResourceIndex([tool]);
    const props = mapStateToProps(state);
    expect(props.findTool("" + tool.body.id)).toEqual(tool);
  });
});
