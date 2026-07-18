import React from "react";
import { useThree } from "@react-three/fiber";
import { Vector3 } from "three";
import { Group } from "../components";
import { clickWasDragged } from "../click_event";
import { projectPointerToConstraint } from "./drag_constraints";
import {
  stopControlDragEvent, stopControlEvent,
} from "./events";
import { useControlCursor } from "./cursor";
import {
  ControlDragConstraint, ControlDragEvent,
  ControlInteractionState, ControlPointerEvent,
} from "./types";

export interface ControlHandleProps {
  name: string;
  enabled?: boolean;
  position?: [number, number, number];
  rotation?: [number, number, number];
  userData?: Record<string, unknown>;
  cursor?: string;
  dragCursor?: string;
  constraint?: ControlDragConstraint;
  canStart?(event: ControlPointerEvent): boolean;
  onHoverChange?(hovered: boolean): void;
  onActivate?(event: ControlPointerEvent): void;
  onDragStart?(event: ControlDragEvent): void;
  onDrag?(event: ControlDragEvent): void;
  onDragEnd?(event: ControlDragEvent): void;
  onDragCancel?(): void;
  children:
    | React.ReactNode
    | ((state: ControlInteractionState) => React.ReactNode);
}

export const ControlHandle = (props: ControlHandleProps) => {
  const enabled = props.enabled !== false;
  const camera = useThree(state => state.camera);
  const [hovered, setHovered] = React.useState(false);
  const [pressed, setPressed] = React.useState(false);
  const [dragging, setDragging] = React.useState(false);
  const pressedRef = React.useRef(false);
  const draggingRef = React.useRef(false);
  const pointerInside = React.useRef(false);
  const hoveredRef = React.useRef(false);
  const onHoverChangeRef = React.useRef(props.onHoverChange);
  const onDragCancelRef = React.useRef(props.onDragCancel);
  const dragStart = React.useRef(new Vector3());
  const dragConstraint =
    React.useRef<ControlDragConstraint | undefined>(undefined);
  React.useLayoutEffect(() => {
    onHoverChangeRef.current = props.onHoverChange;
    onDragCancelRef.current = props.onDragCancel;
  }, [props.onDragCancel, props.onHoverChange]);
  const hasDrag = !!(
    props.constraint ||
    props.onDragStart ||
    props.onDrag ||
    props.onDragEnd
  );
  useControlCursor(
    enabled && (hovered || dragging),
    dragging
      ? props.dragCursor || "grabbing"
      : props.cursor || "pointer",
    dragging ? 2 : 1,
  );

  const setHover = React.useCallback((next: boolean) => {
    hoveredRef.current = next;
    setHovered(next);
    onHoverChangeRef.current?.(next);
  }, []);
  const dragEvent = (
    event: ControlPointerEvent,
    dragged = clickWasDragged(event),
  ): ControlDragEvent => {
    const cameraDirection = camera.getWorldDirection(new Vector3());
    const point = projectPointerToConstraint(
      event,
      dragConstraint.current,
      [cameraDirection.x, cameraDirection.y, cameraDirection.z],
    );
    return {
      event,
      point,
      delta: point.clone().sub(dragStart.current),
      dragged,
    };
  };
  const cancel = React.useCallback(() => {
    if (!draggingRef.current && !pressedRef.current) { return; }
    pressedRef.current = false;
    draggingRef.current = false;
    dragConstraint.current = undefined;
    setDragging(false);
    setPressed(false);
    onDragCancelRef.current?.();
  }, []);

  React.useEffect(() => {
    const stop = () => cancel();
    window.addEventListener("pointerup", stop);
    window.addEventListener("pointercancel", stop);
    return () => {
      window.removeEventListener("pointerup", stop);
      window.removeEventListener("pointercancel", stop);
    };
  }, [cancel]);

  React.useEffect(() => {
    if (enabled) { return; }
    if (hoveredRef.current) { setHover(false); }
    cancel();
  }, [cancel, enabled, setHover]);

  const interactionState = { hovered, pressed, dragging };
  return <Group
    name={props.name}
    position={props.position}
    rotation={props.rotation}
    userData={props.userData}
    onPointerOver={event => {
      stopControlEvent(event);
      pointerInside.current = true;
      if (enabled && !draggingRef.current) { setHover(true); }
    }}
    onPointerOut={event => {
      stopControlEvent(event);
      pointerInside.current = false;
      if (enabled && !draggingRef.current) { setHover(false); }
    }}
    onPointerDown={event => {
      if (!enabled) { return; }
      if (props.canStart && !props.canStart(event)) { return; }
      stopControlDragEvent(event);
      pressedRef.current = true;
      setPressed(true);
      (event.target as HTMLElement | null)
        ?.setPointerCapture?.(event.pointerId);
      if (hasDrag) {
        dragConstraint.current = props.constraint;
        const next = dragEvent(event, false);
        dragStart.current.copy(next.point);
        draggingRef.current = true;
        setDragging(true);
        props.onDragStart?.(next);
      }
    }}
    onPointerMove={event => {
      if (!enabled || !draggingRef.current) { return; }
      stopControlDragEvent(event);
      props.onDrag?.(dragEvent(event));
    }}
    onPointerUp={event => {
      if (!enabled || !pressedRef.current) { return; }
      stopControlDragEvent(event);
      if (draggingRef.current) {
        props.onDragEnd?.(dragEvent(event));
      }
      draggingRef.current = false;
      pressedRef.current = false;
      dragConstraint.current = undefined;
      setDragging(false);
      setPressed(false);
      (event.target as HTMLElement | null)
        ?.releasePointerCapture?.(event.pointerId);
      if (!pointerInside.current) { setHover(false); }
    }}
    onPointerCancel={event => {
      stopControlDragEvent(event);
      cancel();
    }}
    onLostPointerCapture={event => {
      stopControlDragEvent(event);
      cancel();
    }}
    onClick={event => {
      if (!enabled || clickWasDragged(event)) { return; }
      stopControlDragEvent(event);
      props.onActivate?.(event as unknown as ControlPointerEvent);
    }}>
    {typeof props.children == "function"
      ? props.children(interactionState)
      : props.children}
  </Group>;
};
