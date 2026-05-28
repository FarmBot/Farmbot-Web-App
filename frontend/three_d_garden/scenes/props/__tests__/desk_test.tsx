import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import { Desk, deskPropsEqual, DeskProps } from "../desk";
import { clone } from "lodash";
import { INITIAL } from "../../../config";

describe("<Desk />", () => {
  const fakeProps = (): DeskProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<Desk {...fakeProps()} />);
    expect(container.innerHTML).toContain("desk");
  });

  it("doesn't load hidden desk textures", () => {
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();
    const p = fakeProps();
    p.config.desk = false;
    const { container } = render(<Desk {...p} />);
    expect(container.innerHTML).not.toContain("desk");
    expect(useTextureMock).not.toHaveBeenCalled();
  });

  it("compares desk-relevant inputs", () => {
    const p = fakeProps();
    expect(deskPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(deskPropsEqual(p, {
      ...p,
      activeFocus: "Planter bed",
    })).toBeFalsy();
    expect(deskPropsEqual(p, {
      ...p,
      config: { ...p.config, desk: false },
    })).toBeFalsy();
    expect(deskPropsEqual(p, {
      ...p,
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(deskPropsEqual(p, {
      ...p,
      config: { ...p.config, bedZOffset: p.config.bedZOffset + 1 },
    })).toBeFalsy();
  });
});
