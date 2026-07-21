import React from "react";
import {
  fireEvent, render, screen,
} from "@testing-library/react";
import { clone } from "lodash";
import { Xyz } from "farmbot";
import { INITIAL } from "../../config";
import * as controls from "../../controls";
import * as deviceActions from "../../../devices/actions";
import * as configActions from "../../../config_storage/actions";
import { createBotPositionSnapshotStore } from "../position_spring";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import {
  getNativeJogControlPositions, getNativeJogDevicePosition,
  getNativeJogRenderDirection, getNativeJogStepSize,
  NativeJogControlPair, NativeJogControlPairProps,
  NATIVE_JOG_ARROW_LENGTH,
} from "../native_jog_controls";

describe("native jog control geometry", () => {
  it("positions each control in its requested kinematic frame", () => {
    const config = clone(INITIAL);
    config.bedWidthOuter = 1360;
    config.bedYOffset = 20;

    expect(getNativeJogControlPositions(config)).toEqual({
      x: [[0, -120, 0], [0, 1440, 0]],
      y: [[-39, 50, 700], [-39, 1350, 700]],
      z: [60, 0, 300],
    });
  });

  it("converts mirrored scene coordinates back to device coordinates", () => {
    const config = clone(INITIAL);
    config.botSizeX = 3000;
    config.botSizeY = 1500;
    config.mirrorX = true;
    config.mirrorY = true;
    expect(getNativeJogDevicePosition(
      config,
      { x: 100, y: 200, z: -300 },
    )).toEqual({ x: 2900, y: 1300, z: -300 });
    config.mirrorX = false;
    config.mirrorY = false;
    expect(getNativeJogDevicePosition(
      config,
      { x: 100, y: 200, z: -300 },
    )).toEqual({ x: 100, y: 200, z: -300 });
  });

  it.each([
    ["x", true, true, 1, -1],
    ["y", true, true, 1, -1],
    ["z", true, true, 1, 1],
    ["z", true, false, 1, -1],
  ] as const)(
    "maps device %s direction into the rendered scene",
    (axis, mirror, negativeZ, deviceDirection, renderDirection) => {
      const config = clone(INITIAL);
      config.mirrorX = mirror;
      config.mirrorY = mirror;
      config.negativeZ = negativeZ;
      expect(getNativeJogRenderDirection(
        config,
        axis,
        deviceDirection,
      )).toEqual(renderDirection);
    },
  );

  it("limits the 3D move amount to its four selector values", () => {
    expect(getNativeJogStepSize(1)).toEqual(1);
    expect(getNativeJogStepSize(1000)).toEqual(1000);
    expect(getNativeJogStepSize(10000)).toEqual(100);
    expect(getNativeJogStepSize(undefined)).toEqual(100);
  });

  it("renders two 100mm gray arrows and a sphere in one handle", () => {
    const arrowSpy = jest.spyOn(controls, "ControlArrow")
      .mockImplementation(props => <i
        data-testid={props.name}
        data-color={props.color}
        data-depth-test={String(props.depthTest)}
        data-depth-write={String(props.depthWrite)}
        data-render-order={props.renderOrder}
        data-end={props.end.join(",")} />);
    const sphereSpy = jest.spyOn(controls, "ControlSphere")
      .mockImplementation(props => <i
        data-testid={props.name}
        data-depth-test={String(props.depthTest)}
        data-depth-write={String(props.depthWrite)}
        data-render-order={props.renderOrder} />);
    const onSelect = jest.fn();
    const { container } = render(<NativeJogControlPair
      axis={"z"}
      config={clone(INITIAL)}
      name={"bot-jog-z"}
      onClose={jest.fn()}
      onSelect={onSelect}
      position={[100, 0, 300]}
      positionStore={createBotPositionSnapshotStore({
        x: 100,
        y: 200,
        z: -300,
      })} />);

    expect(container.querySelectorAll("[name='bot-jog-z-control']"))
      .toHaveLength(1);
    expect(screen.getByTestId("bot-jog-z-sphere")).toBeInTheDocument();
    expect(screen.getByTestId("bot-jog-z-plus-arrow"))
      .toHaveAttribute("data-end", `0,0,${NATIVE_JOG_ARROW_LENGTH}`);
    expect(screen.getByTestId("bot-jog-z-minus-arrow"))
      .toHaveAttribute("data-end", `0,0,-${NATIVE_JOG_ARROW_LENGTH}`);
    screen.getAllByTestId(/bot-jog-z-.*-arrow/).forEach(arrow => {
      expect(arrow).toHaveAttribute("data-color", "gray");
      expect(arrow).toHaveAttribute("data-depth-test", "true");
      expect(arrow).toHaveAttribute("data-depth-write", "true");
      expect(arrow).toHaveAttribute("data-render-order", "0");
    });
    const sphere = screen.getByTestId("bot-jog-z-sphere");
    expect(sphere).toHaveAttribute("data-depth-test", "true");
    expect(sphere).toHaveAttribute("data-depth-write", "true");
    expect(sphere).toHaveAttribute("data-render-order", "0");

    fireEvent.click(container.querySelector(
      "[name='bot-jog-z-control']",
    ) as Element);
    expect(onSelect).not.toHaveBeenCalled();
    sphereSpy.mockRestore();
    arrowSpy.mockRestore();
  });

  it.each([
    ["x", "-100,0,0", "100,0,0"],
    ["y", "0,-100,0", "0,100,0"],
    ["z", "0,0,-100", "0,0,100"],
  ] as const)(
    "renders device %s arrows in mirrored scene directions",
    (axis, positiveEnd, negativeEnd) => {
      const arrowSpy = jest.spyOn(controls, "ControlArrow")
        .mockImplementation(props => <i
          data-testid={props.name}
          data-end={props.end.join(",")} />);
      const config = clone(INITIAL);
      config.mirrorX = true;
      config.mirrorY = true;
      config.negativeZ = false;
      render(<NativeJogControlPair
        axis={axis}
        config={config}
        name={`bot-jog-${axis}`}
        onClose={jest.fn()}
        onSelect={jest.fn()}
        position={[0, 0, 0]}
        positionStore={createBotPositionSnapshotStore({
          x: 0,
          y: 0,
          z: 0,
        })} />);

      expect(screen.getByTestId(`bot-jog-${axis}-plus-arrow`))
        .toHaveAttribute("data-end", positiveEnd);
      expect(screen.getByTestId(`bot-jog-${axis}-minus-arrow`))
        .toHaveAttribute("data-end", negativeEnd);
      arrowSpy.mockRestore();
    },
  );
});

