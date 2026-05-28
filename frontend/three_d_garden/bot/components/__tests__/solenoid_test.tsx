import React from "react";
import { render } from "@testing-library/react";
import { INITIAL, INITIAL_POSITION } from "../../../config";
import { clone } from "lodash";
import { Solenoid, SolenoidProps } from "../solenoid";
import {
  actRenderer,
  createRenderer,
} from "../../../../__test_support__/test_renderer";
import { WaterTube } from "../water_tube";

describe("<Solenoid />", () => {
  const fakeProps = (): SolenoidProps => ({
    config: clone(INITIAL),
    configPosition: clone(INITIAL_POSITION),
  });

  it("renders solenoid", () => {
    const { container } = render(<Solenoid {...fakeProps()} />);
    expect(container).toContainHTML("solenoid");
  });

  it("reuses water tube paths while position is unchanged", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<Solenoid {...p} />);
    const before = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    actRenderer(() => wrapper.update(<Solenoid {...p} />));
    const after = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    expect(after).toEqual(before);
  });

  it("reuses water tube paths during unrelated config churn", () => {
    const p = fakeProps();
    const wrapper = createRenderer(<Solenoid {...p} />);
    const before = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    actRenderer(() => wrapper.update(<Solenoid {...p}
      config={{ ...p.config, sun: p.config.sun + 1 }} />));
    const after = wrapper.root.findAllByType(WaterTube)
      .map(node => node.props.tubePath);
    expect(after).toEqual(before);
  });
});
