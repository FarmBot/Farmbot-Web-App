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
  mapStateToProps,
} from "../create_points";
import { initSave } from "../../../api/crud";
import { deletePoints } from "../../../farmware/weed_detector/actions";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeState } from "../../../__test_support__/fake_state";
import { DrawnPointPayl } from "../../interfaces";
import { inputEvent } from "../../../__test_support__/fake_html_events";
import { cloneDeep } from "lodash";

const FAKE_POINT: DrawnPointPayl =
  ({ name: "My Point", cx: 13, cy: 22, r: 345, color: "red" });

describe("mapStateToProps", () => {
  it("maps state to props: drawn point", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.drawnPoint = FAKE_POINT;
    const props = mapStateToProps(state);
    expect(props.drawnPoint?.cx).toEqual(13);
    expect(props.drawnPoint?.cy).toEqual(22);
  });

  it("maps state to props: drawn weed", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.drawnPoint = undefined;
    state.resources.consumers.farm_designer.drawnWeed = FAKE_POINT;
    const props = mapStateToProps(state);
    expect(props.drawnPoint?.cx).toEqual(13);
    expect(props.drawnPoint?.cy).toEqual(22);
  });
});

describe("<CreatePoints />", () => {
  beforeEach(() => {
    mockPath = "/app/designer/points/add";
  });

  const fakeProps = (): CreatePointsProps => ({
    dispatch: jest.fn(),
    drawnPoint: undefined,
    deviceY: 1.23,
    deviceX: 3.21
  });

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
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    const i = new CreatePoints(p);
    i.updateValue("color")(inputEvent("cheerful hue"));
    expect(i.props.drawnPoint).toBeTruthy();
    const expected = cloneDeep(FAKE_POINT);
    expected.color = "cheerful hue";
    expect(i.props.dispatch).toHaveBeenCalledWith({
      type: "SET_DRAWN_POINT_DATA",
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
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    const i = new CreatePoints(p);
    i.loadDefaultPoint();
    expect(i.props.dispatch).toHaveBeenCalledWith({
      type: "SET_DRAWN_POINT_DATA",
      payload: { name: "Created Point", color: "green", cx: 1, cy: 1, r: 15 },
    });
  });

  it("updates weed name", () => {
    mockPath = "/app/designer/weeds/add";
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, r: 100 };
    const panel = mount<CreatePoints>(<CreatePoints {...p} />);
    const wrapper = shallow(panel.instance().PointProperties());
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_WEED_DATA, payload: {
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
      pointer_type: "Weed",
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
      pointer_type: "GenericPointer",
      meta: { created_by: "farm-designer" }
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
      pointer_type: "Weed",
      meta: { created_by: "farm-designer" }
    });
  });

  it("changes point color", () => {
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, r: 0 },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("changes weed color", () => {
    mockPath = "/app/designer/weeds/add";
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, r: 0 },
      type: Actions.SET_DRAWN_WEED_DATA
    });
  });

  it("updates value", () => {
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, r: 0 };
    const wrapper = shallow<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "10" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: 10, cy: 0, r: 0, color: "green" },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("fills the state with point data", () => {
    const p = fakeProps();
    p.drawnPoint = { cx: 1, cy: 2, r: 3, color: "blue" };
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
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: undefined
    });
  });
});
