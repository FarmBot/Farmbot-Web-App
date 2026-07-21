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
import {
  getNativeJogControlPositions, getNativeJogDevicePosition,
  getNativeJogRenderDirection,
  NativeJogControlPair, NativeJogControlPairProps,
  NATIVE_JOG_ARROW_LENGTH,
} from "../native_jog_controls";

describe("native jog control geometry", () => {
  it("positions each pair in its requested kinematic frame", () => {
    const config = clone(INITIAL);
    config.bedWidthOuter = 1360;
    config.bedYOffset = 20;

    expect(getNativeJogControlPositions(config)).toEqual({
      x: [[0, -220, 0], [0, 1540, 0]],
      y: [0, 0, 200],
      z: [100, 0, 300],
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

  it("renders two 100mm gray arrows around one sphere", () => {
    const arrowSpy = jest.spyOn(controls, "ControlArrow")
      .mockImplementation(props => <i
        data-testid={props.name}
        data-color={props.color}
        data-end={props.end.join(",")} />);
    const config = clone(INITIAL);
    const positionStore = createBotPositionSnapshotStore({
      x: 100,
      y: 200,
      z: -300,
    });
    const { container } = render(<NativeJogControlPair
      axis={"z"}
      config={config}
      name={"bot-jog-z"}
      onClose={jest.fn()}
      onSelect={jest.fn()}
      position={[100, 0, 300]}
      positionStore={positionStore} />);

    expect(container.querySelectorAll("[name='bot-jog-z-sphere']"))
      .toHaveLength(1);
    expect(screen.getByTestId("bot-jog-z-plus-arrow"))
      .toHaveAttribute("data-end", `0,0,${NATIVE_JOG_ARROW_LENGTH}`);
    expect(screen.getByTestId("bot-jog-z-minus-arrow"))
      .toHaveAttribute("data-end", `0,0,-${NATIVE_JOG_ARROW_LENGTH}`);
    expect(screen.getAllByTestId(/bot-jog-z-.*-arrow/))
      .toHaveLength(2);
    screen.getAllByTestId(/bot-jog-z-.*-arrow/).forEach(arrow =>
      expect(arrow).toHaveAttribute("data-color", "gray"));
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
      firmwareSettings: clone(bot.hardware.mcu_params),
      locked: false,
    },
    config,
    name: `bot-jog-${axis}`,
    onClose: jest.fn(),
    onSelect: jest.fn(),
    onSelectAxisActions: jest.fn(),
    position: [0, 0, 0],
    positionStore: createBotPositionSnapshotStore(position),
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it.each([
    ["x", { x: 1, y: 0, z: 0 }, { x: 3000, y: 234, z: -50 }],
    ["y", { x: 0, y: 1, z: 0 }, { x: 1038, y: 1500, z: -50 }],
    ["z", { x: 0, y: 0, z: 1 }, { x: 1038, y: 234, z: 600 }],
  ] as const)(
    "sends positive %s jog and Max commands",
    (axis, relative, maximum) => {
      const moveRelative = jest.spyOn(deviceActions, "moveRelative")
        .mockImplementation(jest.fn());
      const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
        .mockImplementation(jest.fn());
      const p = props(axis);
      p.selectedDirection = 1;
      render(<NativeJogControlPair {...p} />);

      expect(screen.getByRole("heading", {
        name: `${axis.toUpperCase()}: ${Math.round(
          position[axis],
        ).toLocaleString()}`,
      })).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", { name: "+1" }));
      fireEvent.click(screen.getByRole("button", { name: "Max" }));
      fireEvent.click(screen.getByTitle("close"));

      expect(moveRelative).toHaveBeenCalledWith(relative);
      expect(moveAbsolute).toHaveBeenCalledWith(maximum);
      expect(p.onClose).toHaveBeenCalled();
    },
  );

  it("sends negative jog and Home commands", () => {
    const moveRelative = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const moveToHome = jest.spyOn(deviceActions, "moveToHome")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.selectedDirection = -1;
    render(<NativeJogControlPair {...p} />);

    fireEvent.click(screen.getByRole("button", { name: "Home" }));
    fireEvent.click(screen.getByRole("button", { name: "-10" }));

    expect(moveToHome).toHaveBeenCalledWith("x");
    expect(moveRelative).toHaveBeenCalledWith({ x: -10, y: 0, z: 0 });
  });

  it("moves to an entered axis coordinate and displays encoders", () => {
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.selectedDirection = 1;
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
    render(<NativeJogControlPair {...p} />);

    const input = screen.getByLabelText("X axis position");
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
    p.selectedDirection = 1;
    p.axisActions && (p.axisActions.botPosition = {
      x: undefined,
      y: 234,
      z: -50,
    });
    render(<NativeJogControlPair {...p} />);

    expect(screen.getByRole("button", { name: "Max" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "GO" })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Max" }));
    fireEvent.click(screen.getByRole("button", { name: "GO" }));
    expect(moveAbsolute).not.toHaveBeenCalled();
  });

  it("configures encoder displays from the cog popup", () => {
    const scaledToggle = jest.fn();
    const rawToggle = jest.fn();
    const toggle = jest.spyOn(configActions, "toggleWebAppBool")
      .mockImplementation(setting => setting == "scaled_encoders"
        ? scaledToggle
        : rawToggle);
    const p = props("y");
    p.encoderVisibility = { raw: false, scaled: true };
    p.selectedDirection = 1;
    render(<NativeJogControlPair {...p} />);

    fireEvent.click(screen.getByTitle("encoder display settings"));
    expect(screen.getByRole("heading", { name: "Encoder display" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByTitle("toggle scaled encoder display"));
    fireEvent.click(screen.getByTitle("toggle raw encoder display"));
    expect(toggle).toHaveBeenCalledWith("scaled_encoders");
    expect(toggle).toHaveBeenCalledWith("raw_encoders");
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith(scaledToggle);
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith(rawToggle);

    fireEvent.click(screen.getByTitle("close"));
    expect(screen.getByRole("heading", { name: "Y: 234" }))
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
    p.selectedDirection = -1;
    const { container } = render(<NativeJogControlPair {...p} />);

    fireEvent.click(container.querySelector(
      "[name='bot-jog-z-negative']",
    ) as Element);
    expect(p.onSelect).not.toHaveBeenCalled();
    screen.getAllByRole("button").forEach(button => {
      if (button.title != "encoder display settings" &&
        button.title != "close") {
        expect(button).toBeDisabled();
      }
    });
    fireEvent.click(screen.getByRole("button", { name: "-1" }));
    expect(moveRelative).not.toHaveBeenCalled();
  });

  it("shows all axis actions in the sphere popup", () => {
    const moveToHome = jest.spyOn(deviceActions, "moveToHome")
      .mockImplementation(jest.fn());
    const findHome = jest.spyOn(deviceActions, "findHome")
      .mockImplementation(jest.fn());
    const setHome = jest.spyOn(deviceActions, "setHome")
      .mockImplementation(jest.fn());
    const findAxisLength = jest.spyOn(deviceActions, "findAxisLength")
      .mockImplementation(jest.fn());
    const updateMCU = jest.spyOn(deviceActions, "updateMCU")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.axisActionsSelected = true;
    p.axisActions?.firmwareSettings &&
      (p.axisActions.firmwareSettings.encoder_enabled_x = 1);
    render(<NativeJogControlPair {...p} />);

    expect(screen.getByRole("heading", { name: "X AXIS" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "MOVE TO HOME" }));
    fireEvent.click(screen.getByRole("button", { name: "FIND HOME" }));
    fireEvent.click(screen.getByRole("button", { name: "SET HOME" }));
    fireEvent.click(screen.getByRole("button", { name: "FIND LENGTH" }));
    fireEvent.click(screen.getByRole("button", { name: "SET LENGTH" }));
    fireEvent.click(screen.getByText("Settings"));

    expect(moveToHome).toHaveBeenCalledWith("x");
    expect(findHome).toHaveBeenCalledWith("x");
    expect(setHome).toHaveBeenCalledWith("x");
    expect(findAxisLength).toHaveBeenCalledWith("x");
    expect(updateMCU).toHaveBeenCalledWith(
      "movement_axis_nr_steps_x",
      expect.any(String),
    );
    expect(mockNavigate).toHaveBeenCalledWith(Path.settings("axes"));
  });

  it("selects the sphere action popup", () => {
    const p = props("y");
    const { container } = render(<NativeJogControlPair {...p} />);

    fireEvent.click(container.querySelector(
      "[name='bot-jog-y-center']",
    ) as Element);

    expect(p.onSelectAxisActions).toHaveBeenCalled();
  });

  it("opens the selected arrow popup", () => {
    const p = props("y");
    const { container } = render(<NativeJogControlPair {...p} />);

    fireEvent.click(container.querySelector(
      "[name='bot-jog-y-negative']",
    ) as Element);
    fireEvent.click(container.querySelector(
      "[name='bot-jog-y-positive']",
    ) as Element);

    expect(p.onSelect).toHaveBeenNthCalledWith(1, -1);
    expect(p.onSelect).toHaveBeenNthCalledWith(2, 1);
    expect(screen.queryByRole("heading")).not.toBeInTheDocument();
  });
});
