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

class MutableRoutingGeometry extends BufferGeometry {
  readonly modelEdgeGeometry = new BufferGeometry();

  protected setPositions(attribute: BufferAttribute) {
    if (this.hasAttribute("position")) {
      this.dispose();
      this.deleteAttribute("normal");
    }
    this.setAttribute("position", attribute);
    this.modelEdgeGeometry.setAttribute("position", attribute);
  }

  protected updateBuffers() {
    this.getAttribute("position").needsUpdate = true;
    this.computeVertexNormals();
    this.computeBoundingBox();
    this.computeBoundingSphere();
    this.modelEdgeGeometry.boundingBox = this.boundingBox;
    this.modelEdgeGeometry.boundingSphere = this.boundingSphere;
  }

  override dispose() {
    // The surface owns the vertex buffer shared by the two geometries.
    this.modelEdgeGeometry.deleteAttribute("position");
    this.modelEdgeGeometry.dispose();
    super.dispose();
  }
}

const isSharpCorner = (previous: Vector2, point: Vector2, next: Vector2) => {
  const ax = point.x - previous.x;
  const ay = point.y - previous.y;
  const bx = next.x - point.x;
  const by = next.y - point.y;
  return ax * bx + ay * by
    < Math.hypot(ax, ay) * Math.hypot(bx, by) * Math.cos(25 * Math.PI / 180);
};

export class MutableCarrierGeometry extends MutableRoutingGeometry {
  private depth: number;
  private faces: number[][];
  private pointCount: number;

  constructor(shape: Shape, depth: number) {
    super();
    this.depth = depth;
    this.faces = [];
    this.pointCount = 0;
    this.rebuild(shape);
    this.update(shape);
  }

  private rebuild(shape: Shape) {
    const points = shapePoints(shape);
    this.faces = ShapeUtils.triangulateShape(points, []);
    this.pointCount = points.length;
    const vertexCount = this.faces.length * 6 + this.pointCount * 6;
    const attribute = new BufferAttribute(
      new Float32Array(vertexCount * 3),
      3,
    );
    attribute.setUsage(DynamicDrawUsage);
    this.setPositions(attribute);
    // Two rim edges and up to one vertical crease per point.
    this.modelEdgeGeometry.setIndex(new BufferAttribute(
      new Uint32Array(this.pointCount * 6), 1,
    ).setUsage(DynamicDrawUsage));
  }

  private updateEdgeIndices(points: Vector2[]) {
    const index = this.modelEdgeGeometry.getIndex() as BufferAttribute;
    let cursor = 0;
    let changed = false;
    const write = (a: number, b: number) => {
      if (index.getX(cursor) != a || index.getX(cursor + 1) != b) {
        index.setX(cursor, a);
        index.setX(cursor + 1, b);
        changed = true;
      }
      cursor += 2;
    };
    const capVertices = this.faces.length * 6;
    points.forEach((point, i) => {
      const side = capVertices + i * 6;
      write(side, side + 1);
      write(side + 2, side + 4);
      if (isSharpCorner(
        points[(i + points.length - 1) % points.length],
        point,
        points[(i + 1) % points.length],
      )) {
        write(side, side + 2);
      }
    });
    this.modelEdgeGeometry.setDrawRange(0, cursor);
    if (changed) { index.needsUpdate = true; }
  }

  update(shape: Shape) {
    let points = shapePoints(shape);
    if (points.length != this.pointCount) {
      this.rebuild(shape);
      points = shapePoints(shape);
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
    this.updateEdgeIndices(points);
    this.updateBuffers();
  }
}

interface BeltSegmentLayout {
  offset: number;
  steps: number;
}

const beltSegmentVertexCount = (steps: number) => steps * 24 + 12;

const beltEdgeIndices = (layouts: BeltSegmentLayout[]) => {
  const indices: number[] = [];
  const addRim = (corners: number[]) => {
    corners.forEach((corner, index) =>
      indices.push(corner, corners[(index + 1) % corners.length]));
  };
  layouts.forEach(({ offset, steps }, index) => {
    if (index == 0) { addRim([offset, offset + 2, offset + 1, offset + 4]); }
    for (let step = 0; step < steps; step++) {
      for (let side = 0; side < 4; side++) {
        const start = offset + 6 + step * 24 + side * 6;
        indices.push(start, start + 1);
      }
    }
    if (index == layouts.length - 1) {
      const end = offset + 6 + steps * 24;
      addRim([end, end + 1, end + 2, end + 5]);
    }
  });
  return indices;
};

export class MutableBeltGeometry extends MutableRoutingGeometry {
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
    this.setPositions(attribute);
    this.modelEdgeGeometry.setIndex(beltEdgeIndices(this.layouts));
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
    this.updateBuffers();
  }
}
