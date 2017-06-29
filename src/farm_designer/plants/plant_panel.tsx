import * as React from "react";
import * as _ from "lodash";
import { t } from "i18next";
import { FormattedPlantInfo } from "./map_state_to_props";

interface PlantPanelProps {
  info: FormattedPlantInfo;
  onDestroy?(uuid: string): void;
}

export function PlantPanel({ info, onDestroy }: PlantPanelProps) {
  let { name, slug, plantedAt, daysOld, x, y, uuid } = info;
  let destroy = () => onDestroy && onDestroy(uuid);
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
          {_.startCase(slug)}
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
    </ul>
    <div>
      <label hidden={!onDestroy}>
        {t("Delete this plant")}
      </label>
    </div>
    <button
      className="fb-button red"
      hidden={!onDestroy}
      onClick={destroy}
    >
      {t("Delete")}
    </button>
  </div>;
}
