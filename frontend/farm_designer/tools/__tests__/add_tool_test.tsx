jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

jest.mock("../../../history", () => ({ history: { push: jest.fn() } }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawAddTool as AddTool, AddToolProps, mapStateToProps
} from "../add_tool";
import { fakeState } from "../../../__test_support__/fake_state";
import { SaveBtn } from "../../../ui";
import { initSave } from "../../../api/crud";
import { history } from "../../../history";

describe("<AddTool />", () => {
  const fakeProps = (): AddToolProps => ({
    dispatch: jest.fn(),
  });

  it("renders", () => {
    const wrapper = mount(<AddTool {...fakeProps()} />);
    expect(wrapper.text()).toContain("Add new tool");
  });

  it("edits tool name", () => {
    const wrapper = shallow<AddTool>(<AddTool {...fakeProps()} />);
    expect(wrapper.state().toolName).toEqual("");
    wrapper.find("input").simulate("change",
      { currentTarget: { value: "new name" } });
    expect(wrapper.state().toolName).toEqual("new name");
  });

  it("saves", () => {
    const wrapper = shallow(<AddTool {...fakeProps()} />);
    wrapper.setState({ toolName: "Foo" });
    wrapper.find(SaveBtn).simulate("click");
    expect(initSave).toHaveBeenCalledWith("Tool", { name: "Foo" });
  });

  it("adds stock tools", () => {
    const wrapper = mount(<AddTool {...fakeProps()} />);
    wrapper.find("button").last().simulate("click");
    expect(initSave).toHaveBeenCalledTimes(6);
    expect(history.push).toHaveBeenCalledWith("/app/designer/tools");
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
