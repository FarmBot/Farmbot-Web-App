import React from "react";
import { clone } from "lodash";
import { Box3, BufferGeometry, Plane, Vector3 } from "three";
import { INITIAL } from "../config";
import {
  getProfileCutGeometries, getProfileNearPosition, ProfileCutFaces,
} from "../profile_cut_faces";
import { getProfileClippingPlanes, PROFILE_CLIPPING_EXEMPT } from "../profile";
import {
  createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { getColorFromBrightness, zZero } from "../helpers";
import { ASSETS, BigDistance } from "../constants";
import { useTexture } from "@react-three/drei";

describe("profile cut faces", () => {
  const config = () => {
    const result = clone(INITIAL);
    result.bedLengthOuter = 1000;
    result.bedWidthOuter = 600;
    result.botSizeX = 1000;
    result.botSizeY = 600;
    result.bedWallThickness = 40;
    result.bedHeight = 300;
    result.bedZOffset = 25;
    result.bedXOffset = 0;
    result.bedYOffset = 0;
    result.mirrorX = false;
    result.mirrorY = false;
    result.ground = true;
    return result;
  };

  it("finds the near-plane position", () => {
    expect(getProfileNearPosition(
      new Plane(new Vector3(-1, 0, 0), 125), "x",
    )).toEqual(125);
    expect(getProfileNearPosition(
      new Plane(new Vector3(0, 0, 1), 5), "x",
    )).toEqual(0);
  });

  it("builds terrain, frame, and ground cross-sections", () => {
    const c = config();
    const nearPlane = getProfileClippingPlanes(c, "x", 500, 200)[0];
    const geometries = getProfileCutGeometries({
      config: c,
      axis: "x",
      nearPlane,
      getZ: () => -100,
    });

    expect(geometries.bed).toHaveLength(2);
    expect(geometries.bed[0].getAttribute("uv").count)
      .toEqual(geometries.bed[0].getAttribute("position").count);
    geometries.bed.forEach(geometry => geometry.computeBoundingBox());
    expect(geometries.bed[0].boundingBox?.min.toArray())
      .toEqual([-100, -300, -300]);
    expect(geometries.bed[0].boundingBox?.max.toArray())
      .toEqual([-100, -260, 0]);
    expect(geometries.bed[1].boundingBox?.min.toArray())
      .toEqual([-100, 260, -300]);
    expect(geometries.bed[1].boundingBox?.max.toArray())
      .toEqual([-100, 300, 0]);

    const soil = geometries.soil as BufferGeometry;
    soil.computeBoundingBox();
    const soilBounds = soil.boundingBox as Box3;
    expect(soilBounds.min.toArray())
      .toEqual([-100, -260, -300]);
    expect(soilBounds.max.toArray())
      .toEqual([-100, 260, zZero(c) - 100]);

    const ground = geometries.ground as BufferGeometry;
    ground.computeBoundingBox();
    const groundBounds = ground.boundingBox as Box3;
    const halfChord = Math.sqrt(BigDistance.ground ** 2 - 100 ** 2);
    expect(groundBounds.min.x).toEqual(-100);
    expect(groundBounds.min.y).toBeCloseTo(-halfChord);
    expect(groundBounds.min.z).toEqual(-30325);
    expect(groundBounds.max.x).toEqual(-100);
    expect(groundBounds.max.y).toBeCloseTo(halfChord);
    expect(groundBounds.max.z).toEqual(-325);
  });

  it("fills an end board and omits objects outside their extents", () => {
    const c = config();
    const endBoard = getProfileCutGeometries({
      config: c,
      axis: "x",
      nearPlane: new Plane(new Vector3(1, 0, 0), 490),
      getZ: () => -100,
    });
    expect(endBoard.bed).toHaveLength(1);
    endBoard.bed[0].computeBoundingBox();
    expect(endBoard.bed[0].boundingBox?.min.y).toEqual(-300);
    expect(endBoard.bed[0].boundingBox?.max.y).toEqual(300);

    c.ground = false;
    const outside = getProfileCutGeometries({
      config: c,
      axis: "x",
      nearPlane: new Plane(new Vector3(1, 0, 0), -40000),
      getZ: () => -100,
    });
    expect(outside).toEqual({ soil: undefined, bed: [], ground: undefined });
  });

  it("renders textured faces exempt from clipping", () => {
    const c = config();
    const nearPlane = getProfileClippingPlanes(c, "y", 300, 200)[0];
    const wrapper = createRenderer(<ProfileCutFaces
      config={c}
      axis={"y"}
      nearPlane={nearPlane}
      getZ={() => -100} />);
    const group = wrapper.root.findByProps({ name: "profile-cut-faces" });
    expect(group.props.userData[PROFILE_CLIPPING_EXEMPT]).toEqual(true);
    expect(wrapper.root.findAll(node =>
      `${node.type}` == "mesh" && node.props.name == "profile-bed-cut-face"))
      .toHaveLength(2);
    const soilMaterial = wrapper.root.findAll(node =>
      node.props.color == getColorFromBrightness(c.soilBrightness))[0];
    expect(soilMaterial.props.map).toBeDefined();
    const bedMaterial = wrapper.root.findAll(node =>
      node.props.color == getColorFromBrightness(c.bedBrightness))[0];
    expect(bedMaterial.props.map).toBeDefined();
    const groundMaterial = wrapper.root.findAll(node =>
      node.props.color == "#ddd")[0];
    expect(groundMaterial.props.map).toBeDefined();
    const loadedTextures = (useTexture as unknown as jest.Mock).mock.calls
      .map(([url]) => url);
    expect(loadedTextures).toContain(ASSETS.textures.wood);
    expect(loadedTextures).toContain(ASSETS.textures.soil + "?=soilT");
    expect(loadedTextures).toContain(ASSETS.textures.grass);
    unmountRenderer(wrapper);
  });
});
