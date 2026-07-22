export type ThreeDObjectKind =
  "plant" | "point" | "weed" | "slot" | "utm" | "electronics" | "camera"
  | "connectivity" | "sceneObject" | "bed" | "safeHeight";

export interface ThreeDObjectSelection {
  kind: ThreeDObjectKind;
  id: number;
  uuid?: string;
}

export interface ThreeDLocationSelection {
  kind: "location";
  x: number;
  y: number;
  z: number;
}

export interface ThreeDObjectSelectionHandler {
  (selection: ThreeDObjectSelection): boolean | void;
}

export interface ThreeDObjectHoverHandler {
  (hovered: boolean): void;
}

export interface ThreeDObjectHoverLabelHandler {
  (selection: ThreeDObjectSelection | undefined): void;
}
