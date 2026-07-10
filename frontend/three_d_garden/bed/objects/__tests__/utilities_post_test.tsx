import React from "react";
import { act, render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import * as reactSpring from "@react-spring/three";
import {
  makeUtilitiesPostGeometry,
  UtilitiesPost,
  utilitiesPostPropsEqual,
  UtilitiesPostProps,
} from "../utilities_post";
import { INITIAL } from "../../../config";
import { clone } from "lodash";
import { FocusTransitionProvider } from "../../../focus_transition";
import * as THREE from "three";

describe("<UtilitiesPost />", () => {
  const fakeProps = (): UtilitiesPostProps => ({
    config: clone(INITIAL),
    activeFocus: "",
  });

  it("renders", () => {
    const { container } = render(<UtilitiesPost {...fakeProps()} />);
    expect(container.innerHTML).toContain("utilities-post");
    expect(container.querySelector("[name='utilities-solid-hardware']"))
      .toBeTruthy();
  });

  it("merges solid hardware into one colored geometry", () => {
    const geometry = makeUtilitiesPostGeometry({
      legSize: 100,
      hosePathCurved: new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 1, 1),
      ),
      hosePathStraight: new THREE.LineCurve3(
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(1, 0, 0),
      ),
    });
    expect(geometry?.getAttribute("position").count).toBeGreaterThan(0);
    expect(geometry?.getAttribute("color").count)
      .toEqual(geometry?.getAttribute("position").count);
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

  it("follows shared layout motion without starting another spring", () => {
    const start = jest.fn(() => Promise.resolve());
    const api = { start };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(props => {
        const values = typeof props == "function" ? props() : props;
        return [values, api] as unknown as ReturnType<
          typeof reactSpring.useSpring
        >;
      });
    try {
      const p = fakeProps();
      const { container, rerender } = render(<UtilitiesPost {...p} />);
      expect(container.querySelector("[name='utilities']")
        ?.getAttribute("position")).toContain("2100,-630,-150");
      start.mockClear();

      rerender(<UtilitiesPost {...p}
        config={{ ...p.config, bedLengthOuter: 3100 }} />);

      expect(container.querySelector("[name='utilities']")
        ?.getAttribute("position")).toContain("2150,-630,-150");
      expect(start).not.toHaveBeenCalled();

      rerender(<UtilitiesPost {...p}
        activeFocus={"Planter bed"}
        config={{ ...p.config, bedLengthOuter: 3100 }} />);
      expect(start).toHaveBeenCalledWith(expect.objectContaining({
        focusDepthOffset: -450,
      }));
    } finally {
      springSpy.mockRestore();
    }
  });

  it("hides after the focus depth spring rests", () => {
    let finish: (() => void) | undefined;
    const start = jest.fn((update: { onRest?(): void }) => {
      finish = update.onRest;
      return Promise.resolve();
    });
    const api = { start };
    const springSpy = jest.spyOn(reactSpring, "useSpring")
      .mockImplementation(props => {
        const values = typeof props == "function" ? props() : props;
        return [values, api] as unknown as ReturnType<
          typeof reactSpring.useSpring
        >;
      });
    const p = fakeProps();
    const view = (activeFocus: string) =>
      <FocusTransitionProvider enabled={true}>
        <UtilitiesPost {...p} activeFocus={activeFocus} />
      </FocusTransitionProvider>;
    try {
      const { container, rerender } = render(view(""));
      start.mockClear();
      rerender(view("Planter bed"));
      expect(start).toHaveBeenCalledWith(expect.objectContaining({
        focusDepthOffset: -450,
      }));
      act(() => finish?.());
      expect(container.querySelector("[name='utilities']")).toBeNull();
    } finally {
      springSpy.mockRestore();
    }
  });
});
