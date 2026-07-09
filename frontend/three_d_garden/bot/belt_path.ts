import {
  Curve, CurvePath, EllipseCurve, LineCurve3, Vector3,
} from "three";

const maxArcSegmentLength = 2;

interface BeltPoint {
  x: number;
  y: number;
}

interface BeltWaypoint extends BeltPoint {
  type: "point";
}

interface BeltPulley {
  type: "pulley";
  center: BeltPoint;
  radius: number;
  side: -1 | 1;
}

type BeltPathNode = BeltWaypoint | BeltPulley;

interface BeltPoint3D {
  x: number;
  y: number;
  z: number;
}

interface BeltWaypoint3D extends BeltPoint3D {
  type: "point";
}

interface BeltPulley3D {
  type: "pulley";
  center: BeltPoint3D;
  radius: number;
  side: -1 | 1;
}

type BeltPathNode3D = BeltWaypoint3D | BeltPulley3D;

interface BeltProjection {
  axis: "x" | "y" | "z";
  normal: Vector3;
  origin: BeltPoint3D;
}

interface BeltSpan {
  start: BeltPoint;
  end: BeltPoint;
}

export interface BeltPathSegment {
  path: CurvePath<Vector3>;
  steps: number;
  type: "arc" | "span";
}

class BeltArcCurve extends Curve<Vector3> {
  private arc: EllipseCurve;
  private projection: BeltProjection;

  constructor(
    center: BeltPoint,
    radius: number,
    startAngle: number,
    endAngle: number,
    clockwise: boolean,
    projection: BeltProjection,
  ) {
    super();
    this.projection = projection;
    this.arc = new EllipseCurve(
      center.x,
      center.y,
      radius,
      radius,
      startAngle,
      endAngle,
      clockwise,
    );
  }

  getPoint(t: number, target = new Vector3()): Vector3 {
    const point = this.arc.getPoint(t);
    return target.copy(beltVector(this.projection, point));
  }
}

const pointNode = (point: BeltPoint): BeltWaypoint => ({
  type: "point",
  ...point,
});

const pointNode3D = (point: BeltPoint3D): BeltWaypoint3D => ({
  type: "point",
  ...point,
});

const pointToPulleyTangent = (
  point: BeltPoint,
  pulley: BeltPulley,
  side: -1 | 1,
): BeltPoint => {
  const dx = point.x - pulley.center.x;
  const dy = point.y - pulley.center.y;
  const distanceSquared = dx * dx + dy * dy;
  const radiusSquared = pulley.radius * pulley.radius;
  if (distanceSquared <= radiusSquared) {
    throw new Error("Belt point must be outside the pulley.");
  }
  const distance = Math.sqrt(distanceSquared);
  const along = pulley.radius / distance;
  const across = side * Math.sqrt(1 - along * along);
  const unitX = dx / distance;
  const unitY = dy / distance;
  return {
    x: pulley.center.x + pulley.radius *
      (unitX * along - unitY * across),
    y: pulley.center.y + pulley.radius *
      (unitY * along + unitX * across),
  };
};

const pulleyToPulleyTangent = (
  start: BeltPulley,
  end: BeltPulley,
  side: -1 | 1,
  tangent: "external" | "internal",
): BeltSpan | undefined => {
  const dx = end.center.x - start.center.x;
  const dy = end.center.y - start.center.y;
  const distanceSquared = dx * dx + dy * dy;
  const signedEndRadius = tangent == "external"
    ? end.radius
    : -end.radius;
  const radiusDifference = start.radius - signedEndRadius;
  const tangentLengthSquared =
    distanceSquared - radiusDifference * radiusDifference;
  if (tangentLengthSquared <= 0) {
    return undefined;
  }
  const tangentLength = Math.sqrt(tangentLengthSquared);
  const normalX = (dx * radiusDifference -
    side * dy * tangentLength) / distanceSquared;
  const normalY = (dy * radiusDifference +
    side * dx * tangentLength) / distanceSquared;
  return {
    start: {
      x: start.center.x + normalX * start.radius,
      y: start.center.y + normalY * start.radius,
    },
    end: {
      x: end.center.x + normalX * signedEndRadius,
      y: end.center.y + normalY * signedEndRadius,
    },
  };
};

const pulleyWrapIsClockwise = (
  pulley: BeltPulley,
  incoming: BeltSpan,
): boolean => {
  const incomingRadius = {
    x: incoming.end.x - pulley.center.x,
    y: incoming.end.y - pulley.center.y,
  };
  const incomingDirection = {
    x: incoming.end.x - incoming.start.x,
    y: incoming.end.y - incoming.start.y,
  };
  const counterclockwiseTangent = {
    x: -incomingRadius.y,
    y: incomingRadius.x,
  };
  const clockwise = incomingDirection.x * counterclockwiseTangent.x +
    incomingDirection.y * counterclockwiseTangent.y < 0;
  return clockwise;
};

