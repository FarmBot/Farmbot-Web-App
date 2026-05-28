import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import { Ground, groundPropsEqual, GroundProps } from "../ground";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { ASSETS } from "../../constants";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";

describe("<Ground />", () => {
  const mountedWrappers: ReturnType<typeof createRenderer>[] = [];

  beforeEach(() => {
    (useTexture as unknown as jest.Mock).mockClear();
  });

  afterEach(() => {
    mountedWrappers.splice(0).forEach(wrapper =>
      unmountRenderer(wrapper));
  });

  const fakeProps = (): GroundProps => ({
    config: clone(INITIAL),
  });

  it("renders", () => {
    const { container } = render(<Ground {...fakeProps()} />);
    expect(container).toContainHTML("ground");
  });

  it("renders detailed ground vertex colors", () => {
    const wrapper = createRenderer(<Ground {...fakeProps()} />);
    mountedWrappers.push(wrapper);
    const ground = wrapper.root.findAll(node =>
      node.props.name == "ground Outdoor")[0];
    const color = ground.props.geometry.attributes.color;
    expect(color.array).toBeInstanceOf(Float32Array);
    expect(color.itemSize).toEqual(3);
  });

  it("skips hidden ground setup", () => {
    const p = fakeProps();
    p.config.ground = false;
    const { container } = render(<Ground {...p} />);
    expect(container).not.toContainHTML("ground");
    expect(useTexture).not.toHaveBeenCalled();
  });

  it("renders low-detail ground without loading high-detail texture", () => {
    const p = fakeProps();
    p.config.lowDetail = true;
    const { container } = render(<Ground {...p} />);
    expect(container.querySelectorAll("[name^='ground']").length).toEqual(1);
    expect(container).toContainHTML("darkgreen");
    expect(useTexture).not.toHaveBeenCalled();
  });

  it("compares ground-relevant config fields", () => {
    const p = fakeProps();
    expect(groundPropsEqual(p, {
      config: { ...p.config, sun: p.config.sun + 1 },
    })).toBeTruthy();
    expect(groundPropsEqual(p, {
      config: { ...p.config, scene: "Lab" },
    })).toBeFalsy();
    expect(groundPropsEqual(p, {
      config: { ...p.config, lowDetail: !p.config.lowDetail },
    })).toBeFalsy();
  });

  it.each<[string, string, string[]]>([
    [
      "Outdoor",
      ASSETS.textures.grass,
      [ASSETS.textures.concrete, ASSETS.textures.bricks],
    ],
    [
      "Lab",
      ASSETS.textures.concrete,
      [ASSETS.textures.grass, ASSETS.textures.bricks],
    ],
    [
      "Greenhouse",
      ASSETS.textures.bricks,
      [ASSETS.textures.grass, ASSETS.textures.concrete],
    ],
  ])("loads only the active %s ground texture",
    (scene, expectedTexture, skippedTextures) => {
      const p = fakeProps();
      p.config.scene = scene;
      render(<Ground {...p} />);
      const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
        .map(([url]) => url);
      expect(loadedTextures).toContain(expectedTexture);
      skippedTextures.forEach(texture =>
        expect(loadedTextures).not.toContain(texture));
    });
});
