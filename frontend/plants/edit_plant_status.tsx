import React from "react";
import { FBSelect, DropDownItem, ColorPicker, BlurableInput } from "../ui";
import { PlantOptions } from "../farm_designer/interfaces";
import {
  PlantStage, TaggedWeedPointer, PointType, TaggedPoint, TaggedPlantPointer,
  TaggedGenericPointer,
} from "farmbot";
import moment from "moment";
import { t } from "../i18next_wrapper";
import { UUID } from "../resources/interfaces";
import { edit, save } from "../api/crud";
import { EditPlantStatusProps } from "./plant_panel";
import { mean, round } from "lodash";
import { TimeSettings } from "../interfaces";

export const PLANT_STAGE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  planned: { label: t("Planned"), value: "planned" },
  planted: { label: t("Planted"), value: "planted" },
  sprouted: { label: t("Sprouted"), value: "sprouted" },
  harvested: { label: t("Harvested"), value: "harvested" },
  active: { label: t("Active"), value: "active" },
  removed: { label: t("Removed"), value: "removed" },
  pending: { label: t("Pending"), value: "pending" },
});
export const PLANT_STAGE_LIST = () => [
  PLANT_STAGE_DDI_LOOKUP().planned,
  PLANT_STAGE_DDI_LOOKUP().planted,
  PLANT_STAGE_DDI_LOOKUP().sprouted,
  PLANT_STAGE_DDI_LOOKUP().harvested,
  PLANT_STAGE_DDI_LOOKUP().removed,
  PLANT_STAGE_DDI_LOOKUP().pending,
];

export const ALL_STAGE_DDI_LOOKUP = (): Record<string, DropDownItem> => ({
  planned: PLANT_STAGE_DDI_LOOKUP().planned,
  planted: PLANT_STAGE_DDI_LOOKUP().planted,
  sprouted: PLANT_STAGE_DDI_LOOKUP().sprouted,
  harvested: PLANT_STAGE_DDI_LOOKUP().harvested,
  active: PLANT_STAGE_DDI_LOOKUP().active,
  removed: PLANT_STAGE_DDI_LOOKUP().removed,
  pending: PLANT_STAGE_DDI_LOOKUP().pending,
});
export const ALL_STAGE_LIST = () => [
  PLANT_STAGE_DDI_LOOKUP().planned,
  PLANT_STAGE_DDI_LOOKUP().planted,
  PLANT_STAGE_DDI_LOOKUP().sprouted,
  PLANT_STAGE_DDI_LOOKUP().harvested,
  PLANT_STAGE_DDI_LOOKUP().active,
  PLANT_STAGE_DDI_LOOKUP().removed,
  PLANT_STAGE_DDI_LOOKUP().pending,
];

