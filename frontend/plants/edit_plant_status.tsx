import React from "react";
import {
  FBSelect, DropDownItem, ColorPicker, BlurableInput, NULL_CHOICE,
} from "../ui";
import { PlantOptions } from "../farm_designer/interfaces";
import {
  PlantStage, TaggedWeedPointer, PointType, TaggedPoint, TaggedPlantPointer,
  TaggedGenericPointer,
  TaggedCurve,
} from "farmbot";
import moment from "moment";
import { t } from "../i18next_wrapper";
import { UUID } from "../resources/interfaces";
import { edit, save } from "../api/crud";
import { EditPlantStatusProps } from "./plant_panel";
import { mean, round, startCase } from "lodash";
import { TimeSettings } from "../interfaces";
import { Link } from "../link";
import { Path } from "../internal_urls";
import { useNavigate } from "react-router";
import { Actions } from "../constants";
import { CurveType } from "../curves/templates";
import { curveToDdi, CURVE_KEY_LOOKUP } from "./curve_info";
import { CURVE_TYPES } from "../curves/curves_inventory";
import { betterCompact } from "../util";
import { findCrop } from "../crops/find";

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
      update.planted_at = "" + moment().toISOString();
  }
  return update;
};

/** Select a `plant_stage` for a plant. */
export function EditPlantStatus(props: EditPlantStatusProps) {
  const { plantStatus, updatePlant, uuid } = props;
  return <div className="grid half-gap">
    <label>{t("Status")}</label>
    <FBSelect
      list={PLANT_STAGE_LIST()}
      selectedItem={PLANT_STAGE_DDI_LOOKUP()[plantStatus]}
      onChange={ddi =>
        updatePlant(uuid, getUpdateByPlantStage(ddi.value as PlantStage))} />
  </div>;
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
  <div className="plant-status-bulk-update row grid-2-col">
    <p>{t("Update status to")}</p>
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
    .map((p: TaggedPlantPointer) => p);
  return <div className={"plant-date-bulk-update row grid-2-col"}>
    <p>{t("Update start to")}</p>
    <BlurableInput
      type="date"
      value={moment().format("YYYY-MM-DD")}
      onCommit={e => {
        plants.length > 0 && confirm(
          t("Change start date to {{ date }} for {{ num }} items?", {
            date: moment(e.currentTarget.value).format("YYYY-MM-DD"),
            num: plants.length,
          }))
          && plants.map(plant => {
            props.dispatch(edit(plant, {
              planted_at: "" + moment(e.currentTarget.value)
                .utcOffset(props.timeSettings.utcOffset).toISOString()
            }));
            props.dispatch(save(plant.uuid));
          });
      }} />
  </div>;
};

/** Update `radius` for multiple plants at once. */
export const PointSizeBulkUpdate = (props: BulkUpdateBaseProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type != "ToolSlot")
    .map((p: TaggedPlantPointer | TaggedWeedPointer | TaggedGenericPointer) => p);
  const averageSize = round(mean(points.map(p => p.body.radius)));
  const [radius, setRadius] = React.useState("" + (averageSize || 25));
  return <div className={"point-size-bulk-update row grid-2-col"}>
    <p>{t("Update radius to")}</p>
    <input
      value={radius}
      min={0}
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

