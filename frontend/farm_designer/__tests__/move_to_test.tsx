jest.mock("../../devices/actions", () => ({ move: jest.fn() }));

jest.mock("../../config_storage/actions", () => ({
  setWebAppConfigValue: jest.fn(),
}));

import { PopoverProps } from "../../ui/popover";
jest.mock("../../ui/popover", () => ({
  Popover: ({ target, content }: PopoverProps) => <div>{target}{content}</div>,
}));

import React from "react";
import { mount, shallow } from "enzyme";
import { render, screen, fireEvent } from "@testing-library/react";
import {
  MoveToForm, MoveToFormProps, MoveModeLink, chooseLocation,
  GoToThisLocationButtonProps, GoToThisLocationButton, movementPercentRemaining,
  MoveModeLinkProps,
} from "../move_to";
import { Actions } from "../../constants";
import { move } from "../../devices/actions";
import { Path } from "../../internal_urls";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { StringSetting } from "../../session_keys";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { mockDispatch } from "../../__test_support__/fake_dispatch";

describe("<MoveToForm />", () => {
  const fakeProps = (): MoveToFormProps => ({
    chosenLocation: { x: 1, y: 2, z: 3 },
    currentBotLocation: { x: 10, y: 20, z: 30 },
    botOnline: true,
    locked: false,
    dispatch: jest.fn(),
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
  const fakeProps = (): MoveModeLinkProps => ({
    dispatch: jest.fn(),
  });

  it("enters 'move to' mode", () => {
    const p = fakeProps();
    const dispatch = jest.fn();
    p.dispatch = mockDispatch(dispatch);
    render(<MoveModeLink {...p} />);
    const button = screen.getByTitle("open move mode panel");
    fireEvent.click(button);
    expect(mockNavigate).toHaveBeenCalledWith(Path.location());
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.SET_PANEL_OPEN,
      payload: true,
    });
  });
});

describe("chooseLocation()", () => {
  it("updates chosen coordinates", () => {
    location.pathname = Path.mock(Path.location());
    const navigate = jest.fn();
    const dispatch = jest.fn();
    chooseLocation({ navigate, dispatch, gardenCoords: { x: 1, y: 2 } });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 1, y: 2, z: 0 },
    });
    expect(navigate).toHaveBeenCalledWith(Path.location({ x: 1, y: 2 }));
  });

  it("doesn't update coordinates or navigate", () => {
    location.pathname = Path.mock(Path.location());
    const navigate = jest.fn();
    const dispatch = jest.fn();
    chooseLocation({ navigate, dispatch, gardenCoords: undefined });
    expect(dispatch).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate: same location", () => {
    location.pathname = Path.mock(Path.location({ x: 1, y: 2 }));
    const navigate = jest.fn();
    const dispatch = jest.fn();
    chooseLocation({ navigate, dispatch, gardenCoords: { x: 1, y: 2 } });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 1, y: 2, z: 0 },
    });
    expect(navigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate: not in location panel", () => {
    location.pathname = Path.mock(Path.plants());
    const navigate = jest.fn();
    const dispatch = jest.fn();
    chooseLocation({ navigate, dispatch, gardenCoords: { x: 1, y: 2 } });
    expect(dispatch).toHaveBeenCalledWith({
      type: Actions.CHOOSE_LOCATION,
      payload: { x: 1, y: 2, z: 0 },
    });
    expect(navigate).not.toHaveBeenCalled();
  });
});

describe("<GoToThisLocationButton />", () => {
  const fakeProps = (): GoToThisLocationButtonProps => ({
    defaultAxes: "XYZ",
    locationCoordinate: { x: 1, y: 2, z: 3 },
    botOnline: true,
    arduinoBusy: false,
    dispatch: jest.fn(),
    currentBotLocation: { x: 0, y: 0, z: 0 },
    movementState: fakeMovementState(),
  });

  it("toggles state", () => {
    const wrapper = mount<GoToThisLocationButton>(
      <GoToThisLocationButton {...fakeProps()} />);
    expect(wrapper.instance().state.open).toEqual(false);
    wrapper.instance().toggle("open")();
    expect(wrapper.instance().state.open).toEqual(true);
  });

  it("renders progress", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    p.currentBotLocation = { x: 50, y: 50, z: 0 };
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 100, y: 100, z: 0 };
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    expect(wrapper.find(".movement-progress").props().style).toEqual({
      top: 0, left: 0, width: "50%",
    });
  });

  it("renders as unavailable: offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    wrapper.setState({ open: true });
    expect(wrapper.text().toLowerCase()).toContain("farmbot is offline");
    wrapper.find("button").first().simulate("click");
    expect(move).not.toHaveBeenCalled();
  });

  it("renders as unavailable: busy", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    wrapper.setState({ open: true });
    expect(wrapper.text().toLowerCase()).toContain("farmbot is busy");
  });

  it("moves: default", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    wrapper.find("button").first().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    wrapper.find("button").first().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    wrapper.find("button").first().simulate("click");
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(move).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("moves", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    wrapper.setState({ open: true });
    wrapper.update();
    wrapper.find("button").last().simulate("mouseEnter");
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    wrapper.find("button").last().simulate("mouseLeave");
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    wrapper.find("button").last().simulate("click");
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
    expect(setWebAppConfigValue).not.toHaveBeenCalled();
  });

  it("sets new default", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const wrapper = mount(<GoToThisLocationButton {...p} />);
    wrapper.setState({ open: true, setAsDefault: true });
    wrapper.update();
    wrapper.find("button").last().simulate("click");
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
    expect(setWebAppConfigValue).toHaveBeenCalledWith(
      StringSetting.go_button_axes, "XYZ");
  });
});

describe("movementPercentRemaining()", () => {
  it("returns percent remaining", () => {
    expect(movementPercentRemaining({ x: 50, y: 50, z: 0 }, {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 100, y: 100, z: 0 },
    })).toEqual(50);
    expect(movementPercentRemaining({ x: 0, y: 0, z: 0 }, {
      start: { x: -100, y: 100, z: 0 },
      distance: { x: 200, y: -200, z: 0 },
    })).toEqual(50);
    expect(movementPercentRemaining({ x: 200, y: 200, z: 200 }, {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 100, y: 100, z: 100 },
    })).toEqual(100);
    expect(movementPercentRemaining({ x: -200, y: -200, z: -200 }, {
      start: { x: 0, y: 0, z: 0 },
      distance: { x: 100, y: 100, z: 100 },
    })).toEqual(0);
  });
});
