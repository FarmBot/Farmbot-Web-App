import type { ThreeEvent } from "@react-three/fiber";

export const MAX_POINTER_CLICK_DELTA = 1;

export const clickWasDragged = (
  event: Pick<ThreeEvent<MouseEvent>, "delta">,
) => (event.delta || 0) > MAX_POINTER_CLICK_DELTA;
