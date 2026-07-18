import React from "react";
import { render } from "@testing-library/react";
import { useTexture } from "@react-three/drei";
import {
  Ground, groundPropsEqual, GroundProps, GroundTexturePreloader,
  GROUND_TEXTURE_URLS,
} from "../ground";
import { INITIAL } from "../../config";
import { clone } from "lodash";
import { ASSETS } from "../../constants";
import {
  createRenderer,
  unmountRenderer,
} from "../../../__test_support__/test_renderer";
import { SECTION_CLIPPING_EXEMPT } from "../../section";
import { DoubleSide } from "three";

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

  it("renders the detailed ground cylinder", () => {
    const p = fakeProps();
    p.config.bedHeight = 300;
    p.config.bedZOffset = 25;
    const wrapper = createRenderer(<Ground {...p} />);
    mountedWrappers.push(wrapper);
    const ground = wrapper.root.findAll(node =>
      node.props.name == "ground grass")[0];
    const color = ground.props.geometry.attributes.color;
    expect(ground.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    expect(ground.props.position).toEqual([0, 0, -12825]);
    expect(ground.props.rotation).toEqual([Math.PI / 2, 0, 0]);
    expect(ground.props.geometry.parameters).toMatchObject({
      radiusTop: 30000,
      radiusBottom: 30000,
      height: 25000,
      radialSegments: 64,
    });
    const material = wrapper.root.findAll(node =>
      node.props.color == "#ddd")[0];
    expect(material.props.side).toEqual(DoubleSide);
    expect(color.array).toBeInstanceOf(Float32Array);
    expect(color.itemSize).toEqual(3);
  });

  it("passes ground events to handlers", () => {
    const p = fakeProps();
    p.onClick = jest.fn();
    p.onPointerMove = jest.fn();
    const wrapper = createRenderer(<Ground {...p} />);
    mountedWrappers.push(wrapper);
    const ground = wrapper.root.findAll(node =>
      node.props.name == "ground grass")[0];
    const event = {};

    ground.props.onClick(event);
    ground.props.onPointerMove(event);

    expect(p.onClick).toHaveBeenCalledWith(event);
    expect(p.onPointerMove).toHaveBeenCalledWith(event);
  });

  it("reuses detailed ground geometry across mounts", () => {
    const first = createRenderer(<Ground {...fakeProps()} />);
    const firstGround = first.root.findAll(node =>
      node.props.name == "ground grass")[0];
    const firstGeometry = firstGround.props.geometry;
    unmountRenderer(first);

    const second = createRenderer(<Ground {...fakeProps()} />);
    mountedWrappers.push(second);
    const secondGround = second.root.findAll(node =>
      node.props.name == "ground grass")[0];

    expect(secondGround.props.geometry).toBe(firstGeometry);
    expect(secondGround.props.dispose).toBeNull();
  });

  it("renders hidden ground without a texture", () => {
    const p = fakeProps();
    p.config.ground = false;
    const wrapper = createRenderer(<Ground {...p} />);
    mountedWrappers.push(wrapper);
    const ground = wrapper.root.findAll(node =>
      node.props.name == "ground grass")[0];
    const material = wrapper.root.findAll(node =>
      node.props.color == "#ddd")[0];

    expect(ground.props.receiveShadow).toEqual(false);
    expect(material.props.map).toBeUndefined();
    expect(material.props.transparent).toEqual(true);
    expect(material.props.opacity).toEqual(0);
  });

  it("renders low-detail ground without loading a texture", () => {
    const p = fakeProps();
    p.config.lowDetail = true;
    const wrapper = createRenderer(<Ground {...p} />);
    mountedWrappers.push(wrapper);
    const material = wrapper.root.findAll(node =>
      node.props.color == "darkgreen")[0];

    expect(material.props.color).toEqual("darkgreen");
    expect(material.props.side).toEqual(DoubleSide);
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
    expect(groundPropsEqual(p, {
      config: { ...p.config, groundTexture: "concrete" },
    })).toBeFalsy();
    expect(groundPropsEqual(p, {
      ...p,
      onClick: jest.fn(),
    })).toBeFalsy();
  });

  it.each<[string, string]>([
    ["grass", ASSETS.textures.grass],
    ["bricks", ASSETS.textures.bricks],
    ["concrete", ASSETS.textures.concrete],
    ["water", ASSETS.textures.water],
    ["aluminum", ASSETS.textures.aluminum],
    ["soil", ASSETS.textures.soil],
    ["sand", ASSETS.textures.sand],
    ["wood", ASSETS.textures.wood],
  ])("loads the selected %s ground texture",
    (groundTexture, expectedTexture) => {
      const p = fakeProps();
      p.config.groundTexture = groundTexture;
      render(<Ground {...p} />);
      const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
        .map(([url]) => url);
      expect(loadedTextures).toContain(expectedTexture);
    });

  it("preloads all selectable ground textures", () => {
    render(<GroundTexturePreloader config={fakeProps().config} />);
    const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
      .map(([url]) => url);
    expect(loadedTextures).toEqual(GROUND_TEXTURE_URLS);
    expect(new Set(GROUND_TEXTURE_URLS).size).toEqual(8);
  });
});
