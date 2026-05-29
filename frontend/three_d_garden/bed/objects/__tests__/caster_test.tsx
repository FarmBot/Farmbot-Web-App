import React from "react";
import { render } from "@testing-library/react";
import { Caster, casterPropsEqual, CasterProps } from "../caster";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<Caster />", () => {
  const fakeProps = (): CasterProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Caster {...fakeProps()} />);
    expect(container.innerHTML).toContain("cylinder");
    expect(container.innerHTML).toContain("extrude");
  });

  it("compares caster-relevant config fields", () => {
    const p = fakeProps();
    expect(casterPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(casterPropsEqual(p, {
      config: { ...p.config, legSize: p.config.legSize + 1 },
    })).toBeFalsy();
    expect(casterPropsEqual(p, {
      config: { ...p.config, bedZOffset: p.config.bedZOffset + 1 },
    })).toBeFalsy();
    expect(casterPropsEqual(p, {
      config: { ...p.config, legsFlush: !p.config.legsFlush },
    })).toBeFalsy();
  });
});
