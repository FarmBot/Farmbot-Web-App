jest.mock("../../../api/crud", () => ({
  edit: jest.fn(),
  save: jest.fn(),
  destroy: jest.fn(),
}));

let mockPath = "/app/designer/tools/1";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  getPathArray: () => mockPath.split("/"),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawEditTool as EditTool, EditToolProps, mapStateToProps
} from "../edit_tool";
import { fakeTool } from "../../../__test_support__/fake_state/resources";
import { fakeState } from "../../../__test_support__/fake_state";
import {
  buildResourceIndex
} from "../../../__test_support__/resource_index_builder";
import { SaveBtn } from "../../../ui";
import { history } from "../../../history";
import { edit, destroy } from "../../../api/crud";

describe("<EditTool />", () => {
  beforeEach(() => {
    mockPath = "/app/designer/tools/1";
  });

  const fakeProps = (): EditToolProps => ({
    findTool: jest.fn(() => fakeTool()),
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<EditTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Edit tool");
  });

  it("handles missing tool name", () => {
    const p = fakeProps();
    const tool = fakeTool();
    tool.body.name = undefined;
    p.findTool = () => tool;
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.state().toolName).toEqual("");
  });

  it("redirects", () => {
    mockPath = "/app/designer/tools/";
    const p = fakeProps();
    p.findTool = jest.fn(() => undefined);
    const wrapper = mount<EditTool>(<EditTool {...p} />);
    expect(wrapper.instance().stringyID).toEqual("");
    expect(wrapper.text()).toContain("Redirecting...");
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
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

  it("removes tool", () => {
    const p = fakeProps();
    const tool = fakeTool();
    p.findTool = () => tool;
    const wrapper = shallow(<EditTool {...p} />);
    wrapper.find("button").last().simulate("click");
    expect(destroy).toHaveBeenCalledWith(tool.uuid);
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
