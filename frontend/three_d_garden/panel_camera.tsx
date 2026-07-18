import React from "react";
import { RootState, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { getPanelCameraViewOffset } from "./camera";
import { usePanelCameraViewOffset } from "./garden_model";
import { perfCount, usePerfRenderCount } from "../performance/perf";

type PanelCameraListener = () => void;

export interface PanelCameraStore {
  getSnapshot(): boolean;
  setOpen(panelOpen: boolean): void;
  subscribe(listener: PanelCameraListener): () => void;
}

export const createPanelCameraStore = (
  initialPanelOpen: boolean,
): PanelCameraStore => {
  let panelOpen = initialPanelOpen;
  const listeners = new Set<PanelCameraListener>();
  return {
    getSnapshot: () => panelOpen,
    setOpen: nextPanelOpen => {
      if (panelOpen == nextPanelOpen) { return; }
      panelOpen = nextPanelOpen;
      listeners.forEach(listener => listener());
    },
    subscribe: listener => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  };
};

export interface PanelCameraControllerProps {
  store: PanelCameraStore;
}

export const selectPanelCamera = (state: RootState) => state.camera;
export const selectPanelInvalidate = (state: RootState) => state.invalidate;
export const selectPanelViewportWidth =
  (state: RootState) => state.size.width;
export const selectPanelViewportHeight =
  (state: RootState) => state.size.height;

const PanelCameraControllerBase = (
  props: PanelCameraControllerProps,
) => {
  usePerfRenderCount("PanelCameraController");
  const panelOpen = React.useSyncExternalStore(
    props.store.subscribe,
    props.store.getSnapshot,
    props.store.getSnapshot,
  );
  const camera = useThree(selectPanelCamera);
  const invalidate = useThree(selectPanelInvalidate);
  const width = useThree(selectPanelViewportWidth);
  const height = useThree(selectPanelViewportHeight);
  const view = React.useMemo(
    () => getPanelCameraViewOffset({ width, height }, panelOpen),
    [height, panelOpen, width],
  );
  React.useEffect(() => {
    perfCount("change.PanelCameraController.panelOpen");
  }, [panelOpen]);
  React.useEffect(() => {
    perfCount("change.PanelCameraController.viewport");
  }, [height, width]);
  usePanelCameraViewOffset(
    camera instanceof PerspectiveCamera ? camera : undefined,
    view,
    invalidate,
  );
  return <></>;
};

export const PanelCameraController = React.memo(
  PanelCameraControllerBase,
);

PanelCameraController.displayName = "PanelCameraController";
