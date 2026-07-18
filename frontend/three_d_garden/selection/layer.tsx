import React from "react";
import { ThreeDObjectSelectionLayerProps } from "./props";
import {
  objectHasSelectionOverlay, ResolveSelectedObjectProps,
  ResolvedPopupObject, resolveLocationObject, resolveSelectedObject,
} from "./resolve";
import { SelectedObjectOverlay, SelectedObjectRings } from "./overlay";
import { LocationPopup, ObjectPopup } from "./popups";
import { ThreeDObjectSelection } from "../selection_types";

const POPUP_FADE_MS = 180;
const panelAlwaysOpen = () => true;
const subscribeToNothing = () => () => undefined;
const alwaysOpenPanelStore = {
  getSnapshot: panelAlwaysOpen,
  subscribe: subscribeToNothing,
};

const usePanelOpen = (
  store: ThreeDObjectSelectionLayerProps["panelCameraStore"],
) => {
  const activeStore = store || alwaysOpenPanelStore;
  return React.useSyncExternalStore(
    activeStore.subscribe,
    activeStore.getSnapshot,
    activeStore.getSnapshot,
  );
};

const panelOverlayObject = (
  panelOpen: boolean,
  selectedObject: ResolvedPopupObject | undefined,
  selectedLocation: ResolvedPopupObject | undefined,
) => panelOpen ? selectedObject || selectedLocation : undefined;

function visiblePanelRings<T>(
  panelOpen: boolean,
  rings: T[],
) {
  return panelOpen ? rings : [];
}

const selectionKey = (selection: ThreeDObjectSelection | undefined) =>
  selection ? `${selection.kind}-${selection.id}` : "";

const popupKey = (object: ResolvedPopupObject | undefined) => {
  if (!object) { return ""; }
  return object.kind == "location"
    ? object.kind
    : selectionKey(object.selection);
};

interface SelectedObjectRingBatchProps {
  objects: React.ComponentProps<typeof SelectedObjectRings>["objects"];
}

const SelectedObjectRingBatch = (props: SelectedObjectRingBatchProps) =>
  props.objects.length > 0
    ? <SelectedObjectRings objects={props.objects} />
    : <></>;

export const clearPendingSelectionLayerAnimation = (
  timeouts: number[],
  frames: number[],
) => {
  for (const id of timeouts) { window.clearTimeout(id); }
  for (const id of frames) { window.cancelAnimationFrame(id); }
};

export const ThreeDObjectSelectionLayer = (
  props: ThreeDObjectSelectionLayerProps,
) => {
  const panelOpen = usePanelOpen(props.panelCameraStore);
  const resolverProps = React.useMemo((): ResolveSelectedObjectProps => ({
    config: props.config,
    configPosition: props.configPosition,
    currentBotLocation: props.currentBotLocation,
    deviceAccount: props.deviceAccount,
    getZ: props.getZ,
    plants: props.plants,
    points: props.points,
    toolSlots: props.toolSlots,
    weeds: props.weeds,
  }), [
    props.config,
    props.configPosition,
    props.currentBotLocation,
    props.deviceAccount,
    props.getZ,
    props.plants,
    props.points,
    props.toolSlots,
    props.weeds,
  ]);
  const selectedObject = React.useMemo(
    () => resolveSelectedObject(resolverProps, props.selection),
    [props.selection, resolverProps]);
  const panelSelectedObject = React.useMemo(
    () => resolveSelectedObject(resolverProps, props.panelSelection),
    [props.panelSelection, resolverProps]);
  const selectedOverlayObjects = React.useMemo(() => {
    const objects = [] as NonNullable<typeof selectedObject>[];
    props.selectedObjects?.forEach(selection => {
      const object = resolveSelectedObject(resolverProps, selection);
      if (object && objectHasSelectionOverlay(object)) {
        objects.push(object);
      }
    });
    return objects;
  }, [props.selectedObjects, resolverProps]);
  const popupObject = React.useMemo(
    () => resolveSelectedObject(resolverProps, props.popupSelection),
    [props.popupSelection, resolverProps]);
  const locationObject = React.useMemo(
    () => resolveLocationObject(resolverProps, props.locationSelection),
    [props.locationSelection, resolverProps]);
  const selectedLocationObject = React.useMemo(
    () => resolveLocationObject(resolverProps, props.selectedLocation),
    [props.selectedLocation, resolverProps]);
  const activePopupObject = popupObject || locationObject;
  const selectedOverlayObject =
    locationObject
    || selectedObject
    || panelOverlayObject(
      panelOpen, panelSelectedObject, selectedLocationObject);
  const overlayObject = objectHasSelectionOverlay(selectedOverlayObject)
    ? selectedOverlayObject
    : undefined;
  const overlayObjectKey = overlayObject && overlayObject.kind != "location"
    ? selectionKey(overlayObject.selection)
    : "";
  const selectedRings = React.useMemo(() =>
    selectedOverlayObjects.filter(object =>
      selectionKey(object.selection) != overlayObjectKey),
  [overlayObjectKey, selectedOverlayObjects]);
  const [renderedPopupObject, setRenderedPopupObject] =
    React.useState<ResolvedPopupObject | undefined>(activePopupObject);
  const [popupVisible, setPopupVisible] = React.useState(false);
  const renderedPopupKey = popupKey(renderedPopupObject);
  const activePopupKey = popupKey(activePopupObject);

  React.useEffect(() => {
    const timeouts: number[] = [];
    const frames: number[] = [];
    const delay = (fn: () => void, ms = 0) => {
      timeouts.push(window.setTimeout(fn, ms));
    };
    const nextFrame = (fn: () => void) => {
      frames.push(window.requestAnimationFrame(fn));
    };
    const cleanup = () =>
      clearPendingSelectionLayerAnimation(timeouts, frames);
    if (activePopupObject) {
      if (!renderedPopupObject) {
        delay(() => {
          setRenderedPopupObject(activePopupObject);
          nextFrame(() => setPopupVisible(true));
        });
        return cleanup;
      }
      if (renderedPopupKey != activePopupKey) {
        delay(() => setPopupVisible(false));
        delay(() => {
          setRenderedPopupObject(activePopupObject);
          nextFrame(() => setPopupVisible(true));
        }, POPUP_FADE_MS);
        return cleanup;
      }
      delay(() => {
        setRenderedPopupObject(activePopupObject);
        setPopupVisible(true);
      });
      return cleanup;
    }
    delay(() => setPopupVisible(false));
    delay(() => setRenderedPopupObject(undefined), POPUP_FADE_MS);
    return cleanup;
  }, [
    activePopupKey,
    activePopupObject,
    renderedPopupKey,
    renderedPopupObject,
  ]);

  return <>
    <SelectedObjectRingBatch
      objects={visiblePanelRings(panelOpen, selectedRings)} />
    {overlayObject &&
      <SelectedObjectOverlay
        object={overlayObject}
        config={props.config}
        showCrosshairs={props.gridLoaded} />}
    {renderedPopupObject?.kind == "location" &&
      <LocationPopup
        key={renderedPopupKey}
        {...props}
        object={renderedPopupObject}
        visible={popupVisible && renderedPopupKey == activePopupKey} />}
    {renderedPopupObject && renderedPopupObject.kind != "location" &&
      <ObjectPopup
        key={renderedPopupKey}
        {...props}
        object={renderedPopupObject}
        visible={popupVisible && renderedPopupKey == activePopupKey} />}
  </>;
};
