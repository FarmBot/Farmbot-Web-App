import { initSave } from "../api/crud";
import { Actions, Content } from "../constants";
import { t } from "../i18next_wrapper";
import { error } from "../toast/toast";
import { AxisNumberProperty } from "../farm_designer/map/interfaces";
import { ThreeDDesignerState } from "../farm_designer/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { NumericSetting } from "../session_keys";
import { isNumber } from "lodash";
import { Path } from "../internal_urls";
import {
  DEFAULT_PLANT_RADIUS, findCropMetadata, verifiedCropSlug,
} from "../crops/metadata";

export interface DropPlant3DProps {
  gardenCoords: AxisNumberProperty | undefined;
  gridSize: AxisNumberProperty;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  designer: ThreeDDesignerState;
}

const newPlantBody = (
  x: number,
  y: number,
  slug: string,
  cropName: string,
  depth: number,
  designer: ThreeDDesignerState,
) => ({
  pointer_type: "Plant" as const,
  name: cropName,
  meta: {},
  x,
  y,
  z: 0,
  radius: designer.cropRadius || DEFAULT_PLANT_RADIUS,
  depth,
  openfarm_slug: verifiedCropSlug(slug),
  plant_stage: designer.cropStage || "planned" as const,
  planted_at: designer.cropPlantedAt,
  water_curve_id: designer.cropWaterCurveId,
  spread_curve_id: designer.cropSpreadCurveId,
  height_curve_id: designer.cropHeightCurveId,
});

export const dropPlant3D = (props: DropPlant3DProps) => {
  const { gardenCoords, gridSize, dispatch, getConfigValue } = props;
  if (!gardenCoords) {
    throw new Error(`Missing 'drop-area-svg', 'farm-designer-map', or
        'farm-designer' while trying to add a plant.`);
  }
  const { x, y } = gardenCoords;
  const outsideGrid = x < 0 || y < 0 || x > gridSize.x || y > gridSize.y;
  if (outsideGrid) {
    error(t(Content.OUTSIDE_PLANTING_AREA));
    return;
  }
  const slug = Path.getCropSlug();
  if (!slug) { console.log("Missing slug."); return; }
  const { companionIndex, openedSavedGarden } = props.designer;
  const cropSlug = isNumber(companionIndex)
    ? findCropMetadata(slug).companions[companionIndex]
    : slug;
  const crop = findCropMetadata(cropSlug);
  const savedGardenId = openedSavedGarden || undefined;
  const kind = isNumber(savedGardenId) ? "PlantTemplate" : "Point";
  const body = isNumber(savedGardenId)
    ? {
      x,
      y,
      z: 0,
      openfarm_slug: cropSlug,
      name: crop.name,
      radius: DEFAULT_PLANT_RADIUS,
      saved_garden_id: savedGardenId,
    }
    : newPlantBody(
      x,
      y,
      cropSlug,
      crop.name,
      parseInt("" + getConfigValue(NumericSetting.default_plant_depth)),
      props.designer,
    );
  if (body.name != "name" && body.openfarm_slug != "slug") {
    dispatch(initSave(kind, body));
  }
  dispatch({ type: Actions.SET_COMPANION_INDEX, payload: undefined });
};
