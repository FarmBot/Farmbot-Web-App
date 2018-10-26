import { t } from "i18next";
import { error } from "farmbot-toastr";
import { Content } from "../../../../constants";
import { initSave, edit, save } from "../../../../api/crud";
import {
  AxisNumberProperty, TaggedPlant, MapTransformProps
} from "../../interfaces";
import { SpecialStatus } from "farmbot";
import { Plant, DEFAULT_PLANT_RADIUS } from "../../../plant";
import * as moment from "moment";
import { unpackUUID } from "../../../../util";
import { isNumber, isString } from "lodash";
import { CropLiveSearchResult, GardenMapState } from "../../../interfaces";
import { getPathArray } from "../../../../history";
import { findBySlug } from "../../../search_selectors";
import { transformXY, round } from "../../util";
import { movePlant } from "../../../actions";
import { cachedCrop } from "../../../../open_farm/icons";

/** Return a new plant or plantTemplate object. */
export const newPlant = (props: {
  x: number,
  y: number,
  slug: string,
  cropName: string,
  openedSavedGarden: string | undefined
}): TaggedPlant => {
  const savedGardenId = isString(props.openedSavedGarden)
    ? unpackUUID(props.openedSavedGarden).remoteId
    : undefined;
  return isNumber(savedGardenId)
    ? {
      kind: "PlantTemplate",
      uuid: "--never",
      specialStatus: SpecialStatus.SAVED,
      body: {
        x: props.x,
        y: props.y,
        z: 0,
        openfarm_slug: props.slug,
        name: props.cropName,
        radius: DEFAULT_PLANT_RADIUS,
        saved_garden_id: savedGardenId,
      }
    }
    : {
      kind: "Point",
      uuid: "--never",
      specialStatus: SpecialStatus.SAVED,
      body: Plant({
        x: props.x,
        y: props.y,
        openfarm_slug: props.slug,
        name: props.cropName,
        created_at: moment().toISOString(),
        radius: DEFAULT_PLANT_RADIUS
      })
    };
};

/** Create a new plant in the garden map. */
export const createPlant = (props: {
  cropName: string,
  slug: string,
  gardenCoords: AxisNumberProperty,
  gridSize: AxisNumberProperty | undefined,
  dispatch: Function,
  openedSavedGarden: string | undefined
}): void => {
  const { cropName, slug, gardenCoords, gridSize, openedSavedGarden } = props;
  const { x, y } = gardenCoords;
  const tooLow = x < 0 || y < 0; // negative (beyond grid start)
  const tooHigh = gridSize
    ? x > gridSize.x || y > gridSize.y // beyond grid end
    : false;
  const outsideGrid = tooLow || tooHigh;
  if (outsideGrid) {
    error(t(Content.OUTSIDE_PLANTING_AREA));
  } else {
    const p = newPlant({ x, y, slug, cropName, openedSavedGarden });
    // Stop non-plant objects from creating generic plants in the map
    if (p.body.name != "name" && p.body.openfarm_slug != "slug") {
      // Create and save a new plant in the garden map
      props.dispatch(initSave(p));
    }
  }
};

/** Create a plant upon drop. */
export const dropPlant = (props: {
  gardenCoords: AxisNumberProperty | undefined,
  cropSearchResults: CropLiveSearchResult[],
  openedSavedGarden: string | undefined,
  gridSize: AxisNumberProperty,
  dispatch: Function,
}) => {
  const { gardenCoords, openedSavedGarden, gridSize, dispatch } = props;
  if (gardenCoords) {
    const slug = getPathArray()[5];
    const { crop } = findBySlug(props.cropSearchResults || [], slug);
    createPlant({
      cropName: crop.name,
      slug: crop.slug,
      gardenCoords,
      gridSize,
      dispatch,
      openedSavedGarden,
    });
  } else {
    throw new Error(`Missing 'drop-area-svg', 'farm-designer-map', or
        'farm-designer' while trying to add a plant.`);
  }
};

/** Move a plant in the garden map. */
export const dragPlant = (props: {
  getPlant: () => TaggedPlant | undefined,
  mapTransformProps: MapTransformProps,
  isDragging: boolean | undefined,
  dispatch: Function,
  setMapState: (x: Partial<GardenMapState>) => void,
  gridSize: AxisNumberProperty,
  pageX: number,
  pageY: number,
  qPageX: number | undefined,
  qPageY: number | undefined,
}) => {
  const plant = props.getPlant();
  const map = document.querySelector(".farm-designer-map");
  const { isDragging, gridSize, pageX, pageY, qPageX, qPageY } = props;
  const { quadrant, xySwap } = props.mapTransformProps;
  if (isDragging && plant && map) {
    const zoomLvl = parseFloat(window.getComputedStyle(map).zoom || "1");
    const { qx, qy } = transformXY(pageX, pageY, props.mapTransformProps);
    const deltaX = Math.round((qx - (qPageX || qx)) / zoomLvl);
    const deltaY = Math.round((qy - (qPageY || qy)) / zoomLvl);
    const dX = xySwap && (quadrant % 2 === 1) ? -deltaX : deltaX;
    const dY = xySwap && (quadrant % 2 === 1) ? -deltaY : deltaY;
    props.setMapState({
      qPageX: qx, qPageY: qy,
      activeDragXY: { x: plant.body.x + dX, y: plant.body.y + dY, z: 0 }
    });
    props.dispatch(movePlant({ deltaX: dX, deltaY: dY, plant, gridSize }));
  }
};

/** Fetch the current plant's spread.  */
export const setActiveSpread = (props: {
  selectedPlant: TaggedPlant | undefined,
  slug: string,
  setMapState: (x: Partial<GardenMapState>) => void,
}): void => {
  const { selectedPlant } = props;
  const defaultSpreadCm = selectedPlant ? selectedPlant.body.radius : 0;
  cachedCrop(props.slug)
    .then(({ spread }) =>
      // Convert spread diameter from cm to mm.
      // `radius * 10` is the default value for spread diameter (in mm).
      props.setMapState({
        activeDragSpread: (spread || defaultSpreadCm) * 10
      })
    );
};

/** Prepare for plant move. */
export const beginPlantDrag = (props: {
  plant: TaggedPlant | undefined,
  setMapState: (x: Partial<GardenMapState>) => void,
  selectedPlant: TaggedPlant | undefined,
}): void => {
  props.setMapState({ isDragging: true });
  if (props.plant) {
    setActiveSpread({
      selectedPlant: props.selectedPlant,
      slug: props.plant.body.openfarm_slug,
      setMapState: props.setMapState,
    });
  }
};

/** If dragging a plant, save the new location. */
export const maybeSavePlantLocation = (props: {
  plant: TaggedPlant | undefined,
  isDragging: boolean | undefined,
  dispatch: Function,
}) => {
  if (props.plant && props.isDragging) {
    props.dispatch(edit(props.plant, {
      x: round(props.plant.body.x),
      y: round(props.plant.body.y)
    }));
    props.dispatch(save(props.plant.uuid));
  }
};
