import React from "react";
import {
  act, fireEvent, render, screen,
} from "@testing-library/react";
import { clone } from "lodash";
import { Xyz } from "farmbot";
import { Vector3 } from "three";
import { INITIAL } from "../../config";
import * as controls from "../../controls";
import * as deviceActions from "../../../devices/actions";
import * as configActions from "../../../config_storage/actions";
import { createBotPositionSnapshotStore } from "../position_spring";
import { bot } from "../../../__test_support__/fake_state/bot";
import { Path } from "../../../internal_urls";
import { Actions } from "../../../constants";
import {
  clampNativeJogDragDistance,
  getNativeJogAbsoluteDestination, getNativeJogControlPositions,
  getNativeJogDevicePosition,
  getNativeJogDragDistance, getNativeJogDragPreviewPositions,
  getNativeJogRenderDirection, getNativeJogStepSize,
  nativeJogDirectionDisabled, nativeJogMaxPosition,
  NativeJogControlPair, NativeJogControlPairProps, NativeJogDragPreview,
  NativeJogPreviewState, NativeJogWorldPreview,
  NATIVE_JOG_ARROW_LENGTH,
  NATIVE_JOG_DRAG_SNAP_THRESHOLD,
  NATIVE_JOG_GUIDE_COLOR,
  NATIVE_JOG_STEP_CHOICES,
  NATIVE_JOG_Y_ARROW_LENGTH,
} from "../native_jog_controls";
import { ControlDragEvent, ControlPoint } from "../../controls";
import { SECTION_CONTROL_ACTIVE_COLOR } from "../../section_controls";

