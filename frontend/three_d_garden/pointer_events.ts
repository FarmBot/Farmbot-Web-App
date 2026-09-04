import { events } from "@react-three/fiber";

/** Ignore invalid targets and duplicate active pointers sent to OrbitControls. */
export const safePointerEvents: typeof events = store => {
  const eventManager = events(store);
  if (!eventManager.connect) { return eventManager; }
  const activePointers = new Set<number>();
  let connectedTarget: HTMLElement | undefined;
  const onPointerDown = (event: PointerEvent) => {
    if (activePointers.has(event.pointerId)) {
      event.stopImmediatePropagation();
      return;
    }
    activePointers.add(event.pointerId);
  };
  const onPointerEnd = (event: PointerEvent) => {
    activePointers.delete(event.pointerId);
  };
  const removePointerListeners = () => {
    if (!connectedTarget) { return; }
    connectedTarget.removeEventListener("pointerdown", onPointerDown, true);
    connectedTarget.ownerDocument.removeEventListener("pointerup", onPointerEnd);
    connectedTarget.ownerDocument.removeEventListener(
      "pointercancel", onPointerEnd);
    connectedTarget = undefined;
    activePointers.clear();
  };
  return {
    ...eventManager,
    connect: target => {
      if (!target) { return; }
      removePointerListeners();
      eventManager.connect?.(target);
      connectedTarget = target;
      target.addEventListener("pointerdown", onPointerDown, true);
      target.ownerDocument.addEventListener("pointerup", onPointerEnd);
      target.ownerDocument.addEventListener("pointercancel", onPointerEnd);
    },
    disconnect: () => {
      removePointerListeners();
      eventManager.disconnect?.();
    },
  };
};
