import * as React from "react";
import * as _ from "lodash";
import { t } from "i18next";
import { Link } from "react-router";
import { FormattedPlantInfo } from "./map_state_to_props";
import { round } from "../map/util";
import { history } from "../../history";
import { FBSelect, DropDownItem } from "../../ui";
import { PlantOptions } from "../interfaces";
import { PlantStage } from "farmbot";
import * as moment from "moment";

export interface PlantPanelProps {
  info: FormattedPlantInfo;
  onDestroy?(uuid: string): void;
  updatePlant?(uuid: string, update: PlantOptions): void;
}

export const PLANT_STAGES: DropDownItem[] = [
  { value: "planned", label: t("Planned") },
  { value: "planted", label: t("Planted") },
  { value: "harvested", label: t("Harvested") },
];

export const PLANT_STAGES_DDI = {
  [PLANT_STAGES[0].value]: {
    label: PLANT_STAGES[0].label,
    value: PLANT_STAGES[0].value
  },
  [PLANT_STAGES[1].value]: {
    label: PLANT_STAGES[1].label,
    value: PLANT_STAGES[1].value
  },
  [PLANT_STAGES[2].value]: {
    label: PLANT_STAGES[2].label,
    value: PLANT_STAGES[2].value
  },
};

export function PlantPanel({ info, onDestroy, updatePlant }: PlantPanelProps) {
  const { name, slug, plantedAt, daysOld, uuid, plantStatus } = info;
  let { x, y } = info;
  if (onDestroy) { x = round(x); y = round(y); }
  const destroy = () => onDestroy && onDestroy(uuid);
  return <div className="panel-content">
    <label>
      {t("Plant Info")}
    </label>
    <ul>
      <li>
        <b>
          {t("Full Name")}:&nbsp;
        </b>
        <span>
          {_.startCase(name)}
        </span>
      </li>
      <li>
        <b>
          {t("Plant Type")}:&nbsp;
        </b>
        <span>
          <Link
            to={`/app/designer/plants/crop_search/` + slug}>
            {_.startCase(slug)}
          </Link>
        </span>
      </li>
      <li>
        <b>
          {t("Started")}:&nbsp;
        </b>
        <span>
          {plantedAt}
        </span>
      </li>
      <li>
        <b>
          {t("Age")}:&nbsp;
        </b>
        <span>
          {daysOld} {t("days old")}
        </span>
      </li>
      <li>
        <b>
          {t("Location")}:&nbsp;
        </b>
        <span>
          ({x}, {y})
        </span>
      </li>
      <li>
        <b>
          {t("Status")}:&nbsp;
        </b>
        <span>
          {updatePlant
            ? <FBSelect
              list={PLANT_STAGES}
              selectedItem={PLANT_STAGES_DDI[plantStatus]}
              onChange={e => {
                const plant_stage = e.value as PlantStage;
                const update: PlantOptions = { plant_stage };
                switch (plant_stage) {
                  case "planned":
                    update.planted_at = undefined;
                    break;
                  case "planted":
                    update.planted_at = moment().toISOString();
                }
                updatePlant(uuid, update);
              }} />
            : plantStatus}
        </span>
      </li>
    </ul>
    <div>
      <label hidden={!onDestroy}>
        {t("Delete this plant")}
      </label>
    </div>
    <button
      className="fb-button red"
      hidden={!onDestroy}
      onClick={destroy} >
      {t("Delete")}
    </button>
    <button
      className="fb-button gray"
      style={{ marginRight: "10px" }}
      hidden={!onDestroy}
      onClick={() => history.push("/app/designer/plants/select")} >
      {t("Delete multiple")}
    </button>
  </div>;
}
