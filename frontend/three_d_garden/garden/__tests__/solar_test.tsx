import React from "react";
import { render } from "@testing-library/react";
import {
  LegacySolar, LegacySolarProps, Solar, solarPropsEqual, SOLAR_BOUNDS,
} from "../solar";
import { INITIAL, PRESETS } from "../../config";
import { clone } from "lodash";
import { FocusTransitionProvider } from "../../focus_transition";
import {
  actRenderer,
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { RenderOrder } from "../../constants";
import { DoubleSide } from "three";
import { Group } from "../../components";

describe("<Solar />", () => {
  const fakeProps = (): LegacySolarProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.solar = true;
    const { container } = render(<LegacySolar {...p} />);
    expect(container).toContainHTML("solar");
  });

  it("keeps solar mounted during focus transitions", () => {
    const { container } = render(
      <FocusTransitionProvider enabled={true}>
        <LegacySolar {...fakeProps()} />
      </FocusTransitionProvider>,
    );
    expect(container).toContainHTML("solar-wiring");
  });

  it("doesn't cull instanced solar cells", () => {
    const p = fakeProps();
    p.config.solar = true;
    const wrapper = createRenderer(<LegacySolar {...p} />);
    const solarCells = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh");
    expect(solarCells[0].props.frustumCulled).toEqual(false);
    expect(solarCells[0].props.renderOrder).toEqual(RenderOrder.one + 1);
    unmountRenderer(wrapper);
  });

  it("reuses solar cell geometry across mounts", () => {
    const p = fakeProps();
    p.config.solar = true;
    const first = createRenderer(<LegacySolar {...p} />);
    const firstCells = first.root.findAll(node =>
      (node.type as string) == "instancedMesh"
      && node.props.renderOrder == RenderOrder.one + 1)[0];
    const firstGeometry = firstCells.props.args[0];
    unmountRenderer(first);

    const second = createRenderer(<LegacySolar {...p} />);
    const secondCells = second.root.findAll(node =>
      (node.type as string) == "instancedMesh"
      && node.props.renderOrder == RenderOrder.one + 1)[0];

    expect(secondCells.props.args[0]).toBe(firstGeometry);
    expect(secondCells.props.dispose).toBeNull();
    unmountRenderer(second);
  });

  it("renders solar cells above panels and wiring", () => {
    const p = fakeProps();
    p.config.solar = true;
    const wrapper = createRenderer(<LegacySolar {...p} />);
    const wiring = wrapper.root.findAll(node =>
      node.props.name == "solar-wiring")[0];
    const panel = wrapper.root.findAll(node =>
      (node.type as string) == "mesh"
      && node.props.renderOrder == RenderOrder.one)[0];
    const cells = wrapper.root.findAll(node =>
      (node.type as string) == "instancedMesh")[0];
    const cellMaterial = wrapper.root.findAll(node =>
      node.props.side == DoubleSide)[0];
    expect(wiring.props.renderOrder).toEqual(RenderOrder.default);
    expect(panel.props.renderOrder).toEqual(RenderOrder.one);
    expect(Number(cells.props.renderOrder))
      .toBeGreaterThan(Number(panel.props.renderOrder));
    expect(cellMaterial.props.side).toEqual(DoubleSide);
    unmountRenderer(wrapper);
  });

  it("reuses solar placement during unrelated config churn", () => {
    const p = fakeProps();
    p.config = { ...clone(PRESETS["Genesis XL"]), solar: true };
    const wrapper = createRenderer(<LegacySolar {...p} />);
    const solarArray = wrapper.root.findByProps({ name: "solar-array" });
    const wiring = wrapper.root.findByProps({ name: "solar-wiring" });
    const position = solarArray.props.position;
    const points = wiring.props.points;

    actRenderer(() => {
      wrapper.update(<LegacySolar {...p} config={{
        ...p.config,
        grid: !p.config.grid,
      }} />);
    });

    expect(wrapper.root.findByProps({ name: "solar-array" })
      .props.position)
      .toBe(position);
    expect(wrapper.root.findByProps({ name: "solar-wiring" }).props.points)
      .toBe(points);
    unmountRenderer(wrapper);
  });

  it("updates solar placement when geometry inputs change", () => {
    const p = fakeProps();
    p.config = { ...clone(PRESETS["Genesis XL"]), solar: true };
    const wrapper = createRenderer(<LegacySolar {...p} />);
    const solarArray = wrapper.root.findByProps({ name: "solar-array" });
    const wiring = wrapper.root.findByProps({ name: "solar-wiring" });
    const position = solarArray.props.position;
    const points = wiring.props.points;

    actRenderer(() => {
      wrapper.update(<LegacySolar {...p} config={{
        ...p.config,
        bedLengthOuter: p.config.bedLengthOuter + 100,
      }} />);
    });

    expect(wrapper.root.findByProps({ name: "solar-array" })
      .props.position)
      .not.toBe(position);
    expect(wrapper.root.findByProps({ name: "solar-wiring" }).props.points)
      .not.toBe(points);
    unmountRenderer(wrapper);
  });

  it("renders focused solar when the solar setting is disabled", () => {
    const p = fakeProps();
    p.config.solar = false;
    p.activeFocus = "What you need to provide";
    const { container } = render(<LegacySolar {...p} />);
    expect(container).toContainHTML("solar-wiring");
  });

  it("renders a centered, sizable solar array", () => {
    const wrapper = createRenderer(<Solar size={[
      SOLAR_BOUNDS[0] * 2,
      SOLAR_BOUNDS[1] / 2,
      SOLAR_BOUNDS[2] / 2,
    ]} opacity={0.25} />);
    const solar = wrapper.root.findByProps({ name: "solar" });
    const panels = wrapper.root.findAll(node =>
      node.type == Group && node.props.name == "solar-panel");
    const materials = wrapper.root.findAll(node => node.props.opacity == 0.25);

    expect(solar.props.scale).toEqual([2, 0.5, 0.5]);
    expect(panels.map(panel => panel.props.position)).toEqual([
      [0, -525, 0],
      [0, 525, 0],
    ]);
    expect(materials.length).toBeGreaterThan(0);
    unmountRenderer(wrapper);
  });

  it("compares solar size and opacity", () => {
    const p = { size: SOLAR_BOUNDS, opacity: 0.5 };

    expect(solarPropsEqual(p, { ...p })).toBeTruthy();
    expect(solarPropsEqual(p, { ...p, size: [541, 2090, 300] }))
      .toBeFalsy();
    expect(solarPropsEqual(p, { ...p, opacity: 1 })).toBeFalsy();
  });
});
