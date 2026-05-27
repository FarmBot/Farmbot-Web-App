import Delaunator from "delaunator";
import { TaggedGenericPointer, TaggedSensor, TaggedSensorReading } from "farmbot";
import { Config } from "./config";
import { soilHeightPoint } from "../points/soil_height";
import { zZero } from "./helpers";
import { BufferGeometry, Float32BufferAttribute } from "three";
import { precomputeTriangles } from "./triangle_functions";
import { filterMoistureReadings } from "../farm_designer/map/layers";
import { selectMostRecentPoints } from "../farm_designer/location_info";
import { isUndefined } from "lodash";

export interface FilterMoisturePointsProps {
  config: Config;
  sensors: TaggedSensor[];
  readings: TaggedSensorReading[];
}

export const filterMoisturePoints = (props: FilterMoisturePointsProps) => {
  const { readings: moistureReadings } =
    filterMoistureReadings(props.readings, props.sensors);
  const recentReadings = selectMostRecentPoints(moistureReadings);
  const moisturePoints = [];
  for (const point of recentReadings) {
    if (isUndefined(point.body.x) || isUndefined(point.body.y)) { continue; }
    moisturePoints.push([point.body.x, point.body.y, point.body.value]);
  }
  const params = boundaryPoints(props.config);
  moisturePoints.push([params.outer.x.min, params.outer.y.min, 0]);
  moisturePoints.push([params.outer.x.min, params.outer.y.max, 0]);
  moisturePoints.push([params.outer.x.max, params.outer.y.min, 0]);
  moisturePoints.push([params.outer.x.max, params.outer.y.max, 0]);
  moisturePoints.push([params.inner.x.min, params.inner.y.min, 0]);
  moisturePoints.push([params.inner.x.min, params.inner.y.max, 0]);
  moisturePoints.push([params.inner.x.max, params.inner.y.min, 0]);
  moisturePoints.push([params.inner.x.max, params.inner.y.max, 0]);
  return moisturePoints;
};

export const soilSurfaceExtents = (config: Config) => ({
  x: {
    min: config.bedWallThickness - config.bedXOffset,
    max: config.bedLengthOuter - config.bedWallThickness - config.bedXOffset,
  },
  y: {
    min: config.bedWallThickness - config.bedYOffset,
    max: config.bedWidthOuter - config.bedWallThickness - config.bedYOffset,
  },
});

export const boundaryPoints = (config: Config) => {
  const outerBoundaryParams = soilSurfaceExtents(config);
  return {
    outer: outerBoundaryParams,
    inner: {
      x: {
        min: outerBoundaryParams.x.min + 0.01,
        max: outerBoundaryParams.x.max - 0.01,
      },
      y: {
        min: outerBoundaryParams.y.min + 0.01,
        max: outerBoundaryParams.y.max - 0.01,
      },
    },
  };
};

export interface FilterSoilPointsProps {
  config: Config;
  points: TaggedGenericPointer[] | undefined;
}

export const filterSoilPoints = (props: FilterSoilPointsProps) => {
  const { config } = props;
  const boundaryParams = boundaryPoints(config);

  const soilHeightPoints: [number, number, number][] = [];
  const { outer } = boundaryParams;
  (props.points || []).forEach(p => {
    const { x, y, z } = p.body;
    if (!soilHeightPoint(p)) { return; }
    if (x <= outer.x.min || x >= outer.x.max) { return; }
    if (y <= outer.y.min || y >= outer.y.max) { return; }
    soilHeightPoints.push([
      x,
      y,
      (config.exaggeratedZ && config.perspective)
        ? (-config.soilHeight + (z + config.soilHeight) * 10)
        : z,
    ]);
  });

  const hasPoints = soilHeightPoints.length > 0;

  const soilHeightZ = -config.soilHeight;

  const boundaryZ = () => {
    // bot coordinates of bed top, which is zero in three space
    const bedTopZ = -zZero(config);
    const bedBottomZ = bedTopZ - config.bedHeight;
    // attach floating soil surface to bed top and bottom
    if (soilHeightZ > bedTopZ) { return bedTopZ; }
    if (soilHeightZ < bedBottomZ) { return bedBottomZ; }
    return soilHeightZ;
  };

  const addBoundary = (
    params: typeof boundaryParams.outer,
    z: number,
  ) => {
    soilHeightPoints.push(
      [params.x.min, params.y.min, z],
      [params.x.min, params.y.max, z],
      [params.x.max, params.y.min, z],
      [params.x.max, params.y.max, z],
    );
  };
  addBoundary(boundaryParams.outer, boundaryZ());
  if (!hasPoints) {
    // no soil points: flat soil with vertical slope to outer boundary
    addBoundary(boundaryParams.inner, soilHeightZ);
  }

  return soilHeightPoints;
};

export const computeSurface = (
  points: [number, number, number][],
) => {
  const projected2D = points.map(([x, y, _z]) => [x, y]);
  const delaunay = Delaunator.from(projected2D);
  const triangles = delaunay.triangles;
  const vertices: number[] = [];
  const vertexList: [number, number, number][] = [];
  const faces: number[] = [];
  const uvs: number[] = [];
  const xs = points.map(p => p[0]);
  const ys = points.map(p => p[1]);
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  const width = maxX - minX;
  const height = maxY - minY;
  for (let i = 0; i < triangles.length; i += 3) {
    for (let j = 0; j < 3; j++) {
      const index: number = triangles[i + j];
      faces.push(i + j);
      const [x, y, z] = points[index];
      vertices.push(x, y, z);
      vertexList.push([x, y, z]);
      const u = (x - minX) / width;
      const v = 1 - (y - minY) / height;
      uvs.push(u, v);
    }
  }
  return { vertices, vertexList, uvs, faces };
};

export const getGeometry = (vertices: number[], uvs: number[]) => {
  const geom = new BufferGeometry();
  geom.setAttribute("position", new Float32BufferAttribute(vertices, 3));
  geom.setAttribute("uv", new Float32BufferAttribute(uvs, 2));
  geom.computeVertexNormals();
  const { normal } = geom.attributes;
  if (normal) {
    for (let i = 0; i < normal.count; i++) {
      normal.setX(i, -normal.getX(i));
      normal.setY(i, -normal.getY(i));
      normal.setZ(i, -normal.getZ(i));
    }
  }
  return geom;
};

export const getSurface = (
  points: [number, number, number][],
) => {
  const { vertices, vertexList, uvs, faces } = computeSurface(points);
  const geometry = getGeometry(vertices, uvs);
  const triangles = precomputeTriangles(vertexList, faces);
  return { geometry, triangles };
};
