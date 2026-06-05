export type ThreeDObjectKind =
  "plant" | "point" | "weed" | "slot" | "utm" | "electronics" | "camera";

export interface ThreeDObjectSelection {
  kind: ThreeDObjectKind;
  id: number;
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
