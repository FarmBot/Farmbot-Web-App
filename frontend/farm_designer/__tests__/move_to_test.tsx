import React from "react";
import { act, fireEvent, render, screen } from "@testing-library/react";
import {
  MoveToForm, MoveToFormProps, MoveModeLink, chooseLocation,
  GoToThisLocationButtonProps, GoToThisLocationButton, movementPercentRemaining,
  MoveModeLinkProps,
} from "../move_to";
import { Actions } from "../../constants";
import * as deviceActions from "../../devices/actions";
import { Path } from "../../internal_urls";
import * as configStorageActions from "../../config_storage/actions";
import { StringSetting } from "../../session_keys";
import { fakeMovementState } from "../../__test_support__/fake_bot_data";
import { mockDispatch } from "../../__test_support__/fake_dispatch";
import { DevSettings } from "../../settings/dev/dev_support";
import * as popover from "../../ui/popover";

let moveSpy: jest.SpyInstance;
let setWebAppConfigValueSpy: jest.SpyInstance;
let allOrderOptionsEnabledSpy: jest.SpyInstance;
let popoverSpy: jest.SpyInstance;
const originalPathname = location.pathname;
const originalSearch = location.search;

beforeEach(() => {
  popoverSpy = jest.spyOn(popover, "Popover")
    .mockImplementation(({ target, content }: popover.PopoverProps) =>
      <div>{target}{content}</div>);
  moveSpy = jest.spyOn(deviceActions, "move").mockImplementation(jest.fn());
  setWebAppConfigValueSpy =
    jest.spyOn(configStorageActions, "setWebAppConfigValue")
      .mockImplementation(jest.fn());
  allOrderOptionsEnabledSpy =
    jest.spyOn(DevSettings, "allOrderOptionsEnabled").mockReturnValue(false);
});

afterEach(() => {
  location.pathname = originalPathname;
  location.search = originalSearch;
  popoverSpy.mockRestore();
  moveSpy.mockRestore();
  setWebAppConfigValueSpy.mockRestore();
  allOrderOptionsEnabledSpy.mockRestore();
});

describe("<MoveToForm />", () => {
  const fakeProps = (): MoveToFormProps => ({
    chosenLocation: { x: 1, y: 2, z: 3 },
    currentBotLocation: { x: 10, y: 20, z: 30 },
    botOnline: true,
    locked: false,
    dispatch: jest.fn(),
    defaultAxisOrder: "safe_z",
  });

  const getZInput = (container: HTMLElement): HTMLInputElement => {
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    const fromWrapper = container.querySelector(".input input") as
      HTMLInputElement | null;
    if (fromWrapper) {
      return fromWrapper;
    }
    return container.querySelectorAll<HTMLInputElement>("input")[2];
  };

  const getGoButton = (container: HTMLElement) =>
    container.querySelector("button") as HTMLButtonElement;

  it("moves to location: custom z value", () => {
    const ref = React.createRef<MoveToForm>();
    const { container } = render(<MoveToForm {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({ z: 50 });
    });
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 50, speed: 100, safeZ: false,
    });
  });

  it("changes z value", () => {
    const { container } = render(<MoveToForm {...fakeProps()} />);
    const zInput = getZInput(container);
    expect(zInput).toBeTruthy();
    fireEvent.focus(zInput);
    fireEvent.change(zInput, { target: { value: "10" } });
    fireEvent.blur(zInput);
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 10, speed: 100, safeZ: false,
    });
  });

  it("changes speed value", () => {
    const ref = React.createRef<MoveToForm>();
    const { container } = render(<MoveToForm {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({ speed: 10 });
    });
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 3, speed: 10, safeZ: false,
    });
  });

  it("changes safe z value", () => {
    const ref = React.createRef<MoveToForm>();
    const { container } = render(<MoveToForm {...fakeProps()} ref={ref} />);
    act(() => {
      ref.current?.setState({ safeZ: true });
    });
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith(expect.objectContaining({
      safeZ: true,
    }));
  });

  it("fills in some missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 1, y: undefined, z: undefined };
    const { container } = render(<MoveToForm {...p} />);
    expect(container.querySelectorAll("input")[1].value).toEqual("---");
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 20, z: 30, speed: 100, safeZ: false,
    });
  });

  it("fills in all missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: undefined, y: undefined, z: undefined };
    p.currentBotLocation = { x: undefined, y: undefined, z: undefined };
    const { container } = render(<MoveToForm {...p} />);
    expect(container.querySelectorAll("input")[1].value).toEqual("---");
    fireEvent.click(getGoButton(container));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 0, y: 0, z: 0, speed: 100, safeZ: false,
    });
  });

  it("is disabled when bot is offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const { container } = render(<MoveToForm {...p} />);
    expect(getGoButton(container).classList)
      .toContain("pseudo-disabled");
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
    location.search = "";
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
    location.search = "";
    const navigate = jest.fn();
    const dispatch = jest.fn();
    chooseLocation({ navigate, dispatch, gardenCoords: undefined });
    expect(dispatch).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("doesn't navigate: same location", () => {
    location.pathname = Path.mock(Path.location({ x: 1, y: 2 }));
    location.search = "?x=1&y=2";
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
    location.search = "";
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

  const defaultButtons = (container: HTMLElement) =>
    Array.from(container.querySelectorAll("button"))
      .filter(button => button.classList.contains("go-button-axes-text"));

  const optionButtons = (container: HTMLElement) =>
    Array.from(container.querySelectorAll(".go-axes button"))
      .filter(button => button.tagName === "BUTTON");

  it("renders progress", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    p.currentBotLocation = { x: 50, y: 50, z: 0 };
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 100, y: 100, z: 0 };
    const { container } = render(<GoToThisLocationButton {...p} />);
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    expect((container.querySelector(".movement-progress") as HTMLElement | null)
      ?.style.width)
      .toEqual("50%");
  });

  it("renders as unavailable: offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const { container } = render(<GoToThisLocationButton {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("farmbot is offline");
    fireEvent.click(defaultButtons(container)[0]);
    expect(deviceActions.move).not.toHaveBeenCalled();
  });

  it("renders as unavailable: busy", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    const { container } = render(<GoToThisLocationButton {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("farmbot is busy");
  });

  it("moves: default", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const { container } = render(<GoToThisLocationButton {...p} />);
    const defaultButton = defaultButtons(container)[0];
    fireEvent.mouseEnter(defaultButton);
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(defaultButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    fireEvent.click(defaultButton);
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("moves", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const { container } = render(<GoToThisLocationButton {...p} />);
    const axisButton = optionButtons(container)[0];
    fireEvent.mouseEnter(axisButton);
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(axisButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    fireEvent.click(axisButton);
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(configStorageActions.setWebAppConfigValue).not.toHaveBeenCalled();
  });

  it("sets new default", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const { container } = render(<GoToThisLocationButton {...p} />);
    const saveDefault = container.querySelector(
      ".save-as-default-wrapper input[type=checkbox]") as HTMLInputElement;
    fireEvent.click(saveDefault);
    const axisButton = optionButtons(container)[0];
    fireEvent.click(axisButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 0, z: 0 });
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
      StringSetting.go_button_axes, "X");
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
