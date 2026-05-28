import React from "react";
import { render } from "@testing-library/react";
import { useGLTF } from "@react-three/drei";
import { Bot, clearBotShapeCache, FarmbotModelProps } from "../bot";
import { INITIAL, INITIAL_POSITION } from "../../config";
import { clone } from "lodash";
import { SVGLoader } from "three/examples/jsm/Addons.js";
import { Texture, TextureLoader } from "three";
import { ASSETS } from "../../constants";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

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
      .toContain("-1345,200,51");
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
      .toContain("-1345,100,51");
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

  it("hides FarmBot in Planter bed focus", () => {
    const p = fakeProps();
    p.activeFocus = "Planter bed";
    const wrapper = createRenderer(<Bot {...p} />);
    const bot = wrapper.root.findAll(node => node.props.name == "bot")[0];
    expect(bot.props.visible).toEqual(false);
    unmountRenderer(wrapper);
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

  it("loads shapes", () => {
    const p = fakeProps();
    render(<Bot {...p} />);
    expect(createShapesMock).toHaveBeenCalledTimes(15);
  });

  it("skips track shape loading when tracks are disabled", () => {
    const p = fakeProps();
    p.config.tracks = false;
    render(<Bot {...p} />);
    expect(createShapesMock).toHaveBeenCalledTimes(12);
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
    expect(urls).toContain(ASSETS.models.zStop);
    unmountRenderer(wrapper);
  });

  it("skips frame model hooks during unrelated config rerenders", () => {
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
    expect(urls).toContain(ASSETS.models.gantryWheelPlate);
    expect(urls).toContain(ASSETS.models.crossSlide);
    expect(urls).toContain(ASSETS.models.xAxisCCMount);
    expect(urls).toContain(ASSETS.models.beltClip);
    unmountRenderer(wrapper);
  });

  it("reuses parsed shapes across remounts", () => {
    const p = fakeProps();
    const first = render(<Bot {...p} />);
    first.unmount();
    const second = render(<Bot {...p} />);
    second.unmount();

    expect(createShapesMock).toHaveBeenCalledTimes(15);
  });
});
