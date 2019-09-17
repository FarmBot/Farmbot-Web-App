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
import {
  CreatePoints,
  CreatePointsProps,
  mapStateToProps
} from "../create_points";
import { initSave } from "../../../api/crud";
import { deletePoints } from "../../../farmware/weed_detector/actions";
import { Actions } from "../../../constants";
import { clickButton } from "../../../__test_support__/helpers";
import { fakeState } from "../../../__test_support__/fake_state";
import { DeepPartial } from "redux";
import { CurrentPointPayl } from "../../interfaces";

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
  const fakeProps = (): CreatePointsProps => {
    return {
      dispatch: jest.fn(),
      currentPoint: undefined,
      deviceY: 1.23,
      deviceX: 3.21
    };
  };

  const fakeInstance = () => {
    const props = fakeProps();
    props.currentPoint = FAKE_POINT;
    return new CreatePoints(props);
  };

  it("renders", () => {
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    ["create point", "cancel", "delete", "x", "y", "radius", "color"]
      .map(string => expect(wrapper.text().toLowerCase()).toContain(string));
  });

  it("updates specific fields", () => {
    const i = fakeInstance();
    const updater = i.updateValue("color");
    type Event = React.SyntheticEvent<HTMLInputElement>;
    const e: DeepPartial<Event> = {
      currentTarget: {
        value: "cheerful hue"
      }
    };
    updater(e as Event);
    expect(i.props.currentPoint).toBeTruthy();
    expect(i.props.dispatch).toHaveBeenCalledWith({
      payload: {
        color: "cheerful hue",
        cx: 13,
        cy: 22,
        name: "My Point",
        r: 345,
      },
      type: "SET_CURRENT_POINT_DATA",
    });
  });

  it("updates current point", () => {
    const p = fakeInstance();
    p.updateCurrentPoint();
    expect(p.props.dispatch).toHaveBeenCalledWith({
      type: "SET_CURRENT_POINT_DATA",
      payload: { cx: 13, cy: 22, name: "My Point", r: 345, color: "red" },
    });
  });
  it("creates point", () => {
    const wrapper = mount(<CreatePoints {...fakeProps()} />);
    wrapper.setState({ cx: 10, cy: 20, r: 30, color: "red" });
    clickButton(wrapper, 0, "create point");
    expect(initSave).toHaveBeenCalledWith("Point",
      {
        meta: { color: "red", created_by: "farm-designer" },
        name: "Created Point",
        pointer_type: "GenericPointer",
        radius: 30, x: 10, y: 20, z: 0
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
