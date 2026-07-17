import React from "react";
import { RootState, useThree } from "@react-three/fiber";
import { PerspectiveCamera } from "three";
import { getPanelCameraViewOffset } from "./camera";
import { usePanelCameraViewOffset } from "./garden_model";

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
export const selectPanelViewport = (state: RootState) => state.size;

export const PanelCameraController = (
  props: PanelCameraControllerProps,
) => {
  const panelOpen = React.useSyncExternalStore(
    props.store.subscribe,
    props.store.getSnapshot,
    props.store.getSnapshot,
  );
  const camera = useThree(selectPanelCamera);
  const invalidate = useThree(selectPanelInvalidate);
  const size = useThree(selectPanelViewport);
  const view = React.useMemo(
    () => getPanelCameraViewOffset(size, panelOpen),
    [panelOpen, size],
  );
  usePanelCameraViewOffset(
    camera instanceof PerspectiveCamera ? camera : undefined,
    view,
    invalidate,
  );
  return <></>;
};
