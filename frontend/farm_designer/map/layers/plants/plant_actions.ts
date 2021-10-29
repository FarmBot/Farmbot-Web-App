import { Content } from "../../../../constants";
import { initSave, edit, save } from "../../../../api/crud";
import {
  AxisNumberProperty, TaggedPlant, MapTransformProps,
} from "../../interfaces";
import { Plant, DEFAULT_PLANT_RADIUS } from "../../../plant";
import moment from "moment";
import { unpackUUID } from "../../../../util";
import { isNumber, isString } from "lodash";
import {
  CropLiveSearchResult, GardenMapState, MovePointProps,
} from "../../../interfaces";
import { getPathArray } from "../../../../history";
import { findBySlug } from "../../../search_selectors";
import {
  transformXY, round, getZoomLevelFromMap, defaultSpreadCmDia,
} from "../../util";
import { movePoint } from "../../actions";
import { cachedCrop } from "../../../../open_farm/cached_crop";
import { t } from "../../../../i18next_wrapper";
import { error } from "../../../../toast/toast";
import { TaggedPlantTemplate, TaggedPoint } from "farmbot";

export interface NewPlantKindAndBodyProps {
  x: number;
  y: number;
  slug: string;
  cropName: string;
  openedSavedGarden: string | undefined;
}

