import React from "react";
import { render } from "@testing-library/react";
import * as THREE from "three";
import {
  buildPowerCablePath, PowerCable, powerCablePropsEqual,
  PowerSupplyHardware, powerSupplyHardwarePropsEqual, PowerSupplyProps,
} from "../power_supply";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("power supply components", () => {
  const fakeProps = (): PowerSupplyProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const p = fakeProps();
    const { container } = render(<>
      <PowerSupplyHardware {...p} />
      <PowerCable {...p} />
    </>);
    expect(container.innerHTML).toContain("power-supply-hardware");
    expect(container.innerHTML).toContain("powerSupply");
    expect(container.innerHTML).toContain("powerPlug");
    expect(container.innerHTML).toContain("powerCable");
    expect(container.innerHTML).toContain("#222");
    expect(container.innerHTML).not.toContain("hsl(");
    expect(container.querySelector("[name='powerSupply']")
      ?.getAttribute("position")).toContain("1650,-41,-140");
    expect(container.querySelector("[name='powerPlug']")
      ?.getAttribute("position")).toContain("3362.5,30,-50");
  });

  it("renders cable debug mode", () => {
    const p = fakeProps();
    p.config.cableDebug = true;
    const { container } = render(<>
      <PowerSupplyHardware {...p} />
      <PowerCable {...p} />
    </>);
    expect(container.innerHTML).toContain("hsl(");
    expect(container.innerHTML).not.toContain("#222");
  });

  it("reuses cable path while dimensions are unchanged", () => {
    const addSpy = jest.spyOn(THREE.CurvePath.prototype, "add");
    try {
      const p = fakeProps();
      const { rerender } = render(<PowerCable {...p} />);
      rerender(<PowerCable {...p} />);
      expect(addSpy).toHaveBeenCalledTimes(7);
    } finally {
      addSpy.mockRestore();
    }
  });

  it("builds the cable path in machine-local coordinates", () => {
    const path = buildPowerCablePath(fakeProps().config);
    expect(path.curves).toHaveLength(7);
    const cableCarrierSpan = path.curves[0] as THREE.LineCurve3;
    expect(cableCarrierSpan.v1.toArray()).toEqual([1210, -40, -140]);
    expect(cableCarrierSpan.v2.toArray()).toEqual([1350, -40, -140]);
  });

  it("compares hardware-relevant config fields", () => {
    const p = fakeProps();
    expect(powerSupplyHardwarePropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(powerSupplyHardwarePropsEqual(p, {
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(powerSupplyHardwarePropsEqual(p, {
      config: { ...p.config, cableDebug: true },
    })).toBeFalsy();
    const debug = fakeProps();
    debug.config.cableDebug = true;
    expect(powerSupplyHardwarePropsEqual(debug, {
      config: { ...debug.config },
    })).toBeFalsy();
  });

  it("compares cable-relevant config fields", () => {
    const p = fakeProps();
    expect(powerCablePropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(powerCablePropsEqual(p, {
      config: { ...p.config, botSizeX: p.config.botSizeX + 1 },
    })).toBeFalsy();
  });
});
