import { Vector3 } from "three";
import {
  ControlDragConstraint, ControlPoint, ControlPointerEvent,
} from "./types";

const EPSILON = 0.000001;

const vector = (point: ControlPoint) => new Vector3(...point);

const eventPoint = (event: ControlPointerEvent, fallback: Vector3) => {
  const point = event.point;
  if (point?.clone) { return point.clone(); }
  if (
    typeof point?.x == "number" &&
    typeof point.y == "number" &&
    typeof point.z == "number"
  ) {
    return new Vector3(point.x, point.y, point.z);
  }
  return fallback.clone();
};

export const pointOnPointerPlane = (
  event: ControlPointerEvent,
  origin: ControlPoint,
  normal: ControlPoint,
) => {
  const planeOrigin = vector(origin);
  if (!event.ray) { return eventPoint(event, planeOrigin); }
  const planeNormal = vector(normal).normalize();
  const denominator = planeNormal.dot(event.ray.direction);
  if (Math.abs(denominator) < EPSILON) {
    return eventPoint(event, planeOrigin);
  }
  const distance = planeNormal.dot(
    planeOrigin.clone().sub(event.ray.origin),
  ) / denominator;
  if (distance < 0) { return eventPoint(event, planeOrigin); }
  return event.ray.origin.clone().add(
    event.ray.direction.clone().multiplyScalar(distance),
  );
};

export const pointOnPointerAxis = (
  event: ControlPointerEvent,
  origin: ControlPoint,
  direction: ControlPoint,
) => {
  const axisOrigin = vector(origin);
  const axisDirection = vector(direction).normalize();
  if (!event.ray) {
    const point = eventPoint(event, axisOrigin);
    return axisOrigin.clone().add(axisDirection.multiplyScalar(
      point.clone().sub(axisOrigin).dot(axisDirection),
    ));
  }
  const pointerDirection = event.ray.direction.clone().normalize();
  const betweenOrigins = axisOrigin.clone().sub(event.ray.origin);
  const directionDot = axisDirection.dot(pointerDirection);
  const axisDot = axisDirection.dot(betweenOrigins);
  const pointerDot = pointerDirection.dot(betweenOrigins);
  const denominator = 1 - directionDot * directionDot;
  if (Math.abs(denominator) < EPSILON) {
    const point = eventPoint(event, axisOrigin);
    return axisOrigin.clone().add(axisDirection.multiplyScalar(
      point.clone().sub(axisOrigin).dot(axisDirection),
    ));
  }
  const parameter =
    (directionDot * pointerDot - axisDot) / denominator;
  return axisOrigin.clone().add(axisDirection.multiplyScalar(parameter));
};

export const projectPointerToConstraint = (
  event: ControlPointerEvent,
  constraint: ControlDragConstraint | undefined,
  cameraDirection: ControlPoint = [0, 0, 1],
) => {
  if (!constraint) {
    return eventPoint(event, new Vector3());
  }
  if (constraint.kind == "axis") {
    return pointOnPointerAxis(
      event,
      constraint.origin,
      constraint.direction,
    );
  }
  return pointOnPointerPlane(
    event,
    constraint.origin,
    constraint.kind == "plane"
      ? constraint.normal
      : cameraDirection,
  );
};

export const axisConstraint = (
  axis: "x" | "y" | "z",
  origin: ControlPoint,
): ControlDragConstraint => ({
  kind: "axis",
  origin,
  direction: [
    axis == "x" ? 1 : 0,
    axis == "y" ? 1 : 0,
    axis == "z" ? 1 : 0,
  ],
});

export const planeConstraint = (
  axes: "xy" | "xz" | "yz",
  origin: ControlPoint,
): ControlDragConstraint => ({
  kind: "plane",
  origin,
  normal: [
    axes == "yz" ? 1 : 0,
    axes == "xz" ? 1 : 0,
    axes == "xy" ? 1 : 0,
  ],
});

export const pointerRayPointAtZ = (
  event: ThreeEventLike,
  z: number,
) => pointOnPointerPlane(
  event as ControlPointerEvent,
  [0, 0, z],
  [0, 0, 1],
);

type ThreeEventLike = Pick<
  ControlPointerEvent,
  "point" | "ray"
>;
