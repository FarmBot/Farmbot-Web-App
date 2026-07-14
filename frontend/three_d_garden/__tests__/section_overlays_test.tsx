import React from "react";
import { clone } from "lodash";
import { useTexture } from "@react-three/drei";
import { INITIAL } from "../config";
import {
  getSectionOverlayLayout, SectionGroundOverlays,
} from "../section_overlays";
import {
  createRenderer, unmountRenderer,
} from "../../__test_support__/test_renderer";
import { SECTION_CLIPPING_EXEMPT } from "../section";
import { TexturedBedMaterial } from "../bed";
import { ASSETS } from "../constants";

describe("section ground overlays", () => {
  const config = () => {
    const result = clone(INITIAL);
    result.bedLengthOuter = 1000;
    result.bedWidthOuter = 600;
    result.bedWallThickness = 40;
    result.bedHeight = 300;
    result.bedZOffset = 25;
    result.bedXOffset = 0;
    result.bedYOffset = 0;
    result.beamLength = 700;
    result.kitVersion = "v1.9";
    return result;
  };

  it("lays out bed, soil, gantry, and UTM projections", () => {
    const layout = getSectionOverlayLayout(
      config(),
      { x: 200, y: 100, z: 0 },
    );
    expect(layout.bedZ).toEqual(-322.5);
    expect(layout.soilZ).toEqual(-320);
    expect(layout.bedSize).toEqual([1000, 600]);
    expect(layout.soilSize).toEqual([920, 520]);
    expect(layout.gantryPosition).toEqual([-329, 0, -315]);
    expect(layout.utmPosition).toEqual([-300, -200, -315]);
  });

  it("renders textured bed and soil ground rectangles", () => {
    const wrapper = createRenderer(<SectionGroundOverlays
      config={config()}
      configPosition={{ x: 200, y: 100, z: 0 }}
      sectionOpacity={0.4} />);
    const group = wrapper.root.findByProps({
      name: "section-ground-overlays",
    });
    expect(group.props.userData[SECTION_CLIPPING_EXEMPT]).toEqual(true);
    const bed = wrapper.root.findByProps({
      name: "section-bed-ground-rectangle",
    });
    const soil = wrapper.root.findByProps({
      name: "section-soil-ground-rectangle",
    });
    expect(bed.props.position).toEqual([0, 0, -322.5]);
    expect(soil.props.position).toEqual([0, 0, -320]);
    expect(bed.findAllByType(TexturedBedMaterial)).toHaveLength(1);
    const bedMaterial = bed.findByType(TexturedBedMaterial);
    expect(bedMaterial.props.bedColor).toEqual("#bbb");
    expect(bedMaterial.props.repeat).toEqual([0.3, 1.8]);
    const soilMaterial = soil.find(node =>
      node.type == "div" && node.props.shininess == 0);
    expect(soilMaterial.props.map.rotation).toEqual(0);
    expect(soilMaterial.props.map.repeat.set).not.toHaveBeenCalled();
    expect(soilMaterial.props.polygonOffset).toEqual(true);
    expect(soilMaterial.props.polygonOffsetFactor).toEqual(-1);
    expect(soilMaterial.props.polygonOffsetUnits).toEqual(-1);
    expect(useTexture).toHaveBeenCalledWith(ASSETS.textures.wood);
    expect(useTexture).toHaveBeenCalledWith(
      ASSETS.textures.soil + "?=soilT");
    [bed, soil].map(mesh =>
      expect(mesh.props.raycast()).toBeUndefined());

    const ghostProjections = wrapper.root.findAll(node =>
      `${node.type}` == "mesh"
      && [
        "section-gantry-ground-projection",
        "section-utm-ground-projection",
      ].includes(`${node.props.name}`));
    expect(ghostProjections).toHaveLength(2);
    ghostProjections.forEach(projection =>
      expect(projection.props.raycast()).toBeUndefined());
    ghostProjections.forEach(projection => {
      const material = projection.find(node =>
        node.type == "div" && node.props.transparent === true);
      expect(material.props.opacity).toEqual(0.2);
      expect(material.props.transparent).toEqual(true);
      expect(material.props.depthWrite).toEqual(false);
    });
    unmountRenderer(wrapper);
  });
});
