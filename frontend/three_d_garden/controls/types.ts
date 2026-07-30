import { ThreeEvent } from "@react-three/fiber";
import { Vector3 } from "three";

export type ControlPoint = [number, number, number];
export type ControlPointerEvent = ThreeEvent<PointerEvent>;
export type ControlMouseEvent = ThreeEvent<MouseEvent>;

export interface ControlInteractionState {
  hovered: boolean;
  pressed: boolean;
  dragging: boolean;
}

export interface ControlDragEvent {
  event: ControlPointerEvent;
  point: Vector3;
  delta: Vector3;
  dragged: boolean;
}

export type ControlDragConstraint =
  | {
    kind: "axis";
    origin: ControlPoint;
    direction: ControlPoint;
  }
  | {
    kind: "plane";
    origin: ControlPoint;
    normal: ControlPoint;
  }
  | {
    kind: "camera-plane";
    origin: ControlPoint;
  };
