import {
  BufferAttribute, BufferGeometry, DynamicDrawUsage, Shape, ShapeUtils,
  Vector2, Vector3,
} from "three";
import { BeltPath, BeltPathSegment } from "../belt_path";

const beltThickness = 1.5;
const beltWidth = 5;
const carrierCurveSegments = 12;

const shapePoints = (shape: Shape) => {
  const points = shape.curves.flatMap(curve => {
    const divisions = curve.type == "EllipseCurve"
      ? carrierCurveSegments
      : 1;
    const curvePoints: Vector2[] = [];
    for (let index = 0; index < divisions; index++) {
      curvePoints.push(curve.getPoint(index / divisions, new Vector2()));
    }
    return curvePoints;
  });
  return ShapeUtils.isClockWise(points) ? points : points.reverse();
};

const setXYZ = (
  array: Float32Array,
  offset: number,
  point: Vector3,
) => {
  array[offset] = point.x;
  array[offset + 1] = point.y;
  array[offset + 2] = point.z;
  return offset + 3;
};

const setPoint = (
  array: Float32Array,
  offset: number,
  point: Vector2,
  z: number,
) => {
  array[offset] = point.x;
  array[offset + 1] = point.y;
  array[offset + 2] = z;
  return offset + 3;
};

const updateGeometry = (geometry: BufferGeometry) => {
  geometry.getAttribute("position").needsUpdate = true;
  geometry.computeVertexNormals();
  geometry.computeBoundingBox();
  geometry.computeBoundingSphere();
};

export class MutableCarrierGeometry extends BufferGeometry {
  private depth: number;
  private faces: number[][];
  private pointCount: number;

  constructor(shape: Shape, depth: number) {
    super();
    const points = shapePoints(shape);
    this.depth = depth;
    this.faces = ShapeUtils.triangulateShape(points, []);
    this.pointCount = points.length;
    const vertexCount = this.faces.length * 6 + this.pointCount * 6;
    const attribute = new BufferAttribute(
      new Float32Array(vertexCount * 3),
      3,
    );
    attribute.setUsage(DynamicDrawUsage);
    this.setAttribute("position", attribute);
    this.update(shape);
  }

  update(shape: Shape) {
    const points = shapePoints(shape);
    if (points.length !== this.pointCount) {
      throw new Error("Cable carrier outline topology changed.");
    }
    const array = this.getAttribute("position").array as Float32Array;
    let offset = 0;
    this.faces.forEach(face => {
      offset = setPoint(array, offset, points[face[2]], 0);
      offset = setPoint(array, offset, points[face[1]], 0);
      offset = setPoint(array, offset, points[face[0]], 0);
      offset = setPoint(array, offset, points[face[0]], this.depth);
      offset = setPoint(array, offset, points[face[1]], this.depth);
      offset = setPoint(array, offset, points[face[2]], this.depth);
    });
    points.forEach((point, index) => {
      const previous = points[(index + points.length - 1) % points.length];
      offset = setPoint(array, offset, point, 0);
      offset = setPoint(array, offset, previous, 0);
      offset = setPoint(array, offset, point, this.depth);
      offset = setPoint(array, offset, previous, 0);
      offset = setPoint(array, offset, previous, this.depth);
      offset = setPoint(array, offset, point, this.depth);
    });
    updateGeometry(this);
  }
}

interface BeltSegmentLayout {
  offset: number;
  steps: number;
}

const beltSegmentVertexCount = (steps: number) => steps * 24 + 12;

export class MutableBeltGeometry extends BufferGeometry {
  private binormal = new Vector3();
  private centerA = new Vector3();
  private centerB = new Vector3();
  private cornersA = [
    new Vector3(), new Vector3(), new Vector3(), new Vector3(),
  ];
  private cornersB = [
    new Vector3(), new Vector3(), new Vector3(), new Vector3(),
  ];
  private layouts: BeltSegmentLayout[];
  private tangent = new Vector3();

  constructor(path: BeltPath) {
    super();
    const segments = path.getSegments();
    let vertexOffset = 0;
    this.layouts = segments.map(segment => {
      const layout = { offset: vertexOffset, steps: segment.maxSteps };
      vertexOffset += beltSegmentVertexCount(segment.maxSteps);
      return layout;
    });
    const attribute = new BufferAttribute(
      new Float32Array(vertexOffset * 3),
      3,
    );
    attribute.setUsage(DynamicDrawUsage);
    this.setAttribute("position", attribute);
    this.update(path);
  }

  private setCorners(
    segment: BeltPathSegment,
    t: number,
    center: Vector3,
    corners: Vector3[],
  ) {
    segment.path.getPointAt(t, center);
    segment.path.getTangentAt(t, this.tangent).normalize();
    this.binormal.crossVectors(this.tangent, segment.normal).normalize();
    const setCorner = (index: number, width: number, thickness: number) => {
      corners[index].copy(center)
        .addScaledVector(segment.normal, width)
        .addScaledVector(this.binormal, thickness);
    };
    setCorner(0, -beltWidth / 2, -beltThickness / 2);
    setCorner(1, beltWidth / 2, -beltThickness / 2);
    setCorner(2, beltWidth / 2, beltThickness / 2);
    setCorner(3, -beltWidth / 2, beltThickness / 2);
  }

  private writeSegment(
    array: Float32Array,
    segment: BeltPathSegment,
    layout: BeltSegmentLayout,
  ) {
    let offset = layout.offset * 3;
    this.setCorners(segment, 0, this.centerA, this.cornersA);
    offset = setXYZ(array, offset, this.cornersA[0]);
    offset = setXYZ(array, offset, this.cornersA[2]);
    offset = setXYZ(array, offset, this.cornersA[1]);
    offset = setXYZ(array, offset, this.cornersA[0]);
    offset = setXYZ(array, offset, this.cornersA[3]);
    offset = setXYZ(array, offset, this.cornersA[2]);
    for (let step = 0; step < layout.steps; step++) {
      this.setCorners(
        segment,
        step / layout.steps,
        this.centerA,
        this.cornersA,
      );
      this.setCorners(
        segment,
        (step + 1) / layout.steps,
        this.centerB,
        this.cornersB,
      );
      for (let side = 0; side < 4; side++) {
        const nextSide = (side + 1) % 4;
        offset = setXYZ(array, offset, this.cornersA[side]);
        offset = setXYZ(array, offset, this.cornersB[side]);
        offset = setXYZ(array, offset, this.cornersB[nextSide]);
        offset = setXYZ(array, offset, this.cornersA[side]);
        offset = setXYZ(array, offset, this.cornersB[nextSide]);
        offset = setXYZ(array, offset, this.cornersA[nextSide]);
      }
    }
    this.setCorners(segment, 1, this.centerB, this.cornersB);
    offset = setXYZ(array, offset, this.cornersB[0]);
    offset = setXYZ(array, offset, this.cornersB[1]);
    offset = setXYZ(array, offset, this.cornersB[2]);
    offset = setXYZ(array, offset, this.cornersB[0]);
    offset = setXYZ(array, offset, this.cornersB[2]);
    setXYZ(array, offset, this.cornersB[3]);
  }

  update(path: BeltPath) {
    const segments = path.getSegments();
    if (segments.length !== this.layouts.length || segments.some(
      (segment, index) => segment.maxSteps !== this.layouts[index].steps,
    )) {
      throw new Error("Belt path topology changed.");
    }
    const array = this.getAttribute("position").array as Float32Array;
    segments.forEach((segment, index) =>
      this.writeSegment(array, segment, this.layouts[index]));
    updateGeometry(this);
  }
}
