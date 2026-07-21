import React from "react";
import { act, fireEvent, render } from "@testing-library/react";
import { Trail, useGLTF } from "@react-three/drei";
import {
  Bot, clearBotShapeCache, FarmbotModelProps,
  applyBotKinematicFrame,
  getBotSpringTarget, getDemoMovementSpringCallbacks,
  getUnmirroredBotPosition,
} from "../bot";
import { INITIAL, INITIAL_POSITION } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Object3D, Texture, TextureLoader } from "three";
import { ASSETS } from "../../constants";
import { Actions } from "../../../constants";
import { Path } from "../../../internal_urls";
import * as mapUtil from "../../../farm_designer/map/util";
import { Mode } from "../../../farm_designer/map/interfaces";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import {
  CableCarrierSupportHorizontal,
  CableCarrierSupportVertical,
  CableCarrierX,
  CableCarrierY,
  CableCarrierZ,
} from "../components/cable_carriers";
import { Bounds } from "../components/bounds";
import { WaterFlowTextureProvider } from "../components/water_stream";
import * as demoMovement from "../../../demo/lua_runner/movement";
import { getBotKinematics } from "../kinematics";
import { HighlightProvider } from "../../elements";
import { bot as fakeBot } from
  "../../../__test_support__/fake_state/bot";