export const WEED_STAGE_DDI_LOOKUP = (): Record<string, DropDownItem> => ({
  planned: PLANT_STAGE_DDI_LOOKUP().planned,
  planted: PLANT_STAGE_DDI_LOOKUP().planted,
  sprouted: PLANT_STAGE_DDI_LOOKUP().sprouted,
  harvested: PLANT_STAGE_DDI_LOOKUP().harvested,
  active: PLANT_STAGE_DDI_LOOKUP().active,
  removed: PLANT_STAGE_DDI_LOOKUP().removed,
  pending: PLANT_STAGE_DDI_LOOKUP().pending,
});
export const WEED_STAGE_LIST = () => [
  WEED_STAGE_DDI_LOOKUP().pending,
  WEED_STAGE_DDI_LOOKUP().active,
  WEED_STAGE_DDI_LOOKUP().removed,
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

export interface BulkUpdateBaseProps {
  allPoints: TaggedPoint[];
  selected: UUID[];
  dispatch: Function;
}

export interface PlantStatusBulkUpdateProps extends BulkUpdateBaseProps {
  pointerType: PointType;
}

/** Update `plant_stage` for multiple plants at once. */
export const PlantStatusBulkUpdate = (props: PlantStatusBulkUpdateProps) =>
  <div className="plant-status-bulk-update">
    <p>{t("update status to")}</p>
    <FBSelect
      key={JSON.stringify(props.selected)}
      list={props.pointerType == "Plant"
        ? PLANT_STAGE_LIST()
        : WEED_STAGE_LIST()}
      selectedItem={undefined}
      customNullLabel={t("Select a status")}
      onChange={ddi => {
        const plant_stage = ddi.value as PlantStage;
        const update = props.pointerType == "Plant"
          ? getUpdateByPlantStage(plant_stage)
          : { plant_stage };
        const points = props.allPoints.filter(point =>
          props.selected.includes(point.uuid)
          && point.kind === "Point"
          && (point.body.pointer_type == "Plant"
            || point.body.pointer_type == "Weed")
          && point.body.plant_stage != plant_stage);
        points.length > 0 && confirm(
          t("Change status to '{{ status }}' for {{ num }} items?",
            { status: plant_stage, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, update));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;

export interface PlantDateBulkUpdateProps extends BulkUpdateBaseProps {
  timeSettings: TimeSettings;
}

/** Update `planted_at` for multiple plants at once. */
export const PlantDateBulkUpdate = (props: PlantDateBulkUpdateProps) => {
  const plants = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type == "Plant")
    .map((p: TaggedWeedPointer | TaggedGenericPointer) => p);
  return <div className={"plant-date-bulk-update"}>
    <p>{t("update start to")}</p>
    <BlurableInput
      type="date"
      value={moment().format("YYYY-MM-DD")}
      onCommit={e => {
        plants.length > 0 && confirm(
          t("Change start date to {{ date }} for {{ num }} items?", {
            date: moment(e.currentTarget.value).format("YYYY-MM-DD"),
            num: plants.length,
          }))
          && plants.map(point => {
            props.dispatch(edit(point, {
              planted_at: moment(e.currentTarget.value)
                .utcOffset(props.timeSettings.utcOffset).toISOString()
            }));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;
};

/** Update `radius` for multiple points at once. */
export const PointSizeBulkUpdate = (props: BulkUpdateBaseProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type != "ToolSlot")
    .map((p: TaggedPlantPointer | TaggedWeedPointer | TaggedGenericPointer) => p);
  const averageSize = round(mean(points.map(p => p.body.radius)));
  const [radius, setRadius] = React.useState("" + (averageSize || 25));
  return <div className={"point-size-bulk-update"}>
    <p>{t("update radius to")}</p>
    <input
      value={radius}
      onChange={e => setRadius(e.currentTarget.value)}
      onBlur={() => {
        const radiusNum = parseInt(radius);
        isFinite(radiusNum) && points.length > 0 && confirm(
          t("Change radius to {{ radius }}mm for {{ num }} items?",
            { radius: radiusNum, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, { radius: radiusNum }));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;
};

/** Update `meta.color` for multiple points at once. */
export const PointColorBulkUpdate = (props: BulkUpdateBaseProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type != "ToolSlot")
    .map((p: TaggedWeedPointer | TaggedGenericPointer) => p);
  return <div className={"point-color-bulk-update"}>
    <p>{t("update color to")}</p>
    <ColorPicker
      current={"green"}
      onChange={color => {
        points.length > 0 && confirm(
          t("Change color to {{ color }} for {{ num }} items?",
            { color, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, { meta: { color } }));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;
};

export interface EditWeedStatusProps {
  weed: TaggedWeedPointer;
  updateWeed(update: Partial<TaggedWeedPointer["body"]>): void;
}

/** Select a `plant_stage` for a weed. */
export const EditWeedStatus = (props: EditWeedStatusProps) =>
  <FBSelect
    list={WEED_STAGE_LIST()}
    selectedItem={WEED_STAGE_DDI_LOOKUP()[props.weed.body.plant_stage]}
    onChange={ddi =>
      props.updateWeed({ plant_stage: ddi.value as PlantStage })} />;
