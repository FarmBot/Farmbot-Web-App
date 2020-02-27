jest.mock("../../../api/crud", () => ({ initSave: jest.fn() }));

jest.mock("../../../farmware/weed_detector/actions", () => ({
  deletePoints: jest.fn()
}));

let mockPath = "/app/designer/points/add";
jest.mock("../../../history", () => ({
  history: { push: jest.fn() },
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  RawCreatePoints as CreatePoints,
  CreatePointsProps,
  mapStateToProps
} from "../create_points";
import { initSave } from "../../../api/crud";
import { deletePoints } from "../../../farmware/weed_detector/actions";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeState } from "../../../__test_support__/fake_state";
import { CurrentPointPayl } from "../../interfaces";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { cloneDeep } from "lodash";

const FAKE_POINT: CurrentPointPayl =
  ({ name: "My Point", cx: 13, cy: 22, r: 345, color: "red" });

describe("mapStateToProps", () => {
  it("maps state to props", () => {
    const state = fakeState();
    state
      .resources
      .consumers
      .farm_designer
      .currentPoint = FAKE_POINT;
    const result = mapStateToProps(state);
    const { currentPoint } = result;
    expect(currentPoint).toBeTruthy();
    if (currentPoint) {
      expect(currentPoint.cx).toEqual(13);
      expect(currentPoint.cy).toEqual(22);
    } else {
      fail("Nope");
    }
  });
});

describe("<CreatePoints />", () => {
  beforeEach(() => {
    mockPath = "/app/designer/points/add";
  });

  const fakeProps = (): CreatePointsProps => ({
    dispatch: jest.fn(),
    currentPoint: undefined,
    deviceY: 1.23,
    deviceX: 3.21
  });

  const fakeInstance = () => {
    const props = fakeProps();
    props.currentPoint = FAKE_POINT;
    return new CreatePoints(props);
  };

  it("renders for points", () => {
    mockPath = "/app/designer";
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["add point", "delete", "x", "y", "radius", "color"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders for weeds", () => {
    mockPath = "/app/designer/weeds/add";
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["add weed", "delete", "x", "y", "radius", "color"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("updates specific fields", () => {
    const i = fakeInstance();
    i.updateValue("color")(inputEvent("cheerful hue"));
    expect(i.props.currentPoint).toBeTruthy();
    const expected = cloneDeep(FAKE_POINT);
    expected.color = "cheerful hue";
    expect(i.props.dispatch).toHaveBeenCalledWith({
      type: "SET_CURRENT_POINT_DATA",
      payload: expected,
    });
  });

  it("doesn't update fields without current point", () => {
    const p = fakeProps();
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    jest.clearAllMocks();
    wrapper.instance().updateValue("r")(inputEvent("1"));
    expect(p.dispatch).not.toHaveBeenCalled();
  });

  it("loads default point data", () => {
    const i = fakeInstance();
    i.loadDefaultPoint();
    expect(i.props.dispatch).toHaveBeenCalledWith({
      type: "SET_CURRENT_POINT_DATA",
      payload: { name: "Created Point", color: "green", cx: 1, cy: 1, r: 15 },
    });
  });

  it("updates point name", () => {
    mockPath = "/app/designer/weeds/add";
    const p = fakeProps();
    p.currentPoint = { cx: 0, cy: 0, r: 100 };
    const panel = mount<CreatePoints>(<CreatePoints {...p} />);
    const wrapper = shallow(panel.instance().PointProperties());
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_CURRENT_POINT_DATA, payload: {
        cx: 0, cy: 0, r: 100, name: "new name", color: "red",
      }
    });
  });

  it("creates point", () => {
    mockPath = "/app/designer/points/add";
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    clickButton(wrapper, 0, "save");
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: { color: "green", created_by: "farm-designer", type: "point" },
      name: "Created Point",
      pointer_type: "GenericPointer",
      radius: 30, x: 10, y: 20, z: 0,
    });
  });

  it("creates weed", () => {
    mockPath = "/app/designer/weeds/add";
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    clickButton(wrapper, 0, "save");
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: { color: "red", created_by: "farm-designer", type: "weed" },
      name: "Created Weed",
      pointer_type: "GenericPointer",
      radius: 30, x: 10, y: 20, z: 0,
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
    expect(deletePoints).not.toHaveBeenCalled();
    window.confirm = () => true;
    p.dispatch = jest.fn(x => x());
    button.simulate("click");
    expect(deletePoints).toHaveBeenCalledWith("points", {
      created_by: "farm-designer", type: "point"
    });
  });

  it("deletes all weeds", () => {
    mockPath = "/app/designer/weeds/add";
    const p = fakeProps();
    const wrapper = mount(<CreatePoints {...p} />);
    const button = wrapper.find("button").last();
    expect(button.text()).toEqual("Delete all created weeds");
    window.confirm = jest.fn();
    button.simulate("click");
    expect(window.confirm).toHaveBeenCalledWith(
      expect.stringContaining("all the weeds"));
    expect(deletePoints).not.toHaveBeenCalled();
    window.confirm = () => true;
    p.dispatch = jest.fn(x => x());
    button.simulate("click");
    expect(deletePoints).toHaveBeenCalledWith("points", {
      created_by: "farm-designer", type: "weed"
    });
  });

  it("changes color", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, r: 0 },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("updates value", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = shallow<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "10" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: 10, cy: 0, r: 0, color: "green" },
      type: Actions.SET_CURRENT_POINT_DATA
    });
  });

  it("fills the state with point data", () => {
    const p = fakeProps();
    p.currentPoint = { cx: 1, cy: 2, r: 3, color: "blue" };
    const wrapper = shallow<CreatePoints>(<CreatePoints {...p} />);
    const i = wrapper.instance();
    expect(i.state).toEqual({});
    expect(i.getPointData()).toEqual({
      name: undefined,
      cx: 1,
      cy: 2,
      r: 3,
      color: "blue"
    });
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