/** Return a new plant or plantTemplate object. */
export const newPlantKindAndBody = (props: NewPlantKindAndBodyProps): {
  kind: TaggedPlant["kind"],
  body: TaggedPlant["body"],
} => {
  const savedGardenId = isString(props.openedSavedGarden)
    ? unpackUUID(props.openedSavedGarden).remoteId
    : undefined;
  return isNumber(savedGardenId)
    ? {
      kind: "PlantTemplate",
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

export interface CreatePlantProps {
  cropName: string;
  slug: string;
  gardenCoords: AxisNumberProperty;
  gridSize: AxisNumberProperty | undefined;
  dispatch: Function;
  openedSavedGarden: string | undefined;
}

/** Create a new plant in the garden map. */
export const createPlant = (props: CreatePlantProps): void => {
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
    const p = newPlantKindAndBody({ x, y, slug, cropName, openedSavedGarden });
    // Stop non-plant objects from creating generic plants in the map
    if (p.body.name != "name" && p.body.openfarm_slug != "slug") {
      // Create and save a new plant in the garden map
      props.dispatch(initSave(p.kind, p.body));
    }
  }
};

export interface DropPlantProps {
  gardenCoords: AxisNumberProperty | undefined;
  cropSearchResults: CropLiveSearchResult[];
  openedSavedGarden: string | undefined;
  gridSize: AxisNumberProperty;
  dispatch: Function;
}

/** Create a plant upon drop. */
export const dropPlant = (props: DropPlantProps) => {
  const { gardenCoords, openedSavedGarden, gridSize, dispatch } = props;
  if (gardenCoords) {
    const slug = getPathArray()[5];
    if (!slug) { return; }
    const { crop } = findBySlug(props.cropSearchResults, slug);
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

export interface DragPlantProps {
  getPlant(): TaggedPlant | undefined;
  mapTransformProps: MapTransformProps;
  isDragging: boolean | undefined;
  dispatch: Function;
  setMapState(x: Partial<GardenMapState>): void;
  pageX: number;
  pageY: number;
  qPageX: number | undefined;
  qPageY: number | undefined;
}

/** Move a plant in the garden map. */
export const dragPlant = (props: DragPlantProps) => {
  const plant = props.getPlant();
  const map = document.querySelector(".farm-designer-map");
  const { isDragging, pageX, pageY, qPageX, qPageY } = props;
  const { quadrant, xySwap, gridSize } = props.mapTransformProps;
  if (isDragging && plant && map) {
    const zoomLvl = getZoomLevelFromMap(map);
    const { qx, qy } = transformXY(pageX, pageY, props.mapTransformProps);
    const deltaX = Math.round((qx - (qPageX || qx)) / zoomLvl);
    const deltaY = Math.round((qy - (qPageY || qy)) / zoomLvl);
    const dX = xySwap && (quadrant % 2 === 1) ? -deltaX : deltaX;
    const dY = xySwap && (quadrant % 2 === 1) ? -deltaY : deltaY;
    props.setMapState({
      qPageX: qx, qPageY: qy,
      activeDragXY: { x: plant.body.x + dX, y: plant.body.y + dY, z: 0 }
    });
    props.dispatch(movePoint({ deltaX: dX, deltaY: dY, point: plant, gridSize }));
  }
};

export interface JogPointProps {
  keyName: string;
  point: TaggedPoint | TaggedPlantTemplate | undefined;
  mapTransformProps: MapTransformProps;
  dispatch: Function;
}

export const jogPoint = (props: JogPointProps) => {
  const { keyName, point, dispatch } = props;
  if (!point) { return; }
  const { gridSize, xySwap, quadrant } = props.mapTransformProps;
  const horizontal = xySwap ? "deltaY" : "deltaX";
  const vertical = xySwap ? "deltaX" : "deltaY";
  const amount = 10;
  const leftAmount = [1, 4].includes(quadrant) ? amount : -amount;
  const rightAmount = [1, 4].includes(quadrant) ? -amount : amount;
  const upAmount = [3, 4].includes(quadrant) ? amount : -amount;
  const downAmount = [3, 4].includes(quadrant) ? -amount : amount;
  const generatePayload = (keyName: string): MovePointProps | undefined => {
    switch (keyName) {
      case "ArrowLeft":
        return { deltaX: 0, deltaY: 0, [horizontal]: leftAmount, point, gridSize };
      case "ArrowRight":
        return { deltaX: 0, deltaY: 0, [horizontal]: rightAmount, point, gridSize };
      case "ArrowUp":
        return { deltaX: 0, deltaY: 0, [vertical]: upAmount, point, gridSize };
      case "ArrowDown":
        return { deltaX: 0, deltaY: 0, [vertical]: downAmount, point, gridSize };
    }
  };
  const payload = generatePayload(keyName);
  if (payload) {
    dispatch(movePoint(payload));
  }
};

export interface SetActiveSpreadProps {
  selectedPlant: TaggedPlant | undefined;
  slug: string;
  setMapState(x: Partial<GardenMapState>): void;
}

/** Fetch the current plant's spread.  */
export const setActiveSpread = (props: SetActiveSpreadProps): void => {
  const defaultSpread = props.selectedPlant
    ? defaultSpreadCmDia(props.selectedPlant.body.radius)
    : 0;
  cachedCrop(props.slug)
    .then(({ spread }) =>
      props.setMapState({ activeDragSpread: spread || defaultSpread }));
};

export interface BeginPlantDragProps {
  plant: TaggedPlant | undefined;
  setMapState(x: Partial<GardenMapState>): void;
  selectedPlant: TaggedPlant | undefined;
}

/** Prepare for plant move. */
export const beginPlantDrag = (props: BeginPlantDragProps): void => {
  props.setMapState({ isDragging: true });
  if (props.plant) {
    setActiveSpread({
      selectedPlant: props.selectedPlant,
      slug: props.plant.body.openfarm_slug,
      setMapState: props.setMapState,
    });
  }
};

export interface MaybeSavePlantLocationProps {
  plant: TaggedPlant | undefined;
  isDragging: boolean | undefined;
  dispatch: Function;
}

/** If dragging a plant, save the new location. */
export const maybeSavePlantLocation = (props: MaybeSavePlantLocationProps) => {
  if (props.plant && props.isDragging) {
    props.dispatch(edit(props.plant, {
      x: round(props.plant.body.x),
      y: round(props.plant.body.y)
    }));
    props.dispatch(save(props.plant.uuid));
  }
};

export interface SavePointProps {
  point: TaggedPoint | TaggedPlantTemplate | undefined;
  dispatch: Function;
}

export const savePoint = (props: SavePointProps) => {
  if (props.point) {
    props.dispatch(save(props.point.uuid));
  }
};
