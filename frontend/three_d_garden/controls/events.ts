import { ThreeEvent } from "@react-three/fiber";
import { Mesh } from "three";

export const noControlRaycast = () => undefined;

export const controlRaycast = (enabled: boolean) =>
  enabled ? Mesh.prototype.raycast : noControlRaycast;

export const stopControlEvent = (
  event: ThreeEvent<MouseEvent | PointerEvent>,
) => {
  event.stopPropagation();
};

export const stopControlDragEvent = (
  event: ThreeEvent<MouseEvent | PointerEvent>,
) => {
  stopControlEvent(event);
  event.nativeEvent.stopImmediatePropagation();
};
