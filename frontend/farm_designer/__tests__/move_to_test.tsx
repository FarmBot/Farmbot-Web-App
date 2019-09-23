jest.mock("react-redux", () => ({ connect: jest.fn(() => (x: {}) => x) }));

const mockDevice = { moveAbsolute: jest.fn(() => Promise.resolve()) };
jest.mock("../../device", () => ({ getDevice: () => mockDevice }));

let mockPath = "";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  history: { push: jest.fn() }
}));

import * as React from "react";
import { mount, shallow } from "enzyme";
import {
  MoveTo, MoveToProps, MoveToForm, MoveToFormProps, MoveModeLink, chooseLocation,
  mapStateToProps
} from "../move_to";
import { history } from "../../history";
import { Actions } from "../../constants";
import { clickButton } from "../../__test_support__/helpers";
import { fakeState } from "../../__test_support__/fake_state";

describe("<MoveTo />", () => {
  beforeEach(function () {
    mockPath = "/app/designer/move_to";
  });

  const fakeProps = (): MoveToProps => ({
    chosenLocation: { x: 1, y: 2, z: 3 },
    currentBotLocation: { x: 10, y: 20, z: 30 },
    dispatch: jest.fn(),
    botOnline: true,
  });

  it("moves to location: bot's current z value", () => {
    const wrapper = mount(<MoveTo {...fakeProps()} />);
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 30 });
  });

  it("goes back", () => {
    const wrapper = mount(<MoveTo {...fakeProps()} />);
    wrapper.find("i").first().simulate("click");
    expect(history.push).toHaveBeenCalledWith("/app/designer/plants");
  });

  it("unmounts", () => {
    const p = fakeProps();
    const wrapper = mount(<MoveTo {...p} />);
    jest.clearAllMocks();
    wrapper.unmount();
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: undefined, y: undefined, z: undefined }
    });
  });
});

describe("<MoveToForm />", () => {
  const fakeProps = (): MoveToFormProps => ({
    chosenLocation: { x: 1, y: 2, z: 3 },
    currentBotLocation: { x: 10, y: 20, z: 30 },
    botOnline: true,
  });

  it("moves to location: custom z value", () => {
    const wrapper = mount(<MoveToForm {...fakeProps()} />);
    wrapper.setState({ z: 50 });
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 2, z: 50 });
  });

  it("changes value", () => {
    const wrapper = shallow<MoveToForm>(<MoveToForm {...fakeProps()} />);
    wrapper.findWhere(n => "onChange" in n.props()).simulate("change", "", 10);
    expect(wrapper.state().z).toEqual(10);
  });

  it("fills in some missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 1, y: undefined, z: undefined };
    const wrapper = mount(<MoveToForm {...p} />);
    expect(wrapper.find("input").at(1).props().value).toEqual("---");
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 1, y: 20, z: 30 });
  });

  it("fills in all missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: undefined, y: undefined, z: undefined };
    p.currentBotLocation = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount(<MoveToForm {...p} />);
    expect(wrapper.find("input").at(1).props().value).toEqual("---");
    wrapper.find("button").simulate("click");
    expect(mockDevice.moveAbsolute).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("is disabled when bot is offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<MoveToForm {...p} />);
    expect(wrapper.find("button").hasClass("pseudo-disabled")).toBeTruthy();
  });
});

describe("<MoveModeLink />", () => {
  it("enters 'move to' mode", () => {
    const wrapper = shallow(<MoveModeLink />);
    clickButton(wrapper, 0, "move mode");
    expect(history.push).toHaveBeenCalledWith("/app/designer/move_to");
  });
});

describe("chooseLocation()", () => {
  it("updates chosen coordinates", () => {
    const dispatch = jest.fn();
    chooseLocation({ dispatch, gardenCoords: { x: 1, y: 2 } });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 1, y: 2, z: 0 }
    });
  });
});

describe("mapStateToProps()", () => {
  it("returns props", () => {
    const state = fakeState();
    state.resources.consumers.farm_designer.chosenLocation = { x: 1, y: 2, z: 3 };
    const props = mapStateToProps(state);
    expect(props.chosenLocation).toEqual({ x: 1, y: 2, z: 3 });
  });
});
