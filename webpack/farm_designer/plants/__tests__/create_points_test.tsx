jest.mock("react-redux", () => ({
  connect: jest.fn()
}));

jest.mock("../../../api/crud", () => ({
  initSave: jest.fn()
}));

jest.mock("../../../farmware/weed_detector/actions", () => ({
  deletePoints: jest.fn()
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import { CreatePoints, CreatePointsProps } from "../create_points";
import { initSave } from "../../../api/crud";
import { deletePoints } from "../../../farmware/weed_detector/actions";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";

describe("<CreatePoints />", () => {
  const fakeProps = (): CreatePointsProps => {
    return {
      dispatch: jest.fn(),
      currentPoint: undefined
    };
  };

  it("renders", () => {
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["create point", "cancel", "delete", "x", "y", "radius", "color"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("creates point", () => {
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30, color: "red" });
    clickButton(wrapper, 0, "create point");
    expect(initSave).toHaveBeenCalledWith({
      body: {
        meta: { color: "red", created_by: "farm-designer" },
        name: "Created Point",
        pointer_type: "GenericPointer",
        radius: 30, x: 10, y: 20, z: 0
      },
      kind: "Point",
      specialStatus: "",
      uuid: ""
    });
  });

  it("deletes all points", () => {
    const p = fakeProps();
    const wrapper = mount(<CreatePoints {...p} />);
    const button = wrapper.find("button").last();
    expect(button.text()).toEqual("Delete all created points");
    window.confirm = jest.fn();
    button.simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("all the points"));
    expect(p.dispatch).not.toHaveBeenCalled();
    window.confirm = () => true;
    p.dispatch = jest.fn(x => x());
    button.simulate("click");
    expect(deletePoints).toHaveBeenCalledWith("points", "farm-designer");
  });

  it("changes color", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = mount(<CreatePoints {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    const component = shallow(<instance.PointProperties />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, r: 0 },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("updates value", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = shallow(<CreatePoints {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    const component = shallow(<instance.PointProperties />);
    component.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "10" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: 10, cy: 0, r: 0 },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("fills the state with point data", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 1, cy: 2, r: 3, color: "blue" };
    const wrapper = shallow(<CreatePoints {...p} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.getPointData();
    expect(instance.state).toEqual({ color: "blue", cx: 1, cy: 2, r: 3 });
  });

  it("fills the state with default data", () => {
    const wrapper = shallow(<CreatePoints {...fakeProps()} />);
    // tslint:disable-next-line:no-any
    const instance = wrapper.instance() as any;
    instance.getPointData();
    expect(instance.state).toEqual({ color: "green", cx: 0, cy: 0, r: 1 });
  });

  it("unmounts", () => {
    const p = fakeProps();
    const wrapper = shallow(<CreatePoints {...p} />);
    jest.clearAllMocks();
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CURRENT_POINT_DATA,
      payload: undefined
    });
  });
});
