import type {
  ThreeDLocationSelection, ThreeDObjectSelection,
} from "./selection_types";
import type { Vector3 } from "farmbot";

export interface MapSelectionResult {
  selection: ThreeDLocationSelection | ThreeDObjectSelection;
  coordinate: Vector3;
}

type LocationSelectionHandler = (selection: MapSelectionResult) => void;

interface LocationSelectionRequest {
  handler: LocationSelectionHandler;
  onCancel(): void;
}

let locationSelectionRequest: LocationSelectionRequest | undefined;

export const locationSelectionActive = () => !!locationSelectionRequest;

export const requestMapSelection = (
  handler: LocationSelectionHandler,
  onCancel: () => void,
) => {
  locationSelectionRequest?.onCancel();
  locationSelectionRequest = { handler, onCancel };
  return () => {
    if (locationSelectionRequest?.handler == handler) {
      locationSelectionRequest = undefined;
    }
  };
};

export const completeMapSelection = (
  selection: MapSelectionResult,
) => {
  const request = locationSelectionRequest;
  locationSelectionRequest = undefined;
  if (!request) { return false; }
  request.handler(selection);
  return true;
};
