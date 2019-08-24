jest.mock("react-redux", () => ({ connect: jest.fn() }));

jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { AddTool, AddToolProps, mapStateToProps } from "../add_tool";
import { fakeState } from "../../../__test_support__/fake_state";
import { SaveBtn } from "../../../ui";
import { initSave } from "../../../api/crud";

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
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const props = mapStateToProps(fakeState());
    expect(props.dispatch).toEqual(expect.any(Function));
  });
});
