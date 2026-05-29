import { initSave } from "../api/crud";
import { DrawnPointPayl } from "../farm_designer/interfaces";
import { Actions } from "../constants";
import {
  GenericPointer, WeedPointer,
} from "farmbot/dist/resources/api_resources";
import { t } from "../i18next_wrapper";
import { success } from "../toast/toast";
import { Path } from "../internal_urls";
import { NavigateFunction } from "react-router";
import { Mode } from "../farm_designer/map/interfaces";
import { getMode } from "../farm_designer/map/util";

export interface CreatePointProps {
  navigate: NavigateFunction;
  dispatch: Function;
  drawnPoint: DrawnPointPayl;
}

export const createPoint = (props: CreatePointProps) => {
  const { dispatch, drawnPoint, navigate } = props;
  const panel = getMode() == Mode.createWeed ? "weeds" : "points";
  const body: GenericPointer | WeedPointer = {
    pointer_type: panel == "weeds" ? "Weed" : "GenericPointer",
    name: drawnPoint.name ||
      (panel == "weeds"
        ? t("Created Weed")
        : t("Created Point")),
    meta: {
      color: drawnPoint.color,
      created_by: "farm-designer",
      type: panel == "weeds" ? "weed" : "point",
      ...(drawnPoint.at_soil_level ? { at_soil_level: "true" } : {}),
    },
    x: drawnPoint.cx || 0,
    y: drawnPoint.cy || 0,
    z: drawnPoint.z,
    plant_stage: "active",
    radius: drawnPoint.r,
  };
  dispatch(initSave("Point", body));
  success(panel == "weeds"
    ? t("Weed created.")
    : t("Point created."));
  dispatch({
    type: Actions.SET_DRAWN_POINT_DATA,
    payload: undefined,
  });
  navigate(Path.designer(panel));
};
