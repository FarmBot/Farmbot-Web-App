import { Ray, Vector3 } from "three";
import {
  axisConstraint,
  planeConstraint,
  pointOnPointerAxis,
  pointOnPointerPlane,
  pointerRayPointAtZ,
  projectPointerToConstraint,
} from "../drag_constraints";
import { ControlPointerEvent } from "../types";

const event = (
  point: Vector3,
  ray?: Ray,
) => ({ point, ray }) as ControlPointerEvent;

describe("3D control drag constraints", () => {
  it("projects pointer rays onto a plane", () => {
    const result = pointOnPointerPlane(
      event(
        new Vector3(1, 2, 3),
        new Ray(new Vector3(10, 20, 100), new Vector3(0, 0, -1)),
      ),
      [0, 0, 25],
      [0, 0, 1],
    );
    expect(result.toArray()).toEqual([10, 20, 25]);
  });

  it("uses the event point when a ray cannot reach the plane", () => {
    const parallel = pointOnPointerPlane(
      event(
        new Vector3(1, 2, 3),
        new Ray(new Vector3(0, 0, 10), new Vector3(1, 0, 0)),
      ),
      [0, 0, 0],
      [0, 0, 1],
    );
    const behind = pointOnPointerPlane(
      event(
        new Vector3(4, 5, 6),
        new Ray(new Vector3(0, 0, 10), new Vector3(0, 0, 1)),
      ),
      [0, 0, 0],
      [0, 0, 1],
    );
    expect(parallel.toArray()).toEqual([1, 2, 3]);
    expect(behind.toArray()).toEqual([4, 5, 6]);
    expect(pointOnPointerPlane(
      { point: { x: 7, y: 8, z: 9 } } as unknown as ControlPointerEvent,
      [0, 0, 0],
      [0, 0, 1],
    ).toArray()).toEqual([7, 8, 9]);
  });

  it("projects pointer rays onto one axis", () => {
    const result = pointOnPointerAxis(
      event(
        new Vector3(),
        new Ray(new Vector3(5, 10, 0), new Vector3(0, -1, 0)),
      ),
      [0, 0, 0],
      [1, 0, 0],
    );
    expect(result.toArray()).toEqual([5, 0, 0]);

    const eventPointResult = pointOnPointerAxis(
      event(new Vector3(3, 4, 5)),
      [1, 1, 1],
      [0, 1, 0],
    );
    expect(eventPointResult.toArray()).toEqual([1, 4, 1]);

    const parallelRayResult = pointOnPointerAxis(
      event(
        new Vector3(9, 8, 7),
        new Ray(new Vector3(5, 10, 0), new Vector3(1, 0, 0)),
      ),
      [1, 2, 3],
      [1, 0, 0],
    );
    expect(parallelRayResult.toArray()).toEqual([9, 2, 3]);
  });

  it("builds and applies axis, plane, and camera-plane constraints", () => {
    expect(axisConstraint("y", [1, 2, 3])).toEqual({
      kind: "axis",
      origin: [1, 2, 3],
      direction: [0, 1, 0],
    });
    expect(planeConstraint("xz", [1, 2, 3])).toEqual({
      kind: "plane",
      origin: [1, 2, 3],
      normal: [0, 1, 0],
    });
    const pointerEvent = event(
      new Vector3(),
      new Ray(new Vector3(7, 8, 9), new Vector3(0, 0, -1)),
    );
    expect(projectPointerToConstraint(
      pointerEvent,
      { kind: "camera-plane", origin: [0, 0, 4] },
      [0, 0, 1],
    ).toArray()).toEqual([7, 8, 4]);
    expect(projectPointerToConstraint(
      event(new Vector3(3, 4, 5)),
      { kind: "axis", origin: [1, 2, 3], direction: [0, 1, 0] },
    ).toArray()).toEqual([1, 4, 3]);
    expect(pointerRayPointAtZ(pointerEvent, 2).toArray()).toEqual([7, 8, 2]);
  });
});