describe("<Bot />", () => {
  const createShapesMock = SVGLoader.createShapes as unknown as jest.Mock;

  beforeEach(() => {
    clearBotShapeCache();
    createShapesMock.mockClear();
    localStorage.removeItem("FB_PERF_BENCHMARK");
    delete window.__threeDBotBenchmark;
    demoMovement.cancelDemoMovement();
  });

  afterEach(() => {
    jest.useRealTimers();
    localStorage.removeItem("FB_PERF_BENCHMARK");
    delete window.__threeDBotBenchmark;
    demoMovement.cancelDemoMovement();
  });

  const fakeProps = (): FarmbotModelProps => {
    const config = clone(INITIAL);
    config.bot = true;
    config.tracks = true;
    config.cableCarriers = true;
    return {
      config,
      configPosition: clone(INITIAL_POSITION),
      activeFocus: "",
      getZ: jest.fn(),
    };
  };

  it("converts mirrored render positions back to garden coordinates", () => {
    const config = clone(INITIAL);
    config.mirrorX = true;
    config.mirrorY = true;
    expect(getUnmirroredBotPosition(config, { x: 100, y: 200, z: 300 }))
      .toEqual({
        x: config.botSizeX - 100,
        y: config.botSizeY - 200,
        z: 300,
      });
    config.mirrorX = false;
    config.mirrorY = false;
    expect(getUnmirroredBotPosition(config, { x: 100, y: 200, z: 300 }))
      .toEqual({ x: 100, y: 200, z: 300 });
  });

  it("reports raw spring positions to the demo movement coordinator", () => {
    const changeSpy = jest.spyOn(demoMovement, "reportDemoMovementPosition");
    const restSpy = jest.spyOn(demoMovement, "reportDemoMovementComplete");
    const config = clone(INITIAL);
    config.mirrorX = true;
    config.mirrorY = true;
    const callbacks = getDemoMovementSpringCallbacks(config);
    callbacks.onChange({ x: 100, y: 200, z: 300 });
    callbacks.onRest({ x: 100, y: 200, z: 300 });
    const rawPosition = {
      x: config.botSizeX - 100,
      y: config.botSizeY - 200,
      z: 300,
    };
    expect(changeSpy).toHaveBeenCalledWith(rawPosition);
    expect(restSpy).toHaveBeenCalledWith(rawPosition);
    changeSpy.mockRestore();
    restSpy.mockRestore();
  });

  it("keeps the demo target while Redux reports spring progress", () => {
    const config = clone(INITIAL);
    config.mirrorX = true;
    config.mirrorY = true;
    expect(getBotSpringTarget(
      config,
      { x: 40, y: 50, z: 60 },
      { x: 100, y: 200, z: 300 },
    )).toEqual({
      x: config.botSizeX - 100,
      y: config.botSizeY - 200,
      z: 300,
    });
    expect(getBotSpringTarget(
      config,
      { x: 40, y: 50, z: 60 },
      undefined,
    )).toEqual({ x: 40, y: 50, z: 60 });
  });

  it.each(["v1.7", "v1.9"])(
    "applies mirrored %s kinematics directly to object frames",
    kitVersion => {
      const config = clone(INITIAL);
      config.kitVersion = kitVersion;
      config.mirrorX = true;
      config.mirrorY = true;
      config.negativeZ = true;
      const gardenPosition = { x: 100, y: 200, z: -250 };
      const position = getUnmirroredBotPosition(config, gardenPosition);
      const kinematics = getBotKinematics(config, position);
      const gantry = new Object3D();
      const crossSlide = new Object3D();
      const zAxis = new Object3D();
      const trailTarget = new Object3D();

      applyBotKinematicFrame({
        gantry,
        crossSlide,
        zAxis,
        trailTarget,
      }, kinematics);

      expect(gantry.position.toArray()).toEqual([
        config.botSizeX - gardenPosition.x,
        0,
        0,
      ]);
      expect(crossSlide.position.y).toEqual(
        config.botSizeY - gardenPosition.y +
        (kitVersion == "v1.9" ? 45 : 5),
      );
      expect(zAxis.position.y).toEqual(
        kitVersion == "v1.9" ? -45 : -5,
      );
      expect(zAxis.position.z).toEqual(kinematics.zAxisPosition[2]);
      expect(trailTarget.position.toArray())
        .toEqual(kinematics.anchors.utm.worldPosition);
    },
  );

  it("doesn't register an animation driver when animations are disabled", () => {
    const registerSpy = jest.spyOn(
      demoMovement,
      "registerDemoMovementDriver",
    );
    const p = fakeProps();
    p.config.animate = false;
    render(<Bot {...p} />);
    expect(registerSpy).not.toHaveBeenCalled();
    registerSpy.mockRestore();
  });

  it("exposes movement controls only for performance benchmarks", async () => {
    localStorage.setItem("FB_PERF_BENCHMARK", "true");
    const p = fakeProps();
    p.config.trail = true;
    p.dispatch = jest.fn();
    const result = render(<Bot {...p} />);
    const benchmark = window.__threeDBotBenchmark;
    expect(benchmark?.config()).toEqual({
      cableCarriers: true,
      trail: true,
      waterFlow: false,
    });
    benchmark?.setWater(true);
    expect(p.dispatch).toHaveBeenCalledWith({
      type: Actions.DEMO_WRITE_PIN,
      payload: { pin: 8, mode: "digital", value: 1 },
    });

    const target = { x: 100, y: 200, z: -300 };
    const movement = benchmark?.moveTo(target);
    expect(benchmark?.active()).toBeTruthy();
    demoMovement.reportDemoMovementComplete(target);
    await movement;
    expect(benchmark?.active()).toBeFalsy();
    expect(benchmark?.position()).toEqual(target);

    result.unmount();
    expect(window.__threeDBotBenchmark).toBeUndefined();
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis";
    p.config.tracks = true;
    p.config.trail = true;
    p.config.kitVersion = "v1.n";
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("bot");
    expect(container).toContainHTML("water-tube");
    expect(container.querySelector("[name='bot-static']")).toBeTruthy();
    expect(container.querySelector("[name='bot-gantry']")
      ?.getAttribute("position")).toContain("300,0,0");
    expect(container.querySelector("[name='bot-cross-slide']"))
      .toBeTruthy();
    expect(container.querySelector("[name='bot-z-axis']")).toBeTruthy();
    expect(container.querySelector("[name='bot-routing']")).toBeTruthy();
    expect(container.querySelector("[name='bot-effects']")).toBeTruthy();
    expect(container.querySelector("[name='zBelt']")).toBeTruthy();
    expect(container.querySelector(
      "[name='bot-static'] [name='powerSupply']",
    )).toBeTruthy();
    expect(container.querySelector(
      "[name='bot-static'] [name='powerPlug']",
    )).toBeTruthy();
    expect(container.querySelector(
      "[name='bot-routing'] [name='powerCable']",
    )).toBeTruthy();
    expect(container.querySelector(
      "[name='bot-static'] [name='powerCable']",
    )).toBeNull();
  });

  it("keeps mirrored gantry tools subscribed to movement snapshots", () => {
    const p = fakeProps();
    p.config.mirrorX = true;
    const { container } = render(<Bot {...p} />);

    expect(container.querySelector("[name='bot-gantry']"))
      .toBeTruthy();
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("bot");
    expect(container.querySelectorAll("[name='tracks']")).toHaveLength(0);
    expect(container.querySelector("[name='bot-gantry']")).toBeTruthy();
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelector("[name='button-housings']")
      ?.getAttribute("args")).toContain("5");
    expect(container.querySelectorAll("[name='leftMotor']")).toHaveLength(1);
    expect(container.querySelector("[name='zMotor']")).toBeTruthy();
    expect(container.querySelector("[name='zBelt']")).toBeNull();
    expect(container.querySelector("[name='yIdlerPulley']")).toBeNull();
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelector("[name='button-housings']")
      ?.getAttribute("args")).toContain("3");
    expect(container.querySelector("[name='zMotor']")).toBeTruthy();
    expect(container.querySelector("[name='zBelt']")).toBeNull();
  });

  it("renders the v1.9 belt-driven structure", () => {
    const p = fakeProps();
    const { container } = render(<Bot {...p} />);
    expect(container.querySelector("[name='leftMotor']")).toBeNull();
    expect(container.querySelector("[name='zMotor']")).toBeNull();
    expect(container.querySelector("[name='zBelt']")).toBeTruthy();
    expect(container.querySelector("[name='yIdlerPulley']")).toBeTruthy();
  });

  it("only loads v1.9 gantry and Z-axis model variants", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    render(<Bot {...p} />);
    const urls = useGltfMock.mock.calls.map(([url]) => url);

    expect(urls).toContain(ASSETS.models.leftBracketV19);
    expect(urls).toContain(ASSETS.models.rightBracketV19);
    expect(urls).toContain(ASSETS.models.mountedIdlerPulleyGantry);
    expect(urls).not.toContain(ASSETS.models.leftBracket);
    expect(urls).not.toContain(ASSETS.models.rightBracket);
    expect(urls).not.toContain(ASSETS.models.housingVertical);
    expect(urls).not.toContain(ASSETS.models.zAxisMotorMount);
    expect(urls).not.toContain(ASSETS.models.cameraMountHalf);
  });

  it("doesn't load v1.9-only models for a legacy FarmBot", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    render(<Bot {...p} />);
    const urls = useGltfMock.mock.calls.map(([url]) => url);

    expect(urls).toContain(ASSETS.models.leftBracket);
    expect(urls).toContain(ASSETS.models.rightBracket);
    expect(urls).toContain(ASSETS.models.housingVertical);
    expect(urls).toContain(ASSETS.models.zAxisMotorMount);
    expect(urls).toContain(ASSETS.models.cameraMountHalf);
    expect(urls).not.toContain(ASSETS.models.leftBracketV19);
    expect(urls).not.toContain(ASSETS.models.rightBracketV19);
    expect(urls).not.toContain(ASSETS.models.mountedIdlerPulleyGantry);
  });

  it.each([
    ["v1.7", 500],
    ["v1.8", 500],
    ["v1.9", 450],
  ])("renders %s columns at the section length", (kitVersion, depth) => {
    const p = fakeProps();
    p.config.kitVersion = kitVersion;
    const wrapper = createRenderer(<Bot {...p} />);
    const columns = wrapper.root
      .findAll(node => node.props.name == "columns");
    expect(columns).toHaveLength(2);
    expect(columns[0].props.args[1].depth).toEqual(depth);
    unmountRenderer(wrapper);
  });

  it("preserves the Jr column length adjustment", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.9";
    p.config.columnLength = 300;
    const wrapper = createRenderer(<Bot {...p} />);
    const columns = wrapper.root
      .findAll(node => node.props.name == "columns");
    expect(columns[0].props.args[1].depth).toEqual(250);
    unmountRenderer(wrapper);
  });

  it("uses local kinematic frame positions", () => {
    const { container } = render(<Bot {...fakeProps()} />);
    expect(container.querySelector("[name='bot-machine']")
      ?.getAttribute("position")).toContain("-1350,-660,0");
    expect(container.querySelector("[name='bot-cross-slide']")
      ?.getAttribute("position")).toContain("-12.5,745,597");
    expect(container.querySelector("[name='bot-z-axis']")
      ?.getAttribute("position")).toContain("12.5,-45,-397");
    expect(container.querySelector("[name='bot-static'] [name='slot']"))
      .toBeTruthy();
    expect(container.querySelector("[name='bot-z-axis'] [name='utm-tool']"))
      .toBeTruthy();
  });

  it("mounts native jog controls in their moving frames", () => {
    const p = fakeProps();
    p.configPosition.x = 1038;
    p.axisActions = {
      arduinoBusy: false,
      botPosition: { x: 1038, y: 0, z: 0 },
      botOnline: true,
      dispatch: jest.fn(),
      firmwareSettings: fakeBot.hardware.mcu_params,
      locked: false,
      stepSize: 100,
    };
    const { container, queryByRole } = render(<Bot {...p} />);
    const control = (name: string) =>
      container.querySelector(`[name='${name}']`);

    expect(control("bot-jog-x-near")?.parentElement)
      .toHaveAttribute("name", "bot-gantry");
    expect(control("bot-jog-x-near"))
      .toHaveAttribute("position", "0,-120,0");
    expect(control("bot-jog-x-far"))
      .toHaveAttribute("position", "0,1440,0");
    expect(control("bot-jog-y-near")?.parentElement)
      .toHaveAttribute("name", "bot-gantry");
    expect(control("bot-jog-y-near"))
      .toHaveAttribute("position", "-39,50,700");
    expect(control("bot-jog-y-far")?.parentElement)
      .toHaveAttribute("name", "bot-gantry");
    expect(control("bot-jog-y-far"))
      .toHaveAttribute("position", "-39,1350,700");
    expect(control("bot-cross-slide")
      ?.querySelector("[name^='bot-jog-y']"))
      .not.toBeInTheDocument();
    expect(control("bot-jog-z")?.parentElement)
      .toHaveAttribute("name", "bot-z-axis");
    expect(control("bot-jog-z"))
      .toHaveAttribute("position", "60,0,300");

    fireEvent.click(control("bot-jog-x-near-control") as Element);
    expect(queryByRole("heading", { name: "X: 1,038" }))
      .toBeInTheDocument();
    fireEvent.keyDown(window, { key: "a" });
    expect(queryByRole("heading", { name: "X: 1,038" }))
      .toBeInTheDocument();
    expect(fireEvent.keyDown(window, {
      key: "Escape",
      cancelable: true,
    })).toBeFalsy();
    expect(queryByRole("heading", { name: "X: 1,038" }))
      .not.toBeInTheDocument();
  });

  it("doesn't activate native jog controls without axis actions", () => {
    const p = fakeProps();
    const { container, queryByRole } = render(<Bot {...p} />);

    fireEvent.click(container.querySelector(
      "[name='bot-jog-x-near-control']",
    ) as Element);

    expect(queryByRole("heading")).not.toBeInTheDocument();
  });

  it("keeps disabled controls open and closes when actions disappear", () => {
    jest.useFakeTimers();
    const p = fakeProps();
    p.axisActions = {
      arduinoBusy: false,
      botPosition: { x: 100, y: 200, z: -50 },
      botOnline: true,
      dispatch: jest.fn(),
      firmwareSettings: fakeBot.hardware.mcu_params,
      locked: false,
      stepSize: 100,
    };
    const result = render(<Bot {...p} />);
    const control = () => result.container.querySelector(
      "[name='bot-jog-x-near-control']",
    ) as Element;
    fireEvent.click(control());
    expect(result.queryByRole("heading", { name: "X: 100" }))
      .toBeInTheDocument();

    p.axisActions = { ...p.axisActions, locked: true };
    result.rerender(<Bot {...p} />);
    expect(result.queryByRole("heading", { name: "X: 100" }))
      .toBeInTheDocument();
    expect(result.getByRole("button", { name: "Jog +X" }))
      .toBeDisabled();

    p.axisActions = undefined;
    result.rerender(<Bot {...p} />);
    act(() => jest.runOnlyPendingTimers());

    expect(result.queryByRole("heading", { name: "X: 100" }))
      .not.toBeInTheDocument();
  });

  it("highlights all clickable FarmBot objects with one UTM label", () => {
    const wrapper = createRenderer(
      <HighlightProvider highlighted3DObject={"all"}>
        <Bot {...fakeProps()} />
      </HighlightProvider>,
    );
    const named = (name: string) => wrapper.root.findAll(node =>
      typeof node.type == "string" && node.props.name == name);
    expect(named("electronics-label")).toHaveLength(1);
    expect(named("camera-label")).toHaveLength(1);
    expect(named("utm-highlight").length).toBeGreaterThanOrEqual(2);
    expect(named("utm-label")).toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("selects the UTM", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    p.onHoverObject = jest.fn();
    const { container } = render(<Bot {...p} />);
    const utm = container.querySelector("group[name='UTM'] mesh");
    utm && fireEvent.pointerOver(utm);
    utm && fireEvent.pointerOut(utm);
    utm && fireEvent.click(utm);
    expect(p.onHoverObject).toHaveBeenCalledWith(true);
    expect(p.onHoverObject).toHaveBeenCalledWith(false);
    expect(p.onSelectObject).toHaveBeenCalledWith({ kind: "utm", id: 0 });
  });

  it.each(["v1.7", "v1.9"])("selects the %s camera", kitVersion => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.config.kitVersion = kitVersion;
    p.onSelectObject = jest.fn();
    p.onHoverObject = jest.fn();
    const { container } = render(<Bot {...p} />);
    const camera = container.querySelector("group[name='camera']");
    camera && fireEvent.pointerOver(camera);
    camera && fireEvent.pointerOut(camera);
    camera && fireEvent.click(camera);
    expect(p.onHoverObject).toHaveBeenCalledWith(true);
    expect(p.onHoverObject).toHaveBeenCalledWith(false);
    expect(p.onSelectObject).toHaveBeenCalledWith({ kind: "camera", id: 0 });
  });

  it.each(["v1.7", "v1.9"])(
    "doesn't select the %s camera in camera selection mode",
    kitVersion => {
      const getModeSpy = jest.spyOn(mapUtil, "getMode")
        .mockReturnValue(Mode.cameraSelection);
      location.pathname = Path.mock(Path.designer());
      const p = fakeProps();
      p.config.kitVersion = kitVersion;
      p.onSelectObject = jest.fn();
      const { container } = render(<Bot {...p} />);
      const utm = container.querySelector("group[name='UTM'] mesh");
      const camera = container.querySelector("group[name='camera']");
      utm && fireEvent.click(utm);
      camera && fireEvent.click(camera);
      expect(p.onSelectObject).not.toHaveBeenCalled();
      getModeSpy.mockRestore();
    },
  );

  it("hides FarmBot in Planter bed focus", () => {
    const p = fakeProps();
    p.activeFocus = "Planter bed";
    const wrapper = createRenderer(<Bot {...p} />);
    const bot = wrapper.root.findAll(node => node.props.name == "bot")[0];
    expect(bot.props.visible).toEqual(false);
    unmountRenderer(wrapper);
  });

  it("skips disabled FarmBot model work", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const p = fakeProps();
    p.config.bot = false;
    const { container } = render(<Bot {...p} />);

    expect(container.querySelector("[name='bot']")).toBeNull();
    expect(createShapesMock).not.toHaveBeenCalled();
    expect(useGltfMock).not.toHaveBeenCalled();
  });

  it("renders watering animation", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    jest.useFakeTimers();
    const { container, rerender } = render(<Bot {...p} />);
    jest.runAllTimers();
    rerender(<Bot {...p} />);
    expect(container).toContainHTML("watering-animations");
  });

  it("shares water texture across Bot water effects", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    const loadTextureSpy = jest.spyOn(TextureLoader.prototype, "load")
      .mockImplementation(() => new Texture());
    render(<Bot {...p} />);
    expect(loadTextureSpy).toHaveBeenCalledTimes(1);
    loadTextureSpy.mockRestore();
  });

  it("keeps water texture provider mounted when water is disabled", () => {
    const p = fakeProps();
    p.config.waterFlow = false;
    const wrapper = createRenderer(<Bot {...p} />);
    expect(wrapper.root.findAllByType(WaterFlowTextureProvider))
      .toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("mounts enabled water texture provider", () => {
    const p = fakeProps();
    p.config.waterFlow = true;
    const wrapper = createRenderer(<Bot {...p} />);
    expect(wrapper.root.findAllByType(WaterFlowTextureProvider))
      .toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("keeps trail mounted while toggling watering animation", () => {
    const p = fakeProps();
    p.config.trail = true;
    p.config.waterFlow = false;
    const wrapper = createRenderer(<Bot {...p} />);

    actRenderer(() => {
      wrapper.update(<Bot
        {...p}
        config={{ ...p.config, waterFlow: true }} />);
    });

    expect(wrapper.root.findAll(node => node.props.className == "trail"))
      .toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("seeds the trail at the UTM world position", () => {
    const p = fakeProps();
    p.config.trail = true;
    const wrapper = createRenderer(<Bot {...p} />);
    const trail = wrapper.root.findByType(Trail);
    const expectedPosition = getBotKinematics(
      p.config,
      p.configPosition,
    ).anchors.utm.worldPosition;

    expect(trail.props.target.current.position.toArray())
      .toEqual(expectedPosition);
    unmountRenderer(wrapper);
  });

  it("loads shapes", () => {
    const p = fakeProps();
    render(<Bot {...p} />);
    expect(createShapesMock).toHaveBeenCalledTimes(14);
  });

  it("skips track shape loading when tracks are disabled", () => {
    const p = fakeProps();
    p.config.tracks = false;
    render(<Bot {...p} />);
    expect(createShapesMock).toHaveBeenCalledTimes(11);
  });

  it("skips X-axis carrier mount model when carriers are disabled", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    useGltfMock.mockClear();
    const p = fakeProps();
    p.config.cableCarriers = false;
    const { container } = render(<Bot {...p} />);
    expect(container.querySelectorAll("[name='xCCMount']").length).toEqual(0);
    expect(useGltfMock.mock.calls
      .filter(([url]) => url == ASSETS.models.xAxisCCMount)).toHaveLength(0);
  });

  it("skips disabled cable carrier and bounds component mounts", () => {
    const p = fakeProps();
    p.config.cableCarriers = false;
    p.config.bounds = false;
    p.config.zDimension = false;
    p.config.distanceIndicator = "";
    const wrapper = createRenderer(<Bot {...p} />);
    expect(wrapper.root.findAllByType(CableCarrierX)).toHaveLength(0);
    expect(wrapper.root.findAllByType(CableCarrierY)).toHaveLength(0);
    expect(wrapper.root.findAllByType(CableCarrierZ)).toHaveLength(0);
    expect(wrapper.root.findAllByType(CableCarrierSupportHorizontal))
      .toHaveLength(0);
    expect(wrapper.root.findAllByType(CableCarrierSupportVertical))
      .toHaveLength(0);
    expect(wrapper.root.findAllByType(Bounds)).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("mounts enabled cable carrier and bounds components", () => {
    const p = fakeProps();
    p.config.cableCarriers = true;
    p.config.bounds = true;
    const wrapper = createRenderer(<Bot {...p} />);
    expect(wrapper.root.findAllByType(CableCarrierX)).toHaveLength(1);
    expect(wrapper.root.findAllByType(CableCarrierY)).toHaveLength(1);
    expect(wrapper.root.findAllByType(CableCarrierZ)).toHaveLength(1);
    expect(wrapper.root.findAllByType(CableCarrierSupportHorizontal))
      .toHaveLength(1);
    expect(wrapper.root.findAllByType(CableCarrierSupportVertical))
      .toHaveLength(1);
    expect(wrapper.root.findAllByType(Bounds)).toHaveLength(1);
    unmountRenderer(wrapper);
  });

  it("moves the Z frame without rerendering rigid models", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    const p = fakeProps();
    const wrapper = createRenderer(<Bot {...p} />);
    useGltfMock.mockClear();

    actRenderer(() => {
      wrapper.update(<Bot
        {...p}
        configPosition={{
          ...p.configPosition,
          z: p.configPosition.z + 10,
        }} />);
    });

    const urls = useGltfMock.mock.calls.map(([url]) => url);
    expect(urls).not.toContain(ASSETS.models.gantryWheelPlate);
    expect(urls).not.toContain(ASSETS.models.leftBracket);
    expect(urls).not.toContain(ASSETS.models.rightBracket);
    expect(urls).not.toContain(ASSETS.models.crossSlide);
    expect(urls).not.toContain(ASSETS.models.horizontalMotorHousing);
    expect(urls).not.toContain(ASSETS.models.xAxisCCMount);
    expect(urls).not.toContain(ASSETS.models.beltClip);
    expect(urls).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("skips frame and gantry model hooks during unrelated config rerenders", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    const p = fakeProps();
    const wrapper = createRenderer(<Bot {...p} />);
    useGltfMock.mockClear();

    actRenderer(() => {
      wrapper.update(<Bot
        {...p}
        config={{
          ...p.config,
          sun: p.config.sun + 1,
        }} />);
    });

    const urls = useGltfMock.mock.calls.map(([url]) => url);
    expect(urls).not.toContain(ASSETS.models.gantryWheelPlate);
    expect(urls).not.toContain(ASSETS.models.leftBracket);
    expect(urls).not.toContain(ASSETS.models.rightBracket);
    expect(urls).not.toContain(ASSETS.models.crossSlide);
    expect(urls).not.toContain(ASSETS.models.horizontalMotorHousing);
    expect(urls).not.toContain(ASSETS.models.xAxisCCMount);
    expect(urls).not.toContain(ASSETS.models.beltClip);
    expect(urls).not.toContain(ASSETS.models.zStop);
    expect(urls).not.toContain(ASSETS.models.utm);
    expect(urls).not.toContain(ASSETS.models.housingVertical);
    expect(urls).not.toContain(ASSETS.models.zAxisMotorMount);
    expect(urls).not.toContain(ASSETS.models.vacuumPumpCover);
    expect(urls).not.toContain(ASSETS.models.cameraMountHalf);
    unmountRenderer(wrapper);
  });

  it("moves the gantry frame without rerendering rigid models", () => {
    const useGltfMock = useGLTF as unknown as jest.Mock;
    const p = fakeProps();
    const wrapper = createRenderer(<Bot {...p} />);
    useGltfMock.mockClear();

    actRenderer(() => {
      wrapper.update(<Bot
        {...p}
        configPosition={{
          ...p.configPosition,
          x: p.configPosition.x + 10,
        }} />);
    });

    const urls = useGltfMock.mock.calls.map(([url]) => url);
    expect(urls).toHaveLength(0);
    unmountRenderer(wrapper);
  });

  it("reuses parsed shapes across remounts", () => {
    const p = fakeProps();
    const first = render(<Bot {...p} />);
    first.unmount();
    const second = render(<Bot {...p} />);
    second.unmount();

    expect(createShapesMock).toHaveBeenCalledTimes(14);
  });
});