describe("<NativeJogControlPair />", () => {
  const config = clone(INITIAL);
  config.botSizeX = 3000;
  config.botSizeY = 1500;
  config.botSizeZ = 600;
  const position = { x: 1038, y: 234, z: -50 };

  const props = (axis: Xyz): NativeJogControlPairProps => ({
    axis,
    axisActions: {
      arduinoBusy: false,
      botPosition: position,
      botOnline: true,
      dispatch: jest.fn(),
      firmwareSettings: {
        ...clone(bot.hardware.mcu_params),
        movement_enable_endpoints_x: 1,
        movement_enable_endpoints_y: 1,
        movement_enable_endpoints_z: 1,
      },
      locked: false,
      stepSize: 100,
    },
    config,
    name: `bot-jog-${axis}`,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    position: [0, 0, 0],
    positionStore: createBotPositionSnapshotStore(position),
    selected: true,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ["x", { x: -100, y: 0, z: 0 }, { x: 100, y: 0, z: 0 }],
    ["y", { x: 0, y: -100, z: 0 }, { x: 0, y: 100, z: 0 }],
    ["z", { x: 0, y: 0, z: -100 }, { x: 0, y: 0, z: 100 }],
  ] as const)(
    "runs the selected %s home and jog commands",
    (axis, negative, positive) => {
      const moveRelative = jest.spyOn(deviceActions, "moveRelative")
        .mockImplementation(jest.fn());
      const moveToHome = jest.spyOn(deviceActions, "moveToHome")
        .mockImplementation(jest.fn());
      const findHome = jest.spyOn(deviceActions, "findHome")
        .mockImplementation(jest.fn());
      const p = props(axis);
      render(<NativeJogControlPair {...p} />);

      expect(screen.getByRole("heading", {
        name: `${axis.toUpperCase()}: ${Math.round(
          position[axis],
        ).toLocaleString()}`,
      })).toBeInTheDocument();
      expect(screen.getAllByRole("button", {
        name: /^(1|10|100|1000)$/,
      })).toHaveLength(4);
      fireEvent.click(screen.getByRole("button", {
        name: `Move Home ${axis.toUpperCase()}`,
      }));
      fireEvent.click(screen.getByRole("button", {
        name: `Find Home ${axis.toUpperCase()}`,
      }));
      const negativeButton = screen.getByRole("button", {
        name: `Jog -${axis.toUpperCase()}`,
      });
      const positiveButton = screen.getByRole("button", {
        name: `Jog +${axis.toUpperCase()}`,
      });
      expect(negativeButton).toHaveClass(
        `fa-arrow-${axis == "z" ? "down" : "left"}`,
      );
      expect(positiveButton).toHaveClass(
        `fa-arrow-${axis == "z" ? "up" : "right"}`,
      );
      fireEvent.click(negativeButton);
      fireEvent.click(positiveButton);

      expect(moveToHome).toHaveBeenCalledWith(axis);
      expect(findHome).toHaveBeenCalledWith(axis);
      expect(moveRelative).toHaveBeenNthCalledWith(1, negative);
      expect(moveRelative).toHaveBeenNthCalledWith(2, positive);
      expect(p.axisActions?.dispatch).toHaveBeenCalledWith(
        expect.any(Function),
      );
    },
  );

  it("uses the shared move amount selector", () => {
    const p = props("x");
    render(<NativeJogControlPair {...p} />);

    fireEvent.click(screen.getByRole("button", { name: "10" }));

    expect(p.axisActions?.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 10,
    });
  });

  it("moves to an entered axis coordinate and displays encoders", () => {
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.axisActions && (p.axisActions.botPosition = {
      x: 900,
      y: 800,
      z: -70,
    });
    p.encoderVisibility = { raw: true, scaled: true };
    p.encoderData = {
      scaled_encoders: { x: 1234.5, y: undefined, z: undefined },
      raw_encoders: { x: undefined, y: undefined, z: undefined },
    };
    const { container } = render(<NativeJogControlPair {...p} />);

    const input = screen.getByLabelText("X axis position");
    expect(container.querySelector("label[for='native-jog-x-target']"))
      .not.toBeInTheDocument();
    expect(input).not.toHaveAttribute("placeholder");
    expect(input).toHaveValue(900);
    fireEvent.change(input, { target: { value: "2048.5" } });
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(moveAbsolute).toHaveBeenCalledWith({
      x: 2048.5,
      y: 800,
      z: -70,
    });
    const scaled = screen.getByText("Scaled encoder position")
      .parentElement?.querySelector("output");
    const raw = screen.getByText("Raw encoder position")
      .parentElement?.querySelector("output");
    expect(scaled).toHaveTextContent("1,234.5");
    expect(raw).toHaveTextContent("---");

    fireEvent.change(input, { target: { value: "" } });
    expect(screen.getByRole("button", { name: "GO" })).toBeDisabled();
  });

  it("blocks absolute moves without a complete hardware position", () => {
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.axisActions && (p.axisActions.botPosition = {
      x: undefined,
      y: 234,
      z: -50,
    });
    render(<NativeJogControlPair {...p} />);

    expect(screen.getByRole("button", { name: "GO" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(moveAbsolute).not.toHaveBeenCalled();
  });

  it("shows encoder, homing, length, and settings options", () => {
    const scaledToggle = jest.fn();
    const rawToggle = jest.fn();
    const toggle = jest.spyOn(configActions, "toggleWebAppBool")
      .mockImplementation(setting => setting == "scaled_encoders"
        ? scaledToggle
        : rawToggle);
    const setHome = jest.spyOn(deviceActions, "setHome")
      .mockImplementation(jest.fn());
    const findAxisLength = jest.spyOn(deviceActions, "findAxisLength")
      .mockImplementation(jest.fn());
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.encoderVisibility = { raw: false, scaled: true };
    p.axisActions?.firmwareSettings &&
      (p.axisActions.firmwareSettings.encoder_enabled_x = 1);
    render(<NativeJogControlPair {...p} />);

    fireEvent.click(screen.getByTitle("More options"));
    expect(screen.getByRole("heading", { name: "More options" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByTitle("toggle scaled encoder display"));
    fireEvent.click(screen.getByTitle("toggle raw encoder display"));
    fireEvent.click(screen.getByRole("button", { name: "SET HOME" }));
    fireEvent.click(screen.getByRole("button", { name: "FIND LENGTH" }));
    fireEvent.click(screen.getByRole("button", { name: "SET LENGTH" }));
    const settings = screen.getByRole("link", { name: "Settings" });
    expect(settings).toHaveAttribute("href", Path.settings("axes"));
    fireEvent.click(settings);

    expect(toggle).toHaveBeenCalledWith("scaled_encoders");
    expect(toggle).toHaveBeenCalledWith("raw_encoders");
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith(scaledToggle);
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith(rawToggle);
    expect(setHome).toHaveBeenCalledWith("x");
    expect(findAxisLength).toHaveBeenCalledWith("x");
    expect(updateMCU).toHaveBeenCalledWith(
      "movement_axis_nr_steps_x",
      expect.any(String),
    );
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("axes"));

    fireEvent.click(screen.getByTitle("close"));
    expect(screen.getByRole("heading", { name: "X: 1,038" }))
      .toBeInTheDocument();
  });

  it.each([
    ["busy", { arduinoBusy: true }],
    ["offline", { botOnline: false }],
    ["locked", { locked: true }],
  ])("blocks movement while %s", (_status, update) => {
    const moveRelative = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const p = props("z");
    Object.assign(p.axisActions || {}, update);
    render(<NativeJogControlPair {...p} />);

    ["Move Home Z", "Find Home Z", "Jog -Z", "Jog +Z", "GO"]
      .forEach(name => expect(screen.getByRole("button", { name }))
        .toBeDisabled());
    fireEvent.click(screen.getByRole("button", { name: "Jog -Z" }));
    expect(moveRelative).not.toHaveBeenCalled();
  });

  it("disables homing and length discovery without axis tracking", () => {
    const p = props("y");
    if (p.axisActions) {
      p.axisActions.firmwareSettings.encoder_enabled_y = 0;
      p.axisActions.firmwareSettings.movement_enable_endpoints_y = 0;
    }
    render(<NativeJogControlPair {...p} />);

    expect(screen.getByRole("button", { name: "Find Home Y" }))
      .toBeDisabled();
    fireEvent.click(screen.getByTitle("More options"));
    expect(screen.getByRole("button", { name: "FIND LENGTH" }))
      .toBeDisabled();
  });

  it("uses one clickable object to open the popup", () => {
    const p = props("y");
    p.selected = false;
    const { container } = render(<NativeJogControlPair {...p} />);

    expect(container.querySelector("[name='bot-jog-y-center']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='bot-jog-y-positive']"))
      .not.toBeInTheDocument();
    expect(container.querySelector("[name='bot-jog-y-negative']"))
      .not.toBeInTheDocument();
    fireEvent.click(container.querySelector(
      "[name='bot-jog-y-control']",
    ) as Element);

    expect(p.onSelect).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
