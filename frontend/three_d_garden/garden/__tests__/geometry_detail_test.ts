import { SphereGeometry, TorusGeometry } from "three";
import {
  MARKER_SPHERE_SEGMENTS,
  RADIUS_TORUS_SEGMENTS,
  SPREAD_SPHERE_SEGMENTS,
} from "../geometry_detail";

const triangleCount = (geometry: SphereGeometry | TorusGeometry) =>
  (geometry.index?.count || 0) / 3;

describe("3D garden geometry detail", () => {
  it("uses efficient sphere tessellation", () => {
    const spread = new SphereGeometry(1, ...SPREAD_SPHERE_SEGMENTS);
    const marker = new SphereGeometry(1, ...MARKER_SPHERE_SEGMENTS);

    expect(triangleCount(spread)).toEqual(960);
    expect(triangleCount(marker)).toEqual(224);
  });

  it("keeps radius rings smooth around their circumference", () => {
    const radius = new TorusGeometry(1, 0.05, ...RADIUS_TORUS_SEGMENTS);

    expect(triangleCount(radius)).toEqual(2048);
    expect(radius.parameters.tubularSegments).toEqual(64);
    expect(radius.parameters.radialSegments).toEqual(16);
  });
});
