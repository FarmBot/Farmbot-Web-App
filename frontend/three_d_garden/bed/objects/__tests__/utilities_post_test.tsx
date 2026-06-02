import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import {
  UtilitiesPost, utilitiesPostPropsEqual, UtilitiesPostProps,
} from "../utilities_post";
import { INITIAL } from "../../../config";
import { clone } from "lodash";

describe("<UtilitiesPost />", () => {
  const fakeProps = (): UtilitiesPostProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<UtilitiesPost {...fakeProps()} />);
    expect(container.innerHTML).toContain("utilities-post");
  });

  it("doesn't load hidden utilities", () => {
    const useTextureMock = useTexture as unknown as jest.Mock;
    useTextureMock.mockClear();
    const p = fakeProps();
    p.config.utilitiesPost = false;
    const { container } = render(<UtilitiesPost {...p} />);
    expect(container.innerHTML).not.toContain("utilities-post");
    expect(useTextureMock).not.toHaveBeenCalled();
  });

  it("compares utilities-post-relevant inputs", () => {
    const p = fakeProps();
    expect(utilitiesPostPropsEqual(p, {
      ...p,
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(utilitiesPostPropsEqual(p, {
      ...p,
      activeFocus: "Planter bed",
    })).toBeFalsy();
    expect(utilitiesPostPropsEqual(p, {
      ...p,
      config: { ...p.config, utilitiesPost: false },
    })).toBeFalsy();
    expect(utilitiesPostPropsEqual(p, {
      ...p,
      config: { ...p.config, bedLengthOuter: p.config.bedLengthOuter + 1 },
    })).toBeFalsy();
    expect(utilitiesPostPropsEqual(p, {
      ...p,
      config: { ...p.config, bedBrightness: p.config.bedBrightness + 1 },
    })).toBeFalsy();
  });
});
