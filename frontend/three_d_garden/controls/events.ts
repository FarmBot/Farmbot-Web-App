import { ThreeEvent } from "@react-three/fiber";

export const noControlRaycast = () => undefined;

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
