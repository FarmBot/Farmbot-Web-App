import React from "react";
import { clone } from "lodash";
import { Box3, BufferGeometry, Plane, Vector3 } from "three";
import { INITIAL } from "../config";
import {
  getSectionCutGeometries, getSectionNearPosition,
  getSectionSoilCutLinePoints, SectionCutFaces,
} from "../section_cut_faces";
import { getSectionClippingPlanes, SECTION_CLIPPING_EXEMPT } from "../section";
import {
  createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { getColorFromBrightness, zZero } from "../helpers";
import { ASSETS, BigDistance } from "../constants";
import { useTexture } from "@react-three/drei";

describe("section cut faces", () => {
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
    expect(getSectionNearPosition(
      new Plane(new Vector3(-1, 0, 0), 125), "x",
    )).toEqual(125);
    expect(getSectionNearPosition(
      new Plane(new Vector3(0, 0, 1), 5), "x",
    )).toEqual(0);
  });

  it("builds terrain, frame, and ground cross-sections", () => {
    const c = config();
    const nearPlane = getSectionClippingPlanes(c, "x", 500, 200)[0];
    const geometries = getSectionCutGeometries({
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
    expect(geometries.soilLine[0]).toEqual([
      -100, -260, zZero(c) - 100,
    ]);
    expect(geometries.soilLine[geometries.soilLine.length - 1]).toEqual([
      -100, 260, zZero(c) - 100,
    ]);

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
    const endBoard = getSectionCutGeometries({
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
    const outside = getSectionCutGeometries({
      config: c,
      axis: "x",
      nearPlane: new Plane(new Vector3(1, 0, 0), -40000),
      getZ: () => -100,
    });
    expect(outside).toEqual({
      soil: undefined,
      soilLine: [],
      bed: [],
      ground: undefined,
    });
  });

  it("samples the interpolated soil height along a clipping plane", () => {
    const c = config();
    const points = getSectionSoilCutLinePoints({
      config: c,
      axis: "y",
      nearPlane: getSectionClippingPlanes(c, "y", 300, 200)[0],
      getZ: (x, y) => x / 10 + y / 20,
    });
    expect(points.length).toBeGreaterThan(2);
    points.forEach(point => {
      const x = point[0] + c.bedLengthOuter / 2;
      const y = point[1] + c.bedWidthOuter / 2;
      expect(point[2]).toBeCloseTo(zZero(c) + x / 10 + y / 20);
    });
  });

  it("renders textured faces exempt from clipping", () => {
    const c = config();
    const planes = getSectionClippingPlanes(c, "y", 300, 200);
    const wrapper = createRenderer(<SectionCutFaces
      config={c}
      axis={"y"}
      nearPlane={planes[0]}
      farPlane={planes[1]}
      cutAll={true}
      opacity={0.4}
      getZ={() => -100} />);
    const group = wrapper.root.findByProps({ name: "section-cut-faces" });
    expect(group.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    const bedFaces = wrapper.root.findAll(node =>
      `${node.type}` == "mesh"
      && node.props.name == "section-bed-cut-face");
    expect(bedFaces).toHaveLength(2);
    bedFaces.map(face =>
      expect(face.props.receiveShadow).toEqual(true));
    const soilFace = wrapper.root.find(node =>
      `${node.type}` == "mesh"
      && node.props.name == "section-soil-cut-face");
    expect(soilFace.props.receiveShadow).toEqual(true);
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
    ["section-soil-near-cut-line", "section-soil-far-cut-line"]
      .forEach(name => {
        const line = wrapper.root.findByProps({ name });
        expect(line.props.opacity).toEqual(0.4);
        expect(line.props.transparent).toEqual(true);
        expect(line.props.raycast()).toBeUndefined();
      });
    unmountRenderer(wrapper);
  });

  it("omits the far soil line when CUT ALL is off", () => {
    const c = config();
    const planes = getSectionClippingPlanes(c, "x", 500, 200);
    const wrapper = createRenderer(<SectionCutFaces
      config={c}
      axis={"x"}
      nearPlane={planes[0]}
      farPlane={planes[1]}
      cutAll={false}
      opacity={1}
      getZ={() => -100} />);
    expect(wrapper.root.findAllByProps({
      name: "section-soil-near-cut-line",
    })).toHaveLength(1);
    expect(wrapper.root.findAllByProps({
      name: "section-soil-far-cut-line",
    })).toHaveLength(0);
    unmountRenderer(wrapper);
  });
});
