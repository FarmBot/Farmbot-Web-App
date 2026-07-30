let mockIsDesktop = true;

import React from "react";
import { render } from "@testing-library/react";
import { ZoomBeacons, ZoomBeaconsProps } from "../zoom_beacons";
import { clone } from "lodash";
import { INITIAL, INITIAL_POSITION } from "../../config";
import * as screenSize from "../../../screen_size";
import * as zoomConstants from "../../zoom_beacons_constants";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { FocusTransitionProvider } from "../../focus_transition";
import { RenderOrder } from "../../constants";
import * as spring from "@react-spring/three";
import * as springCore from "@react-spring/core";
import { ControlPulse } from "../../controls";

const originalDocumentQuerySelector = document.querySelector.bind(document);
let isDesktopSpy: jest.SpyInstance;

describe("<ZoomBeacons />", () => {
  beforeEach(() => {
    mockIsDesktop = true;
    window.location.href = "http://localhost:3000/app/designer";
    history.pushState = jest.fn();
    isDesktopSpy = jest.spyOn(screenSize, "isDesktop")
      .mockImplementation(() => mockIsDesktop);
  });

  afterEach(() => {
    Object.defineProperty(document, "querySelector", {
      value: originalDocumentQuerySelector,
      configurable: true,
    });
    jest.useRealTimers();
    isDesktopSpy.mockRestore();
  });

  const fakeProps = (): ZoomBeaconsProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
    activeFocus: "",
    setActiveFocus: jest.fn(),
  });
  const beaconControl = (
    wrapper: ReturnType<typeof createRenderer>,
  ) => wrapper.root.findAll(node =>
    `${node.type}` == "group" &&
    node.props.name == "beacon-control" &&
    typeof node.props.onPointerOver == "function")[0];
  const pointerEvent = () => ({
    delta: 0,
    stopPropagation: jest.fn(),
    nativeEvent: { stopImmediatePropagation: jest.fn() },
  });

  it("renders", async () => {
    jest.useFakeTimers();
    const { container } = render(<ZoomBeacons {...fakeProps()} />);
    await jest.runAllTimers();
    expect(container.innerHTML).toContain("zoom-beacons");
    expect(container.innerHTML).not.toContain("debug-group");
    expect(container.innerHTML).toContain("60,12,12");
    jest.runAllTimers();
  });

  it("renders: debug", () => {
    const p = fakeProps();
    p.config.zoomBeaconDebug = true;
    p.config.sizePreset = "Genesis XL";
    p.config.animate = false;
    const { container } = render(<ZoomBeacons {...p} />);
    expect(container.innerHTML).toContain("debug-group");
  });

  it("renders mobile", () => {
    mockIsDesktop = false;
    const { container } = render(<ZoomBeacons {...fakeProps()} />);
    expect(container.innerHTML).toContain("80,12,12");
  });

  it("shows beacon", () => {
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const control = beaconControl(wrapper);
    const event = pointerEvent();
    actRenderer(() => {
      control.props.onPointerOver(event);
      control.props.onPointerOut(event);
      control.props.onClick(event);
    });
    expect(p.setActiveFocus).toHaveBeenCalledWith("What you can grow");
    unmountRenderer(wrapper);
  });

  it("starts pulse animation", async () => {
    jest.useFakeTimers();
    const stop = new Error("stop");
    const next = jest.fn()
      .mockResolvedValueOnce(undefined)
      .mockResolvedValueOnce(undefined)
      .mockImplementation(() => Promise.reject(stop));
    let pulsePromise: Promise<unknown> | undefined;
    const useSpringSpy = jest.spyOn(spring, "useSpring")
      .mockImplementation(((springProps: unknown) => {
        type SpringTo = (nextFn: typeof next) => Promise<unknown>;
        const props = (typeof springProps == "function"
          ? springProps()
          : springProps) as {
          from?: object;
          to?: SpringTo | object;
        };
        if (typeof props.to == "function" && !pulsePromise) {
          pulsePromise = props.to(next).catch(() => undefined);
        }
        const resolvedTo = typeof props.to == "object" ? props.to : {};
        return [{ ...props, ...props.from, ...resolvedTo }, {}] as never;
      }) as never);
    const wrapper = createRenderer(<ZoomBeacons {...fakeProps()} />);
    await Promise.resolve();
    jest.advanceTimersByTime(2000);
    await pulsePromise;
    expect(next).toHaveBeenCalledWith({ scale: 2.5, opacity: 0 });
    expect(next).toHaveBeenCalledWith({
      scale: 1,
      opacity: 0.75,
      immediate: true,
    });
    unmountRenderer(wrapper);
    useSpringSpy.mockRestore();
  });

  it("reuses focus definitions during hover rerenders", () => {
    const fociSpy = jest.spyOn(zoomConstants, "FOCI");
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const control = beaconControl(wrapper);
    actRenderer(() => control.props.onPointerOver(pointerEvent()));
    actRenderer(() =>
      beaconControl(wrapper).props.onPointerOut(pointerEvent()));
    expect(fociSpy).toHaveBeenCalledTimes(1);
    unmountRenderer(wrapper);
    fociSpy.mockRestore();
  });

  it("reuses focus definitions during unrelated config object churn", () => {
    const fociSpy = jest.spyOn(zoomConstants, "FOCI");
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    actRenderer(() => {
      wrapper.update(<ZoomBeacons {...p}
        config={{
          ...p.config,
          ambient: p.config.ambient + 1,
          stats: !p.config.stats,
        }} />);
    });
    actRenderer(() =>
      beaconControl(wrapper).props.onClick(pointerEvent()));
    expect(fociSpy).toHaveBeenCalledTimes(1);
    expect(p.setActiveFocus).toHaveBeenCalledWith("What you can grow");
    unmountRenderer(wrapper);
    fociSpy.mockRestore();
  });

  it("updates focus definitions when focus inputs change", () => {
    const fociSpy = jest.spyOn(zoomConstants, "FOCI");
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const beaconPositions = () => {
      const positions = wrapper.root.findAll(node =>
        node.props.name == "zoom-beacon" && node.props.position)
        .map(node => node.props.position);
      return positions.filter((position, index) =>
        positions.findIndex(other =>
          JSON.stringify(other) == JSON.stringify(position)) == index);
    };
    const originalUtmPosition = beaconPositions()[2];
    actRenderer(() => {
      wrapper.update(<ZoomBeacons {...p}
        configPosition={{
          ...p.configPosition,
          x: p.configPosition.x + 100,
        }} />);
    });
    const movedUtmPosition = beaconPositions()[2];
    actRenderer(() => {
      wrapper.update(<ZoomBeacons {...p}
        config={{
          ...p.config,
          bedLengthOuter: p.config.bedLengthOuter + 200,
        }}
        configPosition={{
          ...p.configPosition,
          x: p.configPosition.x + 100,
        }} />);
    });
    expect(fociSpy).toHaveBeenCalledTimes(3);
    expect(movedUtmPosition).not.toEqual(originalUtmPosition);
    expect(beaconPositions()[2]).not.toEqual(movedUtmPosition);
    unmountRenderer(wrapper);
    fociSpy.mockRestore();
  });

  it("hides beacon while focused", () => {
    const element = document.createElement("div");
    Object.defineProperty(document, "querySelector", {
      value: () => element,
      configurable: true,
    });
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const sphere = wrapper.root.findAll(node =>
      node.props.name == "beacon-sphere")[0];
    expect(sphere).toBeUndefined();
    expect(element.style.cursor).toEqual("");
    expect(p.setActiveFocus).not.toHaveBeenCalled();
    unmountRenderer(wrapper);
  });

  it("writes pulse depth while keeping the beacon transparent", () => {
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const sphere = wrapper.root.findAll(node =>
      node.props.name == "beacon-sphere")[0];
    const materials = wrapper.root.findAll(node =>
      node.props.depthWrite === false);
    expect(sphere.props.renderOrder).toEqual(RenderOrder.beacons);
    expect(materials[0].props.depthTest).toBeUndefined();
    expect(materials[0].props.depthWrite).toEqual(false);
    expect(wrapper.root.findAllByType(ControlPulse)
      .every(pulse =>
        pulse.props.depthWrite === true)).toEqual(true);
    unmountRenderer(wrapper);
  });

  it("combines focus, load-in, and pulse opacity", () => {
    type ToMapper = (...values: number[]) => number;
    const toSpy = jest.spyOn(springCore, "to")
      .mockImplementation(((_values: unknown, mapper: ToMapper) =>
        mapper(0.5, 0.25) as never) as never);
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p}
      loadInOpacity={0.25 as never} />);
    expect(toSpy).toHaveBeenCalled();
    unmountRenderer(wrapper);
    toSpy.mockRestore();
  });

  it("applies load-in scale on each anchored beacon visual", () => {
    const p = fakeProps();
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} loadInScale={0.35} />);
    const beacon = wrapper.root.findAll(node =>
      node.props.name == "zoom-beacon")[0];
    const visual = wrapper.root.findAll(node =>
      node.props.name == "beacon-visual")[0];
    expect(beacon.props.position).toBeTruthy();
    expect(visual.props.scale).toEqual(0.35);
    unmountRenderer(wrapper);
  });

  it("doesn't mount stable focused beacon visuals", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = createRenderer(
      <FocusTransitionProvider enabled={true}>
        <ZoomBeacons {...p} />
      </FocusTransitionProvider>,
    );
    expect(wrapper.root.findAll(node =>
      node.props.name == "beacon-sphere").length).toEqual(0);
    unmountRenderer(wrapper);
  });

  it("remounts transition-enabled beacons when focus exits", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = createRenderer(
      <FocusTransitionProvider enabled={true}>
        <ZoomBeacons {...p} />
      </FocusTransitionProvider>,
    );
    p.activeFocus = "";
    actRenderer(() => {
      wrapper.update(
        <FocusTransitionProvider enabled={true}>
          <ZoomBeacons {...p} />
        </FocusTransitionProvider>,
      );
    });
    expect(wrapper.root.findAll(node =>
      node.props.name == "beacon-sphere").length).toBeGreaterThan(0);
    unmountRenderer(wrapper);
  });

  it("changes cursor: zoom-in", () => {
    document.body.style.cursor = "default";
    const p = fakeProps();
    p.activeFocus = "";
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    actRenderer(() =>
      beaconControl(wrapper).props.onPointerOver(pointerEvent()));
    expect(document.body.style.cursor).toEqual("zoom-in");
    unmountRenderer(wrapper);
  });

  it("shows pop-up", () => {
    const p = fakeProps();
    p.activeFocus = "What you can grow";
    p.config.animate = false;
    const wrapper = createRenderer(<ZoomBeacons {...p} />);
    const e = { stopPropagation: jest.fn() };
    const info = wrapper.root.findAll(node =>
      (node.props.className || "").includes("beacon-info"))[0];
    actRenderer(() => {
      info?.props.onPointerDown(e);
      info?.props.onPointerMove(e);
    });
    expect(e.stopPropagation).toHaveBeenCalledTimes(2);
    actRenderer(() => {
      wrapper.root.findAll(node => node.props.className == "exit-button")[0]
        ?.props.onClick();
    });
    expect(p.setActiveFocus).toHaveBeenCalledWith("");
    unmountRenderer(wrapper);
  });
});