/** Update `depth` for multiple points at once. */
export const PlantDepthBulkUpdate = (props: BulkUpdateBaseProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type == "Plant")
    .map((p: TaggedPlantPointer) => p);
  const averageDepth = round(mean(points.map(p => p.body.depth)));
  const [depth, setDepth] = React.useState("" + (averageDepth || 0));
  return <div className={"plant-depth-bulk-update row grid-2-col"}>
    <p>{t("Update depth to")}</p>
    <input
      value={depth}
      min={0}
      onChange={e => setDepth(e.currentTarget.value)}
      onBlur={() => {
        const depthNum = parseFloat(depth);
        isFinite(depthNum) && points.length > 0 && confirm(
          t("Change depth to {{ depth }}mm for {{ num }} items?",
            { depth: depthNum, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, { depth: depthNum }));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;
};

export interface PlantCurvesBulkUpdateProps extends BulkUpdateBaseProps {
  curves: TaggedCurve[];
}

export interface PlantCurveBulkUpdateProps extends PlantCurvesBulkUpdateProps {
  curveType: CurveType;
}

export const PlantCurveBulkUpdate = (props: PlantCurveBulkUpdateProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type == "Plant")
    .map((p: TaggedPlantPointer) => p);
  const curveName = CURVE_TYPES()[props.curveType];
  const curveKey = CURVE_KEY_LOOKUP[props.curveType];
  return <div className={"plant-curve-bulk-update row grid-2-col"}>
    <p>{t("Update {{ curveName }} curve to", { curveName })}</p>
    <FBSelect
      key={JSON.stringify(props.selected)}
      list={([NULL_CHOICE] as DropDownItem[])
        .concat(betterCompact(props.curves
          .filter(curve => curve.body.type == props.curveType)
          .map(curve => curveToDdi(curve))))}
      selectedItem={undefined}
      customNullLabel={t("Select a curve")}
      onChange={ddi => {
        const id = parseInt("" + ddi.value);
        ((id && isFinite(id)) || ddi.isNull) && points.length > 0 && confirm(
          t("Change {{ curveName }} curve for {{ num }} items?",
            { curveName, num: points.length }))
          && points.map(point => {
            props.dispatch(edit(point, {
              [curveKey]: ddi.isNull ? undefined : id,
            }));
            props.dispatch(save(point.uuid));
          });
      }} />
  </div>;
};

/** Update curves for multiple points at once. */
export const PlantCurvesBulkUpdate = (props: PlantCurvesBulkUpdateProps) => {
  return <div className={"plant-curves-bulk-update grid"}>
    {[CurveType.water, CurveType.spread, CurveType.height].map(curveType =>
      <PlantCurveBulkUpdate key={curveType} {...props} curveType={curveType} />)}
  </div>;
};

/** Update `meta.color` for multiple points at once. */
export const PointColorBulkUpdate = (props: BulkUpdateBaseProps) => {
  const points = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type != "ToolSlot")
    .map((p: TaggedWeedPointer | TaggedGenericPointer) => p);
  return <div className={"point-color-bulk-update row grid-2-col"}>
    <p>{t("Update color to")}</p>
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

export interface PlantSlugBulkUpdateProps extends BulkUpdateBaseProps {
  bulkPlantSlug: string | undefined;
}

/** Update slug for multiple plants at once. */
export const PlantSlugBulkUpdate = (props: PlantSlugBulkUpdateProps) => {
  const plants = props.allPoints.filter(point =>
    props.selected.includes(point.uuid) && point.kind === "Point" &&
    point.body.pointer_type == "Plant")
    .map((p: TaggedPlantPointer) => p);
  const slug = props.bulkPlantSlug || plants[0]?.body.openfarm_slug;
  const navigate = useNavigate();
  return <div className={"plant-slug-bulk-update row grid-2-col"}>
    <p>{t("Update type to")}</p>
    <div>
      <Link
        title={t("View crop info")}
        to={Path.cropSearch(slug)}>
        {startCase(slug)}
      </Link>
      <i className={"fa fa-pencil fb-icon-button"}
        onClick={() => {
          props.dispatch({ type: Actions.SET_SLUG_BULK, payload: slug });
          navigate(Path.cropSearch());
        }} />
      <button className={"fb-button green"}
        onClick={() => {
          if (slug && plants.length > 0 && confirm(
            t("Change crop type to {{ slug }} for {{ num }} plants?", {
              slug,
              num: plants.length,
            }))) {
            plants.map(plant => {
              props.dispatch(edit(plant, {
                openfarm_slug: slug,
                name: findCrop(slug).name,
              }));
              props.dispatch(save(plant.uuid));
            });
            props.dispatch({ type: Actions.SET_SLUG_BULK, payload: undefined });
          }
        }}>
        {t("apply")}
      </button>
    </div>
  </div>;
};

export interface EditWeedStatusProps {
  weed: TaggedWeedPointer;
  updateWeed(update: Partial<TaggedWeedPointer["body"]>): void;
}

/** Select a `plant_stage` for a weed. */
export const EditWeedStatus = (props: EditWeedStatusProps) =>
  <FBSelect
    key={props.weed.uuid}
    list={WEED_STAGE_LIST()}
    selectedItem={WEED_STAGE_DDI_LOOKUP()[props.weed.body.plant_stage]}
    onChange={ddi =>
      props.updateWeed({ plant_stage: ddi.value as PlantStage })} />;
