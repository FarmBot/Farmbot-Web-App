import React from "react";
import { render } from "@testing-library/react";
import { Packaging, packagingPropsEqual, PackagingProps } from "../packaging";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<Packaging />", () => {
  const fakeProps = (): PackagingProps => ({
    config: clone(INITIAL),
  });

  it("skips disabled packaging", () => {
    const { container } = render(<Packaging {...fakeProps()} />);
    expect(container.innerHTML).not.toContain("packaging");
  });

  it("renders", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.kitVersion = "v1.n";
    const { container } = render(<Packaging {...p} />);
    expect(container.innerHTML).toContain("packaging");
    expect(container.innerHTML).not.toContain("100");
    expect(container.innerHTML).not.toContain("170");
  });

  it("renders: v1.7 XL", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.7";
    const { container } = render(<Packaging {...p} />);
    expect(container.innerHTML).toContain("170");
    expect(container.innerHTML).not.toContain("100");
  });

  it("renders: v1.8 XL", () => {
    const p = fakeProps();
    p.config.packaging = true;
    p.config.sizePreset = "Genesis XL";
    p.config.kitVersion = "v1.8";
    const { container } = render(<Packaging {...p} />);
    expect(container.innerHTML).not.toContain("170");
    expect(container.innerHTML).not.toContain("100");
  });

  it("compares packaging-relevant config fields", () => {
    const p = fakeProps();
    p.config.packaging = true;
    expect(packagingPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(packagingPropsEqual(p, {
      config: { ...p.config, packaging: false },
    })).toBeFalsy();
    expect(packagingPropsEqual(p, {
      config: { ...p.config, kitVersion: `${p.config.kitVersion}-updated` },
    })).toBeFalsy();
    expect(packagingPropsEqual(p, {
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(packagingPropsEqual(p, {
      config: { ...p.config, label: `${p.config.label} updated` },
    })).toBeFalsy();
  });
});
