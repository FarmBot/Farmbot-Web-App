import { Actions, Content } from "../../../../constants";
import { initSave, edit, save, init } from "../../../../api/crud";
import {
  AxisNumberProperty, TaggedPlant, MapTransformProps,
} from "../../interfaces";
import { Plant, DEFAULT_PLANT_RADIUS } from "../../../plant";
import moment from "moment";
import { unpackUUID } from "../../../../util";
import { isNumber, isString, random } from "lodash";
import {
  DesignerState, GardenMapState, MovePointsProps,
} from "../../../interfaces";
import { findBySlug } from "../../../search_selectors";
import {
  transformXY, round, getZoomLevelFromMap, defaultSpreadCmDia,
} from "../../util";
import { movePoints } from "../../actions";
import { cachedCrop } from "../../../../open_farm/cached_crop";
import { t } from "../../../../i18next_wrapper";
import { error } from "../../../../toast/toast";
import { TaggedCurve, TaggedPlantTemplate, TaggedPoint } from "farmbot";
import { Path } from "../../../../internal_urls";
import { GetWebAppConfigValue } from "../../../../config_storage/actions";
import { NumericSetting } from "../../../../session_keys";
import { DevSettings } from "../../../../settings/dev/dev_support";

export interface NewPlantKindAndBodyProps {
  x: number;
  y: number;
  slug: string;
  cropName: string;
  openedSavedGarden: string | undefined;
  depth: number;
  water_curve_id?: number;
  spread_curve_id?: number;
  height_curve_id?: number;
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
        radius: DEFAULT_PLANT_RADIUS,
        depth: props.depth,
        water_curve_id: props.water_curve_id,
        spread_curve_id: props.spread_curve_id,
        height_curve_id: props.height_curve_id,
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
  depth: number;
  water_curve_id?: number;
  spread_curve_id?: number;
  height_curve_id?: number;
}

/** Create a new plant in the garden map. */
export const createPlant = (props: CreatePlantProps): void => {
  const {
    cropName, slug, gardenCoords, gridSize, openedSavedGarden, depth,
  } = props;
  const { x, y } = gardenCoords;
  const tooLow = x < 0 || y < 0; // negative (beyond grid start)
  const tooHigh = gridSize
    ? x > gridSize.x || y > gridSize.y // beyond grid end
    : false;
  const outsideGrid = tooLow || tooHigh;
  if (outsideGrid) {
    error(t(Content.OUTSIDE_PLANTING_AREA));
  } else {
    const p = newPlantKindAndBody({
      x, y, slug, cropName, openedSavedGarden, depth,
      water_curve_id: props.water_curve_id,
      spread_curve_id: props.spread_curve_id,
      height_curve_id: props.height_curve_id,
    });
    // Stop non-plant objects from creating generic plants in the map
    if (p.body.name != "name" && p.body.openfarm_slug != "slug") {
      // Create and save a new plant in the garden map
      DevSettings.futureFeaturesEnabled() // remove after curves API implementation
        ? props.dispatch(init(p.kind, { ...p.body, id: random(1, 1000) }))
        : props.dispatch(initSave(p.kind, p.body));
    }
  }
};

export interface DropPlantProps {
  gardenCoords: AxisNumberProperty | undefined;
  gridSize: AxisNumberProperty;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  plants: TaggedPlant[];
  curves: TaggedCurve[];
  designer: DesignerState;
}

/** Create a plant upon drop. */
export const dropPlant = (props: DropPlantProps) => {
  const {
    gardenCoords, gridSize, dispatch, getConfigValue,
  } = props;
  const { companionIndex, cropSearchResults, openedSavedGarden } = props.designer;
  if (gardenCoords) {
    const slug = Path.getSlug(Path.plants(1));
    if (!slug) { console.log("Missing slug."); return; }
    const crop = isNumber(companionIndex)
      ? cropSearchResults[0]?.companions[companionIndex]
      : findBySlug(cropSearchResults, slug).crop;
    if (!crop) { console.log("Missing crop."); return; }
    createPlant({
      cropName: crop.name,
      slug: crop.slug,
      gardenCoords,
      gridSize,
      dispatch,
      openedSavedGarden,
      depth: parseInt("" + getConfigValue(NumericSetting.default_plant_depth)),
      water_curve_id: props.designer.cropWaterCurveId,
      spread_curve_id: props.designer.cropSpreadCurveId,
      height_curve_id: props.designer.cropHeightCurveId,
    });
    dispatch({ type: Actions.SET_COMPANION_INDEX, payload: undefined });
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
    const points = [plant];
    props.dispatch(movePoints({ deltaX: dX, deltaY: dY, points, gridSize }));
  }
};

export interface JogPointsProps {
  keyName: string;
  points: (TaggedPoint | TaggedPlantTemplate)[];
  mapTransformProps: MapTransformProps;
  dispatch: Function;
}

export const jogPoints = (props: JogPointsProps) => {
  const { keyName, points, dispatch } = props;
  if (!(points.length > 0)) { return; }
  const { gridSize, xySwap, quadrant } = props.mapTransformProps;
  const horizontal = xySwap ? "deltaY" : "deltaX";
  const vertical = xySwap ? "deltaX" : "deltaY";
  const amount = 10;
  const left = [1, 4].includes(quadrant) ? amount : -amount;
  const right = [1, 4].includes(quadrant) ? -amount : amount;
  const up = [3, 4].includes(quadrant) ? amount : -amount;
  const down = [3, 4].includes(quadrant) ? -amount : amount;
  const generatePayload = (keyName: string): MovePointsProps | undefined => {
    switch (keyName) {
      case "ArrowLeft":
        return { deltaX: 0, deltaY: 0, [horizontal]: left, points, gridSize };
      case "ArrowRight":
        return { deltaX: 0, deltaY: 0, [horizontal]: right, points, gridSize };
      case "ArrowUp":
        return { deltaX: 0, deltaY: 0, [vertical]: up, points, gridSize };
      case "ArrowDown":
        return { deltaX: 0, deltaY: 0, [vertical]: down, points, gridSize };
    }
  };
  const payload = generatePayload(keyName);
  if (payload) {
    dispatch(movePoints(payload));
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

export interface SavePointsProps {
  points: (TaggedPoint | TaggedPlantTemplate)[];
  dispatch: Function;
}

export const savePoints = (props: SavePointsProps) => {
  props.points.map(p => props.dispatch(save(p.uuid)));
};