const exitsPulleyAlongTangent = (
  pulley: BeltPulley,
  outgoing: BeltSpan,
  clockwise: boolean,
): boolean => {
  const outgoingRadius = {
    x: outgoing.start.x - pulley.center.x,
    y: outgoing.start.y - pulley.center.y,
  };
  const outgoingTangent = clockwise
    ? { x: outgoingRadius.y, y: -outgoingRadius.x }
    : { x: -outgoingRadius.y, y: outgoingRadius.x };
  const outgoingDirection = {
    x: outgoing.end.x - outgoing.start.x,
    y: outgoing.end.y - outgoing.start.y,
  };
  const exitsAlongTangent =
    outgoingDirection.x * outgoingTangent.x +
    outgoingDirection.y * outgoingTangent.y > 0;
  return exitsAlongTangent;
};

const pulleyContactSide = (
  origin: BeltPoint,
  pulley: BeltPulley,
  contact: BeltPoint,
): -1 | 1 => {
  const routeX = pulley.center.x - origin.x;
  const routeY = pulley.center.y - origin.y;
  const radiusX = contact.x - pulley.center.x;
  const radiusY = contact.y - pulley.center.y;
  return routeX * radiusY - routeY * radiusX < 0 ? -1 : 1;
};

const selectTangent = (candidates: BeltSpan[]): BeltSpan => {
  if (candidates.length != 1) {
    throw new Error("Belt route does not have one valid tangent.");
  }
  return candidates[0];
};

const pointToPulleySpan = (
  start: BeltWaypoint,
  end: BeltPulley,
): BeltSpan => selectTangent(([-1, 1] as const)
  .map(side => ({
    start,
    end: pointToPulleyTangent(start, end, side),
  }))
  .filter(span =>
    pulleyContactSide(start, end, span.end) == end.side));

const pulleyToPointSpan = (
  start: BeltPulley,
  end: BeltWaypoint,
  incoming: BeltSpan,
): BeltSpan => {
  const clockwise = pulleyWrapIsClockwise(start, incoming);
  return selectTangent(([-1, 1] as const)
    .map(side => ({
      start: pointToPulleyTangent(end, start, side),
      end,
    }))
    .filter(span => exitsPulleyAlongTangent(start, span, clockwise)));
};

const pulleyToPulleySpan = (
  start: BeltPulley,
  end: BeltPulley,
  incoming: BeltSpan,
): BeltSpan => {
  const clockwise = pulleyWrapIsClockwise(start, incoming);
  const candidates = ([-1, 1] as const).flatMap(side =>
    (["external", "internal"] as const).map(tangent =>
      pulleyToPulleyTangent(start, end, side, tangent)))
    .filter((span): span is BeltSpan => !!span)
    .filter(span => exitsPulleyAlongTangent(start, span, clockwise))
    .filter(span =>
      pulleyContactSide(start.center, end, span.end) == end.side);
  return selectTangent(candidates);
};

const buildBeltSpans = (nodes: BeltPathNode[]): BeltSpan[] => {
  const spans: BeltSpan[] = [];
  nodes.slice(1).forEach((end, index) => {
    const start = nodes[index];
    if (start.type == "point" && end.type == "point") {
      spans.push({ start, end });
    } else if (start.type == "point" && end.type == "pulley") {
      spans.push(pointToPulleySpan(start, end));
    } else if (start.type == "pulley" && end.type == "point") {
      spans.push(pulleyToPointSpan(start, end, spans[index - 1]));
    } else if (start.type == "pulley" && end.type == "pulley") {
      spans.push(pulleyToPulleySpan(start, end, spans[index - 1]));
    }
  });
  return spans;
};

const nodePoint3D = (node: BeltPathNode3D): BeltPoint3D =>
  node.type == "point" ? node : node.center;

const sameCoordinate = (
  points: BeltPoint3D[],
  coordinate: keyof BeltPoint3D,
) => points.every(point =>
  Math.abs(point[coordinate] - points[0][coordinate]) < 0.000001);

const beltProjection = (nodes: BeltPathNode3D[]): BeltProjection => {
  const points = nodes.map(nodePoint3D);
  const origin = points[0];
  if (sameCoordinate(points, "x")) {
    return {
      axis: "x",
      normal: new Vector3(1, 0, 0),
      origin,
    };
  }
  if (sameCoordinate(points, "y")) {
    return {
      axis: "y",
      normal: new Vector3(0, -1, 0),
      origin,
    };
  }
  if (sameCoordinate(points, "z")) {
    return {
      axis: "z",
      normal: new Vector3(0, 0, 1),
      origin,
    };
  }
  throw new Error("Belt path must lie in one axis-aligned plane.");
};

const projectBeltPoint = (
  projection: BeltProjection,
  point: BeltPoint3D,
): BeltPoint => {
  switch (projection.axis) {
    case "x": return { x: point.y, y: point.z };
    case "y": return { x: point.x, y: point.z };
    case "z": return { x: point.x, y: point.y };
  }
};

