import React from "react";
import { TaggedPlant, Mode } from "../farm_designer/map/interfaces";
import { unpackUUID } from "../util";
import { t } from "../i18next_wrapper";
import {
  selectPoint, setHoveredPlant, mapPointClickAction,
} from "../farm_designer/map/actions";
import { PlantStageAndAge, plantAgeAndStage } from "./map_state_to_props";
import { getMode } from "../farm_designer/map/util";
import { isUndefined, round } from "lodash";
import { Path } from "../internal_urls";
import { useNavigate } from "react-router";
import { findIcon } from "../crops/find";

export interface PlantInventoryItemProps {
  plant: TaggedPlant;
  dispatch: Function;
  hovered: boolean;
  distance?: number;
}

// The individual plants that show up in the farm designer sub nav.
export const PlantInventoryItem = (props: PlantInventoryItemProps) => {
  const navigate = useNavigate();

  const { plant, dispatch } = props;
  const plantId = (plant.body.id || "ERR_NO_PLANT_ID").toString();

  const toggle = (action: "enter" | "leave") => {
    const isEnter = action === "enter";
    const plantUUID = isEnter ? plant.uuid : undefined;
    dispatch(setHoveredPlant(plantUUID));
  };

  const click = () => {
    if (getMode() == Mode.boxSelect) {
      mapPointClickAction(navigate, dispatch, plant.uuid)();
      toggle("leave");
    } else {
      const path =
        unpackUUID(plant.uuid).kind === "PlantTemplate"
          ? Path.plantTemplates
          : Path.plants;
      navigate(path(plantId));
      dispatch(selectPoint([plant.uuid]));
    }
  };

  const label = plant.body.name || "Unknown plant";
  const slug = plant.body.openfarm_slug;
  const icon = findIcon(slug);

  return <div
    className={`plant-search-item ${props.hovered ? "hovered" : ""}`}
    key={plantId}
    onMouseEnter={() => toggle("enter")}
    onMouseLeave={() => toggle("leave")}
    onClick={click}>
    <img
      className="plant-search-item-image"
      src={icon} />
    <span className="plant-search-item-name">
      {label}
    </span>
    <i className="plant-search-item-age">
      {!isUndefined(props.distance)
        ? `(${plant.body.x}, ${plant.body.y})
             ${round(props.distance)}mm ${t("away")}`
        : daysOldText(plantAgeAndStage(plant))}
    </i>
  </div>;
};

export const daysOldText = ({ age, stage }: PlantStageAndAge) => {
  if (isUndefined(age)) { return "" + stage; }
  return `${age} ${age == 1
    ? t("day old")
    : t("days old")}`;
};