describe("native jog control geometry", () => {
  it("positions each control in its requested kinematic frame", () => {
    const config = clone(INITIAL);
    config.bedWidthOuter = 1360;
    config.bedYOffset = 20;

    expect(getNativeJogControlPositions(config)).toEqual({
      x: [[0, -120, 0], [0, 1440, 0]],
      y: [-26.5, 0, 103],
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

  it("builds absolute destinations from authoritative coordinates", () => {
    expect(getNativeJogAbsoluteDestination(
      { x: undefined, y: 200, z: -300 },
      "x",
      100,
    )).toEqual({ x: 100, y: 200, z: -300 });
    expect(getNativeJogAbsoluteDestination(
      { x: 10, y: undefined, z: 30 },
      "x",
      100,
    )).toBeUndefined();
    expect(getNativeJogAbsoluteDestination(
      { x: 10, y: 20, z: 30 },
      "z",
      -300,
    )).toEqual({ x: 10, y: 20, z: -300 });
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

  it("accepts preset and custom 3D move amounts", () => {
    expect(getNativeJogStepSize(1)).toEqual(1);
    expect(getNativeJogStepSize(1000)).toEqual(1000);
    expect(getNativeJogStepSize(25)).toEqual(25);
    expect(getNativeJogStepSize(Infinity)).toEqual(100);
    expect(getNativeJogStepSize(undefined)).toEqual(100);
  });

  it.each([
    ["x", [-125.6, 0, 0], 126],
    ["y", [0, -75.4, 0], 75],
    ["z", [0, 0, -42.2], 42],
  ] as const)(
    "converts mirrored scene %s dragging to device millimeters",
    (axis, delta, expected) => {
      const config = clone(INITIAL);
      config.mirrorX = true;
      config.mirrorY = true;
      config.negativeZ = false;
      expect(getNativeJogDragDistance(config, axis, [...delta]))
        .toEqual(expected);
    },
  );

  it("snaps drag distances within five millimeters", () => {
    const config = clone(INITIAL);
    config.mirrorX = false;
    expect(getNativeJogDragDistance(
      config,
      "x",
      [NATIVE_JOG_DRAG_SNAP_THRESHOLD, 0, 0],
    )).toEqual(0);
    expect(getNativeJogDragDistance(
      config,
      "x",
      [-NATIVE_JOG_DRAG_SNAP_THRESHOLD, 0, 0],
    )).toEqual(0);
    expect(getNativeJogDragDistance(config, "x", [6, 0, 0])).toEqual(6);
    expect(getNativeJogDragDistance(config, "x", [-6, 0, 0])).toEqual(-6);
  });

  it.each([
    ["x", [0, -120, 0], 126, [126, 0, 0], [0, 50, 0], [126, 0, 100]],
    ["x", [0, 1440, 0], -50, [-50, 0, 0], [0, -50, 0], [-50, 0, 100]],
    ["y", [0, 0, 0], 75, [0, 75, 0], [0, 0, -50], [0, 75, 100]],
    ["z", [0, 0, 0], 42, [0, 0, 42], [-50, 0, 0], [100, 0, 42]],
  ] as const)(
    "positions the %s dragged control, marker, and label",
    (axis, position, distance, control, marker, label) => {
      const config = clone(INITIAL);
      config.bedWidthOuter = 1360;
      config.bedYOffset = 20;
      expect(getNativeJogDragPreviewPositions(
        config,
        axis,
        [...position],
        distance,
      )).toEqual({ control, marker, label });
    },
  );

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
    ["y", `0,-${NATIVE_JOG_Y_ARROW_LENGTH},0`,
      `0,${NATIVE_JOG_Y_ARROW_LENGTH},0`],
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
        movement_axis_nr_steps_x: 3000,
        movement_axis_nr_steps_y: 1500,
        movement_axis_nr_steps_z: 600,
        movement_step_per_mm_x: 1,
        movement_step_per_mm_y: 1,
        movement_step_per_mm_z: 1,
      },
      locked: false,
      stepSize: 100,
    },
    config,
    name: `bot-jog-${axis}`,
    navigate: jest.fn(),
    onClose: jest.fn(),
    onSelect: jest.fn(),
    position: [0, 0, 0],
    positionStore: createBotPositionSnapshotStore(position),
    selected: true,
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("clamps drag distance to positive and negative axis bounds", () => {
    const p = props("x");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    expect(clampNativeJogDragDistance(
      p.config,
      p.axisActions,
      "x",
      5000,
    )).toEqual({ distance: 1962, boundDirection: 1 });
    expect(clampNativeJogDragDistance(
      p.config,
      p.axisActions,
      "x",
      -5000,
    )).toEqual({ distance: -1038, boundDirection: -1 });

    p.axisActions.botPosition = { ...position, x: undefined };
    expect(clampNativeJogDragDistance(
      p.config,
      p.axisActions,
      "x",
      5000,
    )).toEqual({ distance: 5000 });
  });

  it("previews and runs a custom relative move by dragging", () => {
    let handleProps: controls.ControlHandleProps | undefined;
    jest.spyOn(controls, "ControlHandle").mockImplementation(controlProps => {
      handleProps = controlProps;
      return <div data-testid={controlProps.name}>
        {typeof controlProps.children == "function"
          ? controlProps.children({
            hovered: false,
            pressed: true,
            dragging: true,
          })
          : controlProps.children}
      </div>;
    });
    jest.spyOn(controls, "ControlSphere").mockImplementation(sphereProps =>
      <i
        data-testid={sphereProps.name}
        data-color={sphereProps.color}
        data-position={sphereProps.position?.join(",")} />);
    jest.spyOn(controls, "ControlLabel").mockImplementation(labelProps =>
      <i
        data-testid={labelProps.name}
        data-position={labelProps.position?.join(",")}>
        {labelProps.children}
      </i>);
    jest.spyOn(controls, "ControlArrow").mockImplementation(arrowProps =>
      <i
        data-testid={arrowProps.name}
        data-color={arrowProps.color} />);
    const moveRelative = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const p = props("x");
    p.config = clone(config);
    p.config.mirrorX = true;
    p.position = [0, -120, 0];
    p.positionStore = createBotPositionSnapshotStore({
      x: 1962,
      y: 234,
      z: -50,
    });
    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.botPosition = { ...position, x: undefined };
    p.ghost = <i data-testid={"mounted-tool-ghost"} />;
    p.selected = false;
    const view = render(<NativeJogControlPair {...p} />);
    const dragEvent = {
      delta: new Vector3(-125.6, 0, 0),
      dragged: true,
    } as ControlDragEvent;
    const constraintEvent = {
      point: new Vector3(10, 20, 30),
    } as ControlDragEvent["event"];

    expect(typeof handleProps?.constraint).toEqual("function");
    expect((handleProps?.constraint as Function)(constraintEvent))
      .toEqual({
        kind: "axis",
        origin: [10, 20, 30],
        direction: [1, 0, 0],
      });
    act(() => handleProps?.onDragStart?.(dragEvent));
    const realPointerDragEvent = { ...dragEvent, dragged: false };
    act(() => handleProps?.onDrag?.(realPointerDragEvent));
    expect(document.querySelector("[name='bot-jog-x-drag-control']"))
      .toHaveAttribute("position", "-126,0,0");
    expect(screen.getByTestId("bot-jog-x-current-position-marker"))
      .toHaveAttribute("data-position", "0,50,0");
    act(() => handleProps?.onDragCancel?.());
    expect(screen.queryByTestId("bot-jog-x-current-position-marker"))
      .not.toBeInTheDocument();
    act(() => handleProps?.onDrag?.(dragEvent));
    expect(document.querySelector("[name='bot-jog-x-drag-control']"))
      .toHaveAttribute("position", "-126,0,0");
    expect(screen.getByTestId("bot-jog-x-current-position-marker"))
      .toHaveAttribute("data-position", "0,50,0");
    expect(screen.getByTestId("bot-jog-x-drag-label"))
      .toHaveAttribute("data-position", "-126,0,100");
    expect(screen.getByTestId("bot-jog-x-drag-label"))
      .toHaveTextContent("126mm");
    expect(document.querySelector("[name='bot-jog-x-ghost']"))
      .toHaveAttribute("position", "-126,0,0");
    expect(screen.getByTestId("mounted-tool-ghost"))
      .toBeInTheDocument();
    act(() => handleProps?.onDrag?.({
      ...dragEvent,
      delta: new Vector3(-5000, 0, 0),
    }));
    expect(screen.getByTestId("bot-jog-x-plus-arrow"))
      .toHaveAttribute("data-color", "red");
    expect(screen.getByTestId("bot-jog-x-minus-arrow"))
      .toHaveAttribute("data-color", "gray");
    expect(document.querySelector("[name='bot-jog-x-drag-control']"))
      .toHaveAttribute("position", "-1962,0,0");
    act(() => handleProps?.onDrag?.(dragEvent));

    const snappedEvent = {
      ...dragEvent,
      delta: new Vector3(-5, 0, 0),
      dragged: false,
    };
    act(() => handleProps?.onDrag?.(snappedEvent));
    expect(document.querySelector("[name='bot-jog-x-drag-control']"))
      .toHaveAttribute("position", "0,0,0");
    expect(screen.getByTestId("bot-jog-x-sphere"))
      .toHaveAttribute("data-color", SECTION_CONTROL_ACTIVE_COLOR);
    expect(screen.getByTestId("bot-jog-x-current-position-marker"))
      .toHaveAttribute("data-color", SECTION_CONTROL_ACTIVE_COLOR);
    expect(screen.getByTestId("bot-jog-x-drag-label"))
      .toHaveTextContent("0mm");
    act(() => handleProps?.onDragEnd?.(snappedEvent));
    expect(moveRelative).not.toHaveBeenCalled();
    act(() => handleProps?.onDrag?.(dragEvent));

    act(() => handleProps?.onDragEnd?.(realPointerDragEvent));

    expect(moveRelative).toHaveBeenCalledWith(
      { x: 126, y: 0, z: 0 },
      expect.any(Function),
    );
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith(
      expect.any(Function),
    );
    expect(screen.getByTestId("bot-jog-x-current-position-marker"))
      .toBeInTheDocument();
    expect(document.querySelector("[name='bot-jog-x-drag-control']"))
      .toHaveAttribute("position", "-126,0,0");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.botPosition = { ...position, x: 1164 };
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.queryByTestId("bot-jog-x-current-position-marker"))
      .not.toBeInTheDocument();
    expect(p.onSelect).not.toHaveBeenCalled();
  });

  it("immediately resets a retained target when movement is canceled", () => {
    let handleProps: controls.ControlHandleProps | undefined;
    jest.spyOn(controls, "ControlHandle").mockImplementation(controlProps => {
      handleProps = controlProps;
      return <div>
        {typeof controlProps.children == "function"
          ? controlProps.children({
            hovered: false,
            pressed: true,
            dragging: true,
          })
          : controlProps.children}
      </div>;
    });
    jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const p = props("y");
    p.ghost = <i data-testid={"retained-ghost"} />;
    const view = render(<NativeJogControlPair {...p} />);
    const event = {
      delta: new Vector3(0, 100, 0),
      dragged: true,
    } as ControlDragEvent;

    act(() => handleProps?.onDragStart?.(event));
    act(() => handleProps?.onDrag?.(event));
    act(() => handleProps?.onDragEnd?.(event));
    expect(screen.getByTestId("retained-ghost")).toBeInTheDocument();

    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.arduinoBusy = true;
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.getByTestId("retained-ghost")).toBeInTheDocument();
    p.axisActions.arduinoBusy = false;
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.queryByTestId("retained-ghost"))
      .not.toBeInTheDocument();

    act(() => handleProps?.onDragStart?.(event));
    act(() => handleProps?.onDrag?.(event));
    act(() => handleProps?.onDragEnd?.(event));
    expect(screen.getByTestId("retained-ghost")).toBeInTheDocument();
    p.axisActions.locked = true;
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.queryByTestId("retained-ghost"))
      .not.toBeInTheDocument();
  });

  it("resets a retained target when the movement command fails", () => {
    let handleProps: controls.ControlHandleProps | undefined;
    let onError: (() => void) | undefined;
    jest.spyOn(controls, "ControlHandle").mockImplementation(controlProps => {
      handleProps = controlProps;
      return <div>
        {typeof controlProps.children == "function"
          ? controlProps.children({
            hovered: false,
            pressed: true,
            dragging: true,
          })
          : controlProps.children}
      </div>;
    });
    jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation((_move, failure) => {
        onError = failure;
        return Promise.resolve();
      });
    const p = props("y");
    p.ghost = <i data-testid={"failed-move-ghost"} />;
    render(<NativeJogControlPair {...p} />);
    const event = {
      delta: new Vector3(0, 100, 0),
      dragged: true,
    } as ControlDragEvent;

    act(() => handleProps?.onDragStart?.(event));
    act(() => handleProps?.onDrag?.(event));
    act(() => handleProps?.onDragEnd?.(event));
    expect(screen.getByTestId("failed-move-ghost")).toBeInTheDocument();
    expect(onError).toEqual(expect.any(Function));

    act(() => onError?.());

    expect(screen.queryByTestId("failed-move-ghost"))
      .not.toBeInTheDocument();
    expect(handleProps?.constraint).toEqual(expect.any(Function));
  });

  it("moves shared X controls and retains one world-space target", () => {
    const handles: Record<string, controls.ControlHandleProps> = {};
    jest.spyOn(controls, "ControlHandle").mockImplementation(controlProps => {
      handles[controlProps.name] = controlProps;
      return <div>
        {typeof controlProps.children == "function"
          ? controlProps.children({
            hovered: false,
            pressed: true,
            dragging: true,
          })
          : controlProps.children}
      </div>;
    });
    jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const near = props("x");
    near.name = "bot-jog-x-near";
    near.position = [0, -120, 0];
    near.selected = false;
    near.config = { ...near.config, mirrorX: false };
    const far = {
      ...near,
      name: "bot-jog-x-far",
      position: [0, 1440, 0] as ControlPoint,
    };
    const SharedControls = () => {
      const [preview, setPreview] =
        React.useState<NativeJogDragPreview | undefined>();
      const previewState: NativeJogPreviewState = {
        preview,
        setPreview,
        world: () => ({
          controlPositions: [[1, 2, 3], [4, 5, 6]],
          utmPosition: [10, 20, 30],
        }),
      };
      return <>
        <NativeJogControlPair
          {...near}
          previewState={previewState} />
        <NativeJogControlPair
          {...far}
          managePreviewLifecycle={false}
          previewState={previewState} />
        {preview && <NativeJogWorldPreview
          axis={"x"}
          config={near.config}
          name={"bot-jog-x"}
          preview={preview} />}
      </>;
    };
    const { container } = render(<SharedControls />);
    const event = {
      delta: new Vector3(100, 0, 0),
      dragged: true,
    } as ControlDragEvent;

    act(() => handles["bot-jog-x-near-control"].onDragStart?.(event));
    act(() => handles["bot-jog-x-near-control"].onDrag?.(event));
    expect(container.querySelector(
      "[name='bot-jog-x-near-drag-control']",
    )).toHaveAttribute("position", "100,0,0");
    expect(container.querySelector(
      "[name='bot-jog-x-far-drag-control']",
    )).toHaveAttribute("position", "100,0,0");
    expect(container.querySelectorAll(
      "[name='bot-jog-x-ghost']",
    )).toHaveLength(1);
    expect(container.querySelector(
      "[name='bot-jog-x-world-control-0']",
    )).not.toBeInTheDocument();

    act(() => handles["bot-jog-x-near-control"].onDragEnd?.(event));
    expect(container.querySelector(
      "[name='bot-jog-x-world-control-0']",
    )).toHaveAttribute("position", "101,2,3");
    expect(container.querySelector(
      "[name='bot-jog-x-world-control-1']",
    )).toHaveAttribute("position", "104,5,6");
    expect(container.querySelector(
      "[name='bot-jog-x-ghost']",
    )).toHaveAttribute("position", "110,20,30");
    expect(container.querySelector(".line"))
      .toHaveTextContent("native-jog-x-guide-line");
    expect(NATIVE_JOG_GUIDE_COLOR).toEqual("orange");
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
        name: `${axis.toUpperCase()}: ${Math.round(position[axis])}`,
      })).toBeInTheDocument();
      expect(screen.getAllByRole("button", {
        name: /^(1|10|100|1000)$/,
      })).toHaveLength(4);
      fireEvent.click(screen.getByRole("button", {
        name: `Move Home ${axis.toUpperCase()}`,
      }));
      expect(screen.getByRole("button", {
        name: `Move Home ${axis.toUpperCase()}`,
      }).querySelector(
        `.fa-arrow-${axis == "z" ? "up" : "left"}`,
      )).toBeInTheDocument();
      fireEvent.click(screen.getByRole("button", {
        name: `Find Home ${axis.toUpperCase()}`,
      }));
      const negativeButton = screen.getByRole("button", {
        name: `Jog -${axis.toUpperCase()}`,
      });
      const positiveButton = screen.getByRole("button", {
        name: `Jog +${axis.toUpperCase()}`,
      });
      const controlGrid = negativeButton.closest(
        ".native-jog-control-grid",
      );
      expect(controlGrid).toContainElement(positiveButton);
      expect(controlGrid).toContainElement(screen.getByRole("button", {
        name: "1",
      }));
      const selector = screen.getByRole("button", {
        name: "1",
      }).closest(".native-jog-step-selector");
      expect(selector).toContainElement(screen.getByRole("button", {
        name: "1000",
      }));
      expect(negativeButton).toHaveClass("native-jog-negative-button");
      expect(positiveButton).toHaveClass("native-jog-positive-button");
      const absoluteInput = screen.getByLabelText(
        `${axis.toUpperCase()} axis position`,
      );
      expect(controlGrid).toContainElement(absoluteInput);
      expect(controlGrid).toContainElement(screen.getByRole("button", {
        name: "GO",
      }));
      expect(screen.getByRole("button", {
        name: `Move Home ${axis.toUpperCase()}`,
      })).toHaveClass("native-jog-home-button");
      expect(screen.getByRole("button", {
        name: `Find Home ${axis.toUpperCase()}`,
      })).toHaveClass("native-jog-find-home-button");
      const limitButtonName = axis == "z"
        ? "Move to Safe Height"
        : `Move to Max ${axis.toUpperCase()}`;
      expect(screen.getByRole("button", {
        name: limitButtonName,
      })).toHaveClass("native-jog-limit-button");
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

  it("runs axis-specific commands with partial telemetry", () => {
    const moveRelative = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(jest.fn());
    const moveToHome = jest.spyOn(deviceActions, "moveToHome")
      .mockImplementation(jest.fn());
    const findHome = jest.spyOn(deviceActions, "findHome")
      .mockImplementation(jest.fn());
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const p = props("x");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.botPosition = {
      x: undefined,
      y: 234,
      z: -50,
    };
    render(<NativeJogControlPair {...p} />);

    const moveHome = screen.getByRole("button", { name: "Move Home X" });
    const findAxisHome = screen.getByRole("button", { name: "Find Home X" });
    const jog = screen.getByRole("button", { name: "Jog +X" });
    expect(moveHome).toBeEnabled();
    expect(findAxisHome).toBeEnabled();
    expect(jog).toBeEnabled();
    fireEvent.click(moveHome);
    fireEvent.click(findAxisHome);
    fireEvent.click(jog);

    expect(moveToHome).toHaveBeenCalledWith("x");
    expect(findHome).toHaveBeenCalledWith("x");
    expect(moveRelative).toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });
    expect(screen.getByRole("button", { name: "GO" })).toBeDisabled();
    const max = screen.getByRole("button", { name: "Move to Max X" });
    expect(max).toBeEnabled();
    fireEvent.click(max);
    expect(moveAbsolute).toHaveBeenCalledWith({
      x: 3000,
      y: 234,
      z: -50,
    });
  });

  it("uses preset move amounts without a custom amount input", () => {
    const p = props("x");
    render(<NativeJogControlPair {...p} />);

    fireEvent.click(screen.getByRole("button", { name: "10" }));
    expect(p.axisActions?.dispatch).toHaveBeenCalledWith({
      type: Actions.CHANGE_STEP_SIZE,
      payload: 10,
    });
    expect(screen.queryByLabelText("Custom move amount"))
      .not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "1" }))
      .toHaveClass("leftmost");
    expect(screen.getByRole("button", { name: "1000" }))
      .toHaveClass("rightmost");
    fireEvent.click(screen.getByRole("button", { name: "100" }));
    expect(screen.getByRole("button", { name: "100" }))
      .toHaveClass("move-amount-selected");
  });

  it("disables jog directions at configured axis ends", () => {
    const p = props("x");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.botPosition = { x: 0, y: 234, z: -50 };
    p.axisActions.firmwareSettings.movement_stop_at_home_x = 0;
    p.axisActions.firmwareSettings.movement_home_up_x = 0;
    const view = render(<NativeJogControlPair {...p} />);

    expect(nativeJogDirectionDisabled(p.axisActions, "x", -1)).toBeTruthy();
    expect(screen.getByRole("button", { name: "Move Home X" }))
      .toBeDisabled();
    expect(screen.getByRole("button", { name: "Jog -X" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Jog +X" })).toBeEnabled();

    p.axisActions.botPosition = { x: 3000, y: 234, z: -50 };
    p.axisActions.firmwareSettings.movement_stop_at_max_x = 0;
    view.rerender(<NativeJogControlPair {...p} />);
    expect(nativeJogMaxPosition(
      p.axisActions,
      "x",
      p.config.botSizeX,
    )).toEqual(3000);
    expect(screen.getByRole("button", { name: "Jog +X" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move to Max X" }))
      .toBeDisabled();

    view.unmount();
    const zProps = props("z");
    if (!zProps.axisActions) { throw new Error("axis actions required"); }
    zProps.axisActions.botPosition = { x: 1038, y: 234, z: 0 };
    zProps.axisActions.firmwareSettings.movement_stop_at_home_z = 0;
    zProps.axisActions.firmwareSettings.movement_home_up_z = 1;
    render(<NativeJogControlPair {...zProps} />);
    expect(nativeJogMaxPosition(
      zProps.axisActions,
      "z",
      zProps.config.botSizeZ,
    )).toEqual(-600);
    expect(screen.getByRole("button", { name: "Jog +Z" })).toBeDisabled();
  });

  it("uses the rendered position and configured length for bounds", () => {
    const p = props("x");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    p.axisActions.botPosition = { x: undefined, y: 234, z: -50 };
    p.positionStore = createBotPositionSnapshotStore({
      x: 0,
      y: 234,
      z: -50,
    });
    p.axisActions.firmwareSettings.movement_axis_nr_steps_x = 0;
    const view = render(<NativeJogControlPair {...p} />);

    expect(screen.getByRole("button", { name: "Move Home X" }))
      .toBeDisabled();
    expect(screen.getByRole("button", { name: "Jog -X" }))
      .toBeDisabled();

    p.axisActions.botPosition = { x: 3000, y: 234, z: -50 };
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.getByRole("button", { name: "Jog +X" }))
      .toBeDisabled();
  });

  it("moves X to max and Z to safe height", () => {
    const moveAbsolute = jest.spyOn(deviceActions, "moveAbsolute")
      .mockImplementation(jest.fn());
    const xProps = props("x");
    if (!xProps.axisActions) { throw new Error("axis actions required"); }
    xProps.axisActions.firmwareSettings.movement_axis_nr_steps_x = 0;
    const view = render(<NativeJogControlPair {...xProps} />);
    const max = screen.getByRole("button", { name: "Move to Max X" });
    expect(max).toHaveClass("fa-arrow-right");
    fireEvent.click(max);
    expect(moveAbsolute).toHaveBeenCalledWith({
      x: 3000,
      y: 234,
      z: -50,
    });

    view.unmount();
    const zProps = props("z");
    zProps.config.safeHeight = -100;
    const zView = render(<NativeJogControlPair {...zProps} />);
    const safe = screen.getByRole("button", { name: "Move to Safe Height" });
    expect(safe).toHaveClass("fa-arrow-down");
    fireEvent.click(safe);
    expect(moveAbsolute).toHaveBeenLastCalledWith({
      x: 1038,
      y: 234,
      z: -100,
    });
    if (!zProps.axisActions) { throw new Error("axis actions required"); }
    zProps.axisActions.botPosition = { ...position, z: -150 };
    zView.rerender(<NativeJogControlPair {...zProps} />);
    expect(screen.getByRole("button", { name: "Move to Safe Height" }))
      .toHaveClass("fa-arrow-up");
    zProps.axisActions.botPosition = { ...position, z: -100 };
    zView.rerender(<NativeJogControlPair {...zProps} />);
    expect(screen.getByRole("button", { name: "Move to Safe Height" }))
      .toHaveClass("fa-minus");
  });

  it("shows movement progress and disables controls while busy", () => {
    const moveRelative = jest.spyOn(deviceActions, "moveRelative")
      .mockImplementation(() => new Promise(() => undefined));
    const p = props("x");
    if (!p.axisActions) { throw new Error("axis actions required"); }
    const view = render(<NativeJogControlPair {...p} />);
    expect(document.querySelectorAll(
      ".native-jog-progress-button > i:not([class])",
    )).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Jog +X" }));

    p.axisActions.arduinoBusy = true;
    p.axisActions.botPosition = { x: 1088, y: 234, z: -50 };
    p.axisActions.movementState = {
      start: position,
      distance: { x: 100, y: 0, z: 0 },
    };
    view.rerender(<NativeJogControlPair {...p} />);

    const positive = screen.getByRole("button", { name: "Jog +X" });
    expect(positive).toBeDisabled();
    expect(positive.querySelector(".movement-progress"))
      .toHaveStyle({ width: "50%" });
    expect(screen.getByRole("button", { name: "Move Home X" }))
      .toBeDisabled();
    expect(moveRelative).toHaveBeenCalledWith({ x: 100, y: 0, z: 0 });

    p.axisActions.arduinoBusy = false;
    view.rerender(<NativeJogControlPair {...p} />);
    p.axisActions.arduinoBusy = true;
    p.axisActions.movementState = {
      start: position,
      distance: { x: -500, y: 0, z: 0 },
    };
    view.rerender(<NativeJogControlPair {...p} />);
    expect(screen.getByRole("button", { name: "Jog +X" })
      .querySelector(".movement-progress")).not.toBeInTheDocument();
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
    expect(input).toHaveAttribute("placeholder", "");
    expect((input as HTMLInputElement).value).toEqual("");
    fireEvent.change(input, { target: { value: "2048.5" } });
    const goButton = screen.getByRole("button", { name: "GO" });
    expect(goButton).toHaveClass("native-jog-go-button");
    fireEvent.click(goButton);
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
      x: 900,
      y: undefined,
      z: -50,
    });
    render(<NativeJogControlPair {...p} />);

    fireEvent.change(screen.getByLabelText("X axis position"), {
      target: { value: "2048" },
    });
    expect(screen.getByRole("button", { name: "GO" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Move to Max X" }))
      .toBeDisabled();
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

    const moreOptions = screen.getByTitle("More options");
    fireEvent.pointerDown(moreOptions);
    fireEvent.pointerUp(moreOptions);
    fireEvent.click(moreOptions);
    expect(screen.getByRole("heading", { name: "More options" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByTitle("toggle scaled encoder display"));
    fireEvent.click(screen.getByTitle("toggle raw encoder display"));
    const setHomeButton =
      screen.getByRole("button", { name: "SET HOME" });
    const findLengthButton =
      screen.getByRole("button", { name: "FIND LENGTH" });
    const setLengthButton =
      screen.getByRole("button", { name: "SET LENGTH" });
    [setHomeButton, findLengthButton, setLengthButton]
      .forEach(button => expect(button).toHaveClass("yellow"));
    fireEvent.click(setHomeButton);
    fireEvent.click(findLengthButton);
    fireEvent.click(setLengthButton);
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
    expect(p.navigate).toHaveBeenCalledWith(Path.settings("axes"));

    fireEvent.click(screen.getByTitle("back"));
    expect(screen.getByRole("heading", { name: "X: 1038" }))
      .toBeInTheDocument();
    fireEvent.click(screen.getByTitle("More options"));
    fireEvent.click(screen.getByTitle("close"));
    expect(p.onClose).toHaveBeenCalledTimes(1);
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

    [
      "Move Home Z", "Find Home Z", "Jog -Z", "Jog +Z",
      "Move to Safe Height", "GO",
    ]
      .forEach(name => expect(screen.getByRole("button", { name }))
        .toBeDisabled());
    NATIVE_JOG_STEP_CHOICES.forEach(step =>
      expect(screen.getByRole("button", { name: `${step}` }))
        .toBeEnabled());
    expect(screen.getByLabelText("Z axis position")).toBeDisabled();
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

  it.each([
    ["busy", { arduinoBusy: true }],
    ["offline", { botOnline: false }],
    ["locked", { locked: true }],
  ])("keeps the popup handle available while %s", (_status, update) => {
    const p = props("x");
    p.selected = false;
    Object.assign(p.axisActions || {}, update);
    const { container } = render(<NativeJogControlPair {...p} />);

    fireEvent.click(container.querySelector(
      "[name='bot-jog-x-control']",
    ) as Element);

    expect(p.onSelect).toHaveBeenCalledTimes(1);
  });
});
