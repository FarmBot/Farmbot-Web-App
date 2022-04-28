jest.mock("../../api/crud", () => ({ initSave: jest.fn() }));

jest.mock("../../api/delete_points", () => ({
  deletePoints: jest.fn()
}));

import { Path } from "../../internal_urls";
let mockPath = Path.mock(Path.points("add"));
jest.mock("../../history", () => ({
  push: jest.fn(),
  getPathArray: () => mockPath.split("/"),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  RawCreatePoints as CreatePoints,
  CreatePointsProps,
  mapStateToProps,
} from "../create_points";
import { initSave } from "../../api/crud";
import { deletePoints } from "../../api/delete_points";
import { Actions } from "../../constants";
import { clickButton } from "../../__test_support__/helpers";
import { fakeState } from "../../__test_support__/fake_state";
import { DrawnPointPayl } from "../../farm_designer/interfaces";
import { inputEvent } from "../../__test_support__/fake_html_events";
import { cloneDeep } from "lodash";

const FAKE_POINT: DrawnPointPayl =
  ({ name: "My Point", cx: 13, cy: 22, z: 0, r: 345, color: "red" });

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
    mockPath = Path.mock(Path.points("add"));
  });

  const fakeProps = (): CreatePointsProps => ({
    dispatch: jest.fn(),
    drawnPoint: undefined,
    botPosition: { x: 1.23, y: 3.21, z: 1 },
    xySwap: false,
  });

  it("renders for points", () => {
    mockPath = Path.mock(Path.designer());
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["add point", "delete", "x", "y", "z", "radius"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("renders for weeds", () => {
    mockPath = Path.mock(Path.weeds("add"));
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["add weed", "delete", "x", "y", "z", "radius"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("updates specific fields", () => {
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    wrapper.instance().updateValue("color")(inputEvent("cheerful hue"));
    expect(wrapper.instance().props.drawnPoint).toBeTruthy();
    const expected = cloneDeep(FAKE_POINT);
    expected.color = "cheerful hue";
    expect(wrapper.instance().props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: expected,
    });
  });

  it("updates radius", () => {
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    wrapper.instance().updateValue("r")(inputEvent("100"));
    expect(wrapper.instance().props.drawnPoint).toBeTruthy();
    const expected = cloneDeep(FAKE_POINT);
    expected.r = 100;
    expect(wrapper.instance().props.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
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
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        name: "Created Point", color: "green",
        cx: 13, cy: 22, z: 0, r: 15
      },
    });
  });

  it("adds soil height flag", () => {
    mockPath = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, z: 0, r: 100 };
    const panel = mount<CreatePoints>(<CreatePoints {...p} />);
    const wrapper = shallow(panel.instance().PointProperties());
    wrapper.find("input").last().simulate("change", {
      currentTarget: { checked: true }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: {
        cx: 0, cy: 0, z: 0, r: 100, color: "green", at_soil_level: true,
      }
    });
  });

  it("creates point with soil height flag", () => {
    mockPath = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    wrapper.setState({ at_soil_level: true });
    wrapper.update();
    clickButton(wrapper, 1, "save");
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: {
        color: "red", created_by: "farm-designer", type: "point",
        at_soil_level: "true",
      },
      name: "My Point",
      pointer_type: "GenericPointer",
      plant_stage: "active",
      radius: 345, x: 13, y: 22, z: 0,
    });
  });

  it.each<[string, string]>([
    ["point", Path.points("add")],
    ["weed", Path.weeds("add")],
  ])("uses current location: %s", (type, path) => {
    mockPath = Path.mock(path);
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    p.botPosition = { x: 1, y: 2, z: 3 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    clickButton(wrapper, 0, "", { icon: "fa-crosshairs" });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 1, cy: 2, z: 3, r: 30, name: "My Point" },
      type: type == "point"
        ? Actions.SET_DRAWN_POINT_DATA
        : Actions.SET_DRAWN_WEED_DATA,
    });
    expect(wrapper.state()).toEqual({ cx: 1, cy: 2, z: 3, r: 30 });
  });

  it("doesn't use current location", () => {
    mockPath = Path.mock(Path.points("add"));
    const p = fakeProps();
    p.drawnPoint = FAKE_POINT;
    p.botPosition = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    jest.resetAllMocks();
    clickButton(wrapper, 0, "", { icon: "fa-crosshairs" });
    expect(p.dispatch).not.toHaveBeenCalled();
    expect(wrapper.state()).toEqual({ cx: 10, cy: 20, r: 30 });
  });

  it("updates weed name", () => {
    mockPath = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, z: 0, r: 100 };
    const panel = mount<CreatePoints>(<CreatePoints {...p} />);
    const wrapper = shallow(panel.instance().PointProperties());
    wrapper.find("BlurableInput").first().simulate("commit", {
      currentTarget: { value: "new name" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.SET_DRAWN_WEED_DATA, payload: {
        cx: 0, cy: 0, z: 0, r: 100, name: "new name", color: "red",
      }
    });
  });

  it("creates point", () => {
    mockPath = Path.mock(Path.points("add"));
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    clickButton(wrapper, 1, "save");
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: { color: "green", created_by: "farm-designer", type: "point" },
      name: "Created Point",
      pointer_type: "GenericPointer",
      plant_stage: "active",
      radius: 30, x: 10, y: 20, z: 0,
    });
  });

  it("creates weed", () => {
    mockPath = Path.mock(Path.weeds("add"));
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30 });
    clickButton(wrapper, 1, "save");
    expect(initSave).toHaveBeenCalledWith("Point", {
      meta: { color: "red", created_by: "farm-designer", type: "weed" },
      name: "Created Weed",
      pointer_type: "Weed",
      plant_stage: "active",
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
    mockPath = Path.mock(Path.weeds("add"));
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
    p.drawnPoint = { cx: 0, cy: 0, z: 0, r: 0 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, z: 0, r: 0 },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("changes weed color", () => {
    mockPath = Path.mock(Path.weeds("add"));
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, z: 0, r: 0 };
    const wrapper = mount<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("ColorPicker").simulate("change", "red");
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { color: "red", cx: 0, cy: 0, z: 0, r: 0 },
      type: Actions.SET_DRAWN_WEED_DATA
    });
  });

  it("updates value", () => {
    const p = fakeProps();
    p.drawnPoint = { cx: 0, cy: 0, z: 0, r: 0 };
    const wrapper = shallow<CreatePoints>(<CreatePoints {...p} />);
    const PP = wrapper.instance().PointProperties;
    const component = shallow(<PP />);
    component.find("BlurableInput").at(1).simulate("commit", {
      currentTarget: { value: "10" }
    });
    expect(p.dispatch).toHaveBeenCalledWith({
      payload: { cx: 10, cy: 0, z: 0, r: 0, color: "green" },
      type: Actions.SET_DRAWN_POINT_DATA
    });
  });

  it("fills the state with point data", () => {
    const p = fakeProps();
    p.drawnPoint = { cx: 1, cy: 2, z: 0, r: 3, color: "blue" };
    const wrapper = shallow<CreatePoints>(<CreatePoints {...p} />);
    const i = wrapper.instance();
    expect(i.state).toEqual({});
    expect(i.getPointData()).toEqual({
      name: undefined,
      cx: 1,
      cy: 2,
      z: 0,
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
