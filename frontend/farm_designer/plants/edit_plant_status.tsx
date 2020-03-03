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

export const PLANT_STAGE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  planned: { label: t("Planned"), value: "planned" },
  planted: { label: t("Planted"), value: "planted" },
  sprouted: { label: t("Sprouted"), value: "sprouted" },
  harvested: { label: t("Harvested"), value: "harvested" },
});
export const PLANT_STAGE_LIST = () => [
  PLANT_STAGE_DDI_LOOKUP().planned,
  PLANT_STAGE_DDI_LOOKUP().planted,
  PLANT_STAGE_DDI_LOOKUP().sprouted,
  PLANT_STAGE_DDI_LOOKUP().harvested,
];

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
    list={PLANT_STAGE_LIST()}
    selectedItem={PLANT_STAGE_DDI_LOOKUP()[plantStatus]}
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
      list={PLANT_STAGE_LIST()}
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
