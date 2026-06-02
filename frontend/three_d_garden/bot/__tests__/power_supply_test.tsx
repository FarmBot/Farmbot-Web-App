import React from "react";
import { render } from "@testing-library/react";
import * as THREE from "three";
import {
  PowerSupply, powerSupplyPropsEqual, PowerSupplyProps,
} from "../power_supply";
import { INITIAL } from "../../config";
import { clone } from "lodash";

describe("<PowerSupply />", () => {
  const fakeProps = (): PowerSupplyProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<PowerSupply {...fakeProps()} />);
    expect(container.innerHTML).toContain("powerSupplyGroup");
    expect(container.innerHTML).toContain("#222");
    expect(container.innerHTML).not.toContain("hsl(");
  });

  it("renders cable debug mode", () => {
    const p = fakeProps();
    p.config.cableDebug = true;
    const { container } = render(<PowerSupply {...p} />);
    expect(container.innerHTML).toContain("hsl(");
    expect(container.innerHTML).not.toContain("#222");
  });

  it("reuses cable path while dimensions are unchanged", () => {
    const addSpy = jest.spyOn(THREE.CurvePath.prototype, "add");
    try {
      const p = fakeProps();
      const { rerender } = render(<PowerSupply {...p} />);
      rerender(<PowerSupply {...p} />);
      expect(addSpy).toHaveBeenCalledTimes(7);
    } finally {
      addSpy.mockRestore();
    }
  });

  it("compares power-supply-relevant config fields", () => {
    const p = fakeProps();
    expect(powerSupplyPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(powerSupplyPropsEqual(p, {
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(powerSupplyPropsEqual(p, {
      config: { ...p.config, cableDebug: true },
    })).toBeFalsy();
    const debug = fakeProps();
    debug.config.cableDebug = true;
    expect(powerSupplyPropsEqual(debug, {
      config: { ...debug.config },
    })).toBeFalsy();
  });
});