const beltVector = (
  projection: BeltProjection,
  point: BeltPoint,
): Vector3 => {
  switch (projection.axis) {
    case "x": return new Vector3(projection.origin.x, point.x, point.y);
    case "y": return new Vector3(point.x, projection.origin.y, point.y);
    case "z": return new Vector3(point.x, point.y, projection.origin.z);
  }
};

const projectNodes = (
  nodes: BeltPathNode3D[],
  projection: BeltProjection,
): BeltPathNode[] => nodes.map(node => node.type == "point"
  ? pointNode(projectBeltPoint(projection, node))
  : {
    type: "pulley",
    center: projectBeltPoint(projection, node.center),
    radius: node.radius,
    side: node.side,
  });

const lineCurve = (
  start: BeltPoint,
  end: BeltPoint,
  projection: BeltProjection,
) =>
  new LineCurve3(
    beltVector(projection, start),
    beltVector(projection, end),
  );

class BeltSegmentPath extends CurvePath<Vector3> {
  private axisNormal: Vector3;

  constructor(curve: Curve<Vector3>, axisNormal: Vector3) {
    super();
    this.axisNormal = axisNormal;
    this.add(curve);
  }

  override computeFrenetFrames(segments: number) {
    const tangents: Vector3[] = [];
    const normals: Vector3[] = [];
    const binormals: Vector3[] = [];
    for (let index = 0; index <= segments; index++) {
      const tangent = this.getTangentAt(index / segments, new Vector3());
      tangents.push(tangent);
      normals.push(this.axisNormal.clone());
      binormals.push(new Vector3()
        .crossVectors(tangent, this.axisNormal)
        .normalize());
    }
    return { tangents, normals, binormals };
  }
}

const beltSegment = (
  curve: Curve<Vector3>,
  axisNormal: Vector3,
  type: BeltPathSegment["type"],
): BeltPathSegment => ({
  path: new BeltSegmentPath(curve, axisNormal),
  steps: type == "span"
    ? 1
    : Math.max(1, Math.ceil(curve.getLength() / maxArcSegmentLength)),
  type,
});

const drawBeltPath = (
  nodes: BeltPathNode[],
  projection: BeltProjection,
): BeltPathSegment[] => {
  const spans = buildBeltSpans(nodes);
  const segments = [beltSegment(
    lineCurve(spans[0].start, spans[0].end, projection),
    projection.normal,
    "span",
  )];
  spans.forEach((span, index) => {
    if (index > 0) {
      const node = nodes[index];
      if (node.type == "pulley") {
        const incoming = spans[index - 1].end;
        const outgoing = span.start;
        segments.push(beltSegment(new BeltArcCurve(
          node.center,
          node.radius,
          Math.atan2(
            incoming.y - node.center.y,
            incoming.x - node.center.x,
          ),
          Math.atan2(
            outgoing.y - node.center.y,
            outgoing.x - node.center.x,
          ),
          pulleyWrapIsClockwise(node, spans[index - 1]),
          projection,
        ), projection.normal, "arc"));
      }
    }
    index > 0 && segments.push(beltSegment(
      lineCurve(span.start, span.end, projection),
      projection.normal,
      "span",
    ));
  });
  return segments;
};

export class BeltPath {
  private nodes: BeltPathNode3D[] = [];
  private complete = false;
  private segments: BeltPathSegment[] = [];

  start(x: number, y: number, z: number): this {
    if (this.nodes.length > 0) {
      throw new Error("Belt path has already started.");
    }
    this.nodes.push(pointNode3D({ x, y, z }));
    return this;
  }

  point(x: number, y: number, z: number): this {
    this.assertCanAddNode();
    this.nodes.push(pointNode3D({ x, y, z }));
    return this;
  }

  pulley(
    x: number,
    y: number,
    z: number,
    radius: number,
    side: -1 | 1,
  ): this {
    this.assertCanAddNode();
    if (radius <= 0) {
      throw new Error("Pulley radius must be greater than zero.");
    }
    this.nodes.push({
      type: "pulley",
      center: { x, y, z },
      radius,
      side,
    });
    return this;
  }

  end(x: number, y: number, z: number): this {
    this.assertCanAddNode();
    this.nodes.push(pointNode3D({ x, y, z }));
    const projection = beltProjection(this.nodes);
    this.segments = drawBeltPath(
      projectNodes(this.nodes, projection),
      projection,
    );
    this.complete = true;
    return this;
  }

  getSegments(): BeltPathSegment[] {
    if (!this.complete) {
      throw new Error("Belt path must end before reading segments.");
    }
    return this.segments;
  }

  private assertCanAddNode() {
    if (this.nodes.length == 0) {
      throw new Error("Belt path must start before adding nodes.");
    }
    if (this.complete) {
      throw new Error("Belt path has already ended.");
    }
  }
}
