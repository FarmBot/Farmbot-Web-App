import { Vector3 } from "three";
import { BeltPath, type BeltPathSegment } from "../belt_path";

const expectVector = (actual: Vector3, expected: number[]) => {
  expect(actual.toArray()).toEqual(expected);
};

const expectContinuous = (segments: BeltPathSegment[]) => {
  segments.slice(1).forEach((segment, index) => {
    const incoming = segments[index].path.getPoint(1);
    const outgoing = segment.path.getPoint(0);
    expect(incoming.distanceTo(outgoing)).toBeLessThan(0.000001);
    expect(segments[index].path.getTangent(1)
      .dot(segment.path.getTangent(0))).toBeCloseTo(1);
  });
};

describe("BeltPath", () => {
  it("builds minimally segmented X-axis belt geometry", () => {
    const path = new BeltPath()
      .start(0, 0, 0)
      .pulley(349, 0, 12, 12, -1)
      .pulley(369, 0, 555, 8, 1)
      .pulley(389, 0, 12, 12, -1)
      .end(2987, 0, 0);
    const segments = path.getSegments();

    expect(segments.map(segment => segment.type)).toEqual([
      "span", "arc", "span", "arc", "span", "arc", "span",
    ]);
    expect(segments.map(segment => segment.steps))
      .toEqual([1, 10, 1, 13, 1, 10, 1]);
    expectVector(segments[0].path.getPoint(0), [0, 0, 0]);
    expectVector(segments[segments.length - 1].path.getPoint(1),
      [2987, 0, 0]);
    expectContinuous(segments);

    const frames = segments[1].path
      .computeFrenetFrames(segments[1].steps, false);
    expect(frames.tangents).toHaveLength(segments[1].steps + 1);
    frames.normals.forEach(normal => expectVector(normal, [0, -1, 0]));
    frames.binormals.forEach(normal => expect(normal.length()).toBeCloseTo(1));
  });

  it("builds a continuous Y-axis route", () => {
    const path = new BeltPath()
      .start(0, 0, 0)
      .pulley(0, 725, 12, 12, -1)
      .pulley(0, 740.5, 46, 7.5, 1)
      .pulley(0, 805, 12, 12, -1)
      .end(0, 1450, 0);
    const segments = path.getSegments();

    expect(segments).toHaveLength(7);
    expectVector(segments[0].path.getPoint(0), [0, 0, 0]);
    expectVector(segments[6].path.getPoint(1), [0, 1450, 0]);
    expectContinuous(segments);
  });

  it("supports waypoints in the XY plane", () => {
    const segments = new BeltPath()
      .start(0, 0, 10)
      .point(5, 0, 10)
      .end(5, 5, 10)
      .getSegments();

    expect(segments).toHaveLength(2);
    expect(segments.map(segment => segment.type)).toEqual(["span", "span"]);
    expectVector(segments[0].path.getPoint(0), [0, 0, 10]);
    expectVector(segments[1].path.getPoint(1), [5, 5, 10]);
  });

  it("uses one subdivision for short pulley arcs", () => {
    const segments = new BeltPath()
      .start(-10, 0, 0)
      .pulley(0, 0, 0, 0.1, -1)
      .end(10, 0, 0)
      .getSegments();
    const target = new Vector3();

    expect(segments[1].steps).toEqual(1);
    expect(segments[1].path.curves[0].getPoint(0.5, target)).toEqual(target);
  });

  it("validates path construction", () => {
    expect(() => new BeltPath().getSegments())
      .toThrow("Belt path must end before reading segments.");
    expect(() => new BeltPath().point(0, 0, 0))
      .toThrow("Belt path must start before adding nodes.");
    expect(() => new BeltPath().pulley(0, 0, 0, 1, 1))
      .toThrow("Belt path must start before adding nodes.");

    const started = new BeltPath().start(0, 0, 0);
    expect(() => started.start(0, 0, 0))
      .toThrow("Belt path has already started.");
    expect(() => started.pulley(1, 0, 0, 0, 1))
      .toThrow("Pulley radius must be greater than zero.");
    expect(() => started.pulley(1, 0, 0, -1, 1))
      .toThrow("Pulley radius must be greater than zero.");

    const complete = new BeltPath().start(0, 0, 0).end(1, 0, 0);
    expect(() => complete.point(2, 0, 0))
      .toThrow("Belt path has already ended.");
    expect(() => complete.end(2, 0, 0))
      .toThrow("Belt path has already ended.");
  });

  it("rejects invalid route geometry", () => {
    expect(() => new BeltPath()
      .start(0, 0, 0)
      .pulley(1, 0, 0, 2, 1)
      .end(10, 0, 0))
      .toThrow("Belt point must be outside the pulley.");

    expect(() => new BeltPath()
      .start(-30, 0, 0)
      .pulley(0, 0, 0, 5, 1)
      .pulley(0, 0, 0, 5, 1)
      .end(30, 0, 0))
      .toThrow("Belt route does not have one valid tangent.");

    expect(() => new BeltPath()
      .start(0, 0, 0)
      .point(1, 1, 0)
      .end(2, 1, 1))
      .toThrow("Belt path must lie in one axis-aligned plane.");
  });
});
