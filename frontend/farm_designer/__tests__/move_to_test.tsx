jest.mock("../../devices/actions", () => ({ move: jest.fn() }));

const mockPath = "";
jest.mock("../../history", () => ({
  getPathArray: jest.fn(() => mockPath.split("/")),
  push: jest.fn(),
}));

import React from "react";
import { mount, shallow } from "enzyme";
import {
  MoveToForm, MoveToFormProps, MoveModeLink, chooseLocation,
} from "../move_to";
import { push } from "../../history";
import { Actions } from "../../constants";
import { clickButton } from "../../__test_support__/helpers";
import { move } from "../../devices/actions";
import { Path } from "../../internal_urls";

describe("<MoveToForm />", () => {
  const fakeProps = (): MoveToFormProps => ({
    chosenLocation: { x: 1, y: 2, z: 3 },
    currentBotLocation: { x: 10, y: 20, z: 30 },
    botOnline: true,
    locked: false,
  });

  it("moves to location: custom z value", () => {
    const wrapper = mount(<MoveToForm {...fakeProps()} />);
    wrapper.setState({ z: 50 });
    wrapper.find("button").simulate("click");
    expect(move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 50, speed: 100, safeZ: false,
    });
  });

  it("changes z value", () => {
    const wrapper = shallow<MoveToForm>(<MoveToForm {...fakeProps()} />);
    wrapper.findWhere(n => "onChange" in n.props()).first()
      .simulate("change", "", 10);
    expect(wrapper.state().z).toEqual(10);
  });

  it("changes speed value", () => {
    const wrapper = shallow<MoveToForm>(<MoveToForm {...fakeProps()} />);
    wrapper.findWhere(n => "onChange" in n.props()).at(1)
      .simulate("change", 10);
    expect(wrapper.state().speed).toEqual(10);
  });

  it("changes safe z value", () => {
    const wrapper = shallow<MoveToForm>(<MoveToForm {...fakeProps()} />);
    wrapper.findWhere(n => "onChange" in n.props()).at(2)
      .simulate("change");
    expect(wrapper.state().safeZ).toEqual(true);
  });

  it("fills in some missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 1, y: undefined, z: undefined };
    const wrapper = mount(<MoveToForm {...p} />);
    expect(wrapper.find("input").at(1).props().value).toEqual("---");
    wrapper.find("button").simulate("click");
    expect(move).toHaveBeenCalledWith({
      x: 1, y: 20, z: 30, speed: 100, safeZ: false,
    });
  });

  it("fills in all missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: undefined, y: undefined, z: undefined };
    p.currentBotLocation = { x: undefined, y: undefined, z: undefined };
    const wrapper = mount(<MoveToForm {...p} />);
    expect(wrapper.find("input").at(1).props().value).toEqual("---");
    wrapper.find("button").simulate("click");
    expect(move).toHaveBeenCalledWith({
      x: 0, y: 0, z: 0, speed: 100, safeZ: false,
    });
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
    expect(push).toHaveBeenCalledWith(Path.location());
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

  it("doesn't update coordinates", () => {
    const dispatch = jest.fn();
    chooseLocation({ dispatch, gardenCoords: undefined });
    expect(dispatch).not.toHaveBeenCalled();
  });
});
