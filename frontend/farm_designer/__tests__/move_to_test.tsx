import React from "react";
import {
  act, cleanup, fireEvent, render, screen,
} from "@testing-library/react";
import {
  GoToThisLocationButton,
  GoToThisLocationButtonProps,
  MoveModeLink,
  MoveModeLinkProps,
  MoveToForm,
  MoveToFormProps,
  chooseLocation,
  movementPercentRemaining,
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

jest.mock("@blueprintjs/core", () => {
  const actual = jest.requireActual("@blueprintjs/core");
  return {
    ...actual,
    Slider: (props: { onChange: (value: number) => void, value: number }) =>
      <input data-testid={"speed-slider"}
        type={"number"}
        value={props.value}
        onChange={e => props.onChange(parseFloat(e.currentTarget.value))} />,
  };
});

jest.mock("../../controls/axis_input_box", () => ({
  AxisInputBox: (props: {
    axis: string;
    value: number | undefined;
    onChange: (axis: string, value: number) => void;
  }) =>
    <input data-testid={"axis-input-box"}
      type={"number"}
      value={props.value ?? ""}
      onChange={e => props.onChange(
        props.axis,
        parseFloat(e.currentTarget.value),
      )} />,
}));

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
  cleanup();
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

  it("moves to location: custom z value", () => {
    const ref = React.createRef<MoveToForm>();
    render(<MoveToForm {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ z: 50 }));
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 50, speed: 100, safeZ: false,
    });
  });

  it("changes z value", () => {
    const ref = React.createRef<MoveToForm>();
    render(<MoveToForm {...fakeProps()} ref={ref} />);
    fireEvent.change(screen.getByTestId("axis-input-box"),
      { target: { value: "10" } });
    expect(ref.current?.state.z).toEqual(10);
  });

  it("changes speed value", () => {
    const ref = React.createRef<MoveToForm>();
    render(<MoveToForm {...fakeProps()} ref={ref} />);
    fireEvent.change(screen.getByTestId("speed-slider"),
      { target: { value: "10" } });
    expect(ref.current?.state.speed).toEqual(10);
  });

  it("changes safe z value", () => {
    const ref = React.createRef<MoveToForm>();
    render(<MoveToForm {...fakeProps()} ref={ref} />);
    act(() => ref.current?.setState({ safeZ: true }));
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 2, z: 3, speed: 100, safeZ: true,
    });
  });

  it("fills in some missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: 1, y: undefined, z: undefined };
    const { container } = render(<MoveToForm {...p} />);
    expect((container.querySelector("input[name='y']") as HTMLInputElement)
      .value).toEqual("---");
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 1, y: 20, z: 30, speed: 100, safeZ: false,
    });
  });

  it("fills in all missing values", () => {
    const p = fakeProps();
    p.chosenLocation = { x: undefined, y: undefined, z: undefined };
    p.currentBotLocation = { x: undefined, y: undefined, z: undefined };
    const { container } = render(<MoveToForm {...p} />);
    expect((container.querySelector("input[name='y']") as HTMLInputElement)
      .value).toEqual("---");
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(deviceActions.move).toHaveBeenCalledWith({
      x: 0, y: 0, z: 0, speed: 100, safeZ: false,
    });
  });

  it("is disabled when bot is offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    render(<MoveToForm {...p} />);
    expect(screen.getByRole("button", { name: "GO" }).className)
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
    fireEvent.click(screen.getByTitle("open move mode panel"));
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

  it("toggles state", () => {
    const ref = React.createRef<GoToThisLocationButton>();
    render(<GoToThisLocationButton {...fakeProps()} ref={ref} />);
    expect(ref.current?.state.open).toEqual(false);
    act(() => ref.current?.toggle("open")());
    expect(ref.current?.state.open).toEqual(true);
  });

  it("renders progress", () => {
    const p = fakeProps();
    p.arduinoBusy = true;
    p.currentBotLocation = { x: 50, y: 50, z: 0 };
    p.movementState.start = { x: 0, y: 0, z: 0 };
    p.movementState.distance = { x: 100, y: 100, z: 0 };
    const { container } = render(<GoToThisLocationButton {...p} />);
    const progress = container.querySelector(".movement-progress");
    if (!progress) { throw new Error("Expected movement progress"); }
    expect((progress as HTMLElement).style.width).toEqual("50%");
    expect((progress as HTMLElement).style.top).toEqual("0px");
    expect((progress as HTMLElement).style.left).toEqual("0px");
  });

  it("renders as unavailable: offline", () => {
    const p = fakeProps();
    p.botOnline = false;
    const { container } = render(<GoToThisLocationButton {...p} />);
    expect(container.textContent?.toLowerCase()).toContain("farmbot is offline");
    const mainButton = container.querySelector(".go-button-axes-text");
    if (!mainButton) { throw new Error("Expected primary go button"); }
    fireEvent.click(mainButton);
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
    const mainButton = container.querySelector(".go-button-axes-text");
    if (!mainButton) { throw new Error("Expected primary go button"); }
    fireEvent.mouseEnter(mainButton);
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(mainButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    fireEvent.click(mainButton);
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 0, y: 0, z: 0 });
  });

  it("moves", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const { container } = render(<GoToThisLocationButton {...p} />);
    const xyzButton = container.querySelector("button.xyz");
    if (!xyzButton) { throw new Error("Expected xyz button"); }
    fireEvent.mouseEnter(xyzButton);
    expect(p.dispatch).toHaveBeenCalledTimes(1);
    fireEvent.mouseLeave(xyzButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    fireEvent.click(xyzButton);
    expect(p.dispatch).toHaveBeenCalledTimes(3);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
    expect(configStorageActions.setWebAppConfigValue).not.toHaveBeenCalled();
  });

  it("sets new default", () => {
    const p = fakeProps();
    p.defaultAxes = "";
    const { container } = render(<GoToThisLocationButton {...p} />);
    fireEvent.click(screen.getByTitle("save as default"));
    const xyzButton = container.querySelector("button.xyz");
    if (!xyzButton) { throw new Error("Expected xyz button"); }
    fireEvent.click(xyzButton);
    expect(p.dispatch).toHaveBeenCalledTimes(2);
    expect(deviceActions.move).toHaveBeenCalledWith({ x: 1, y: 2, z: 3 });
    expect(configStorageActions.setWebAppConfigValue).toHaveBeenCalledWith(
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
