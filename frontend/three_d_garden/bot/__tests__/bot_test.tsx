import React from "react";
import { fireEvent, render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { Bot, clearBotShapeCache, FarmbotModelProps } from "../bot";
import { INITIAL, INITIAL_POSITION } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/loaders/SVGLoader.js";
import { Texture, TextureLoader } from "three";
import { ASSETS } from "../../constants";
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

describe("<Bot />", () => {
  const createShapesMock = SVGLoader.createShapes as unknown as jest.Mock;

  beforeEach(() => {
    clearBotShapeCache();
    createShapesMock.mockClear();
  });

  afterEach(() => {
    jest.useRealTimers();
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

  it("renders", () => {
    const p = fakeProps();
    p.config.sizePreset = "Genesis";
    p.config.tracks = true;
    p.config.trail = true;
    p.config.kitVersion = "v1.n";
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("bot");
    expect(container).toContainHTML("water-tube");
    const slots = container.querySelectorAll("[name='slot']");
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot?.getAttribute("position")?.replace(/\s+/g, ""))
      .toContain("-1350,200,51");
  });

  it("renders: Jr", () => {
    const p = fakeProps();
    p.config.sizePreset = "Jr";
    p.config.tracks = false;
    p.config.trail = false;
    const { container } = render(<Bot {...p} />);
    expect(container).toContainHTML("bot");
    const slots = container.querySelectorAll("[name='slot']");
    const lastSlot = slots[slots.length - 1];
    expect(lastSlot?.getAttribute("position")?.replace(/\s+/g, ""))
      .toContain("-1350,200,51");
  });

  it("renders: v1.7", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.7";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelectorAll("[name='button-group']").length).toEqual(5);
  });

  it("renders: v1.8", () => {
    const p = fakeProps();
    p.config.kitVersion = "v1.8";
    const { container } = render(<Bot {...p} />);
    expect(container.querySelectorAll("[name='button-group']").length).toEqual(3);
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

  it("selects the camera", () => {
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
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

  it("doesn't select the UTM in camera selection mode", () => {
    const getModeSpy = jest.spyOn(mapUtil, "getMode")
      .mockReturnValue(Mode.cameraSelection);
    location.pathname = Path.mock(Path.designer());
    const p = fakeProps();
    p.onSelectObject = jest.fn();
    const { container } = render(<Bot {...p} />);
    const utm = container.querySelector("group[name='UTM'] mesh");
    const camera = container.querySelector("group[name='camera']");
    utm && fireEvent.click(utm);
    camera && fireEvent.click(camera);
    expect(p.onSelectObject).not.toHaveBeenCalled();
    getModeSpy.mockRestore();
  });

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

  it("skips X/Y-only model hooks during z-only rerenders", () => {
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
    expect(urls).toContain(ASSETS.models.mountedIdlerPulley);
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

  it("updates X/Y-only model hooks when x changes", () => {
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
    expect(urls).toContain(ASSETS.models.gantryWheelPlateV19);
    expect(urls).toContain(ASSETS.models.crossSlideV19);
    expect(urls).not.toContain(ASSETS.models.xAxisCCMount);
    expect(urls).toContain(ASSETS.models.beltClip);
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
