import React from "react";
import { render } from "@testing-library/react";
import { Solar, SolarProps } from "../solar";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { FocusTransitionProvider } from "../../focus_transition";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { RenderOrder } from "../../constants";
import { DoubleSide } from "three";

describe("<Solar />", () => {
  const fakeProps = (): SolarProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.solar = true;
    const { container } = render(<Solar {...p} />);
    expect(container).toContainHTML("solar");
  });

  it("keeps solar mounted during focus transitions", () => {
    const { container } = render(
      <FocusTransitionProvider enabled={true}>
        <Solar {...fakeProps()} />
      </FocusTransitionProvider>,
    );
    expect(container).toContainHTML("solar-wiring");
  });

  it("doesn't cull instanced solar cells", () => {
    const p = fakeProps();
    p.config.solar = true;
    const wrapper = createRenderer(<Solar {...p} />);
    const solarCells = wrapper.root.findAll(node =>
      node.type == "instancedMesh");
    expect(solarCells[0].props.frustumCulled).toEqual(false);
    expect(solarCells[0].props.renderOrder).toEqual(RenderOrder.one + 1);
    unmountRenderer(wrapper);
  });

  it("renders solar cells above panels and wiring", () => {
    const p = fakeProps();
    p.config.solar = true;
    const wrapper = createRenderer(<Solar {...p} />);
    const wiring = wrapper.root.findAll(node =>
      node.props.name == "solar-wiring")[0];
    const panel = wrapper.root.findAll(node =>
      node.type == "mesh" && node.props.renderOrder == RenderOrder.one)[0];
    const cells = wrapper.root.findAll(node =>
      node.type == "instancedMesh")[0];
    const cellMaterial = wrapper.root.findAll(node =>
      node.props.side == DoubleSide)[0];
    expect(wiring.props.renderOrder).toEqual(RenderOrder.default);
    expect(panel.props.renderOrder).toEqual(RenderOrder.one);
    expect(Number(cells.props.renderOrder))
      .toBeGreaterThan(Number(panel.props.renderOrder));
    expect(cellMaterial.props.side).toEqual(DoubleSide);
    unmountRenderer(wrapper);
  });
});
