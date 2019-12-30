import * as React from "react";
import { FBSelect, DropDownItem } from "../../ui";
import { PlantOptions } from "../interfaces";
import { PlantStage } from "farmbot";
import moment from "moment";
import { t } from "../../i18next_wrapper";
import { TaggedPlant } from "../map/interfaces";
import { UUID } from "../../resources/interfaces";
import { edit, save } from "../../api/crud";
import { EditPlantStatusProps } from "./plant_panel";

const PLANT_STAGES: DropDownItem[] = [
  { value: "planned", label: t("Planned") },
  { value: "planted", label: t("Planted") },
  { value: "sprouted", label: t("Sprouted") },
  { value: "harvested", label: t("Harvested") },
];

const PLANT_STAGES_DDI = {
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
  [PLANT_STAGES[3].value]: {
    label: PLANT_STAGES[3].label,
    value: PLANT_STAGES[3].value
  },
};

/** Change `planted_at` value based on `plant_stage` update. */
const getUpdateByPlantStage = (plant_stage: PlantStage): PlantOptions => {
  const update: PlantOptions = { plant_stage };
  switch (plant_stage) {
    case "planned":
      update.planted_at = undefined;
      break;
    case "planted":
      update.planted_at = moment().toISOString();
  }
  return update;
};

/** Select a `plant_stage` for a plant. */
export function EditPlantStatus(props: EditPlantStatusProps) {
  const { plantStatus, updatePlant, uuid } = props;
  return <FBSelect
    list={PLANT_STAGES}
    selectedItem={PLANT_STAGES_DDI[plantStatus]}
    onChange={ddi =>
      updatePlant(uuid, getUpdateByPlantStage(ddi.value as PlantStage))} />;
}

export interface PlantStatusBulkUpdateProps {
  plants: TaggedPlant[];
  selected: UUID[];
  dispatch: Function;
}

/** Update `plant_stage` for multiple plants at once. */
export const PlantStatusBulkUpdate = (props: PlantStatusBulkUpdateProps) =>
  <div className="plant-status-bulk-update">
    <p>{t("update plant status to")}</p>
    <FBSelect
      key={JSON.stringify(props.selected)}
      list={PLANT_STAGES}
      selectedItem={undefined}
      customNullLabel={t("Select a status")}
      onChange={ddi => {
        const plant_stage = ddi.value as PlantStage;
        const update = getUpdateByPlantStage(plant_stage);
        const plants = props.plants.filter(plant =>
          props.selected.includes(plant.uuid)
          && plant.kind === "Point"
          && plant.body.plant_stage != plant_stage);
        plants.length > 0 && confirm(
          t("Change the plant status to '{{ status }}' for {{ num }} plants?",
            { status: plant_stage, num: plants.length }))
          && plants.map(plant => {
            props.dispatch(edit(plant, update));
            props.dispatch(save(plant.uuid));
          });
      }} />
  </div>;
