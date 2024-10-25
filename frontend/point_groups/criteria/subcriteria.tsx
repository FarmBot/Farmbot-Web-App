import React from "react";
import { t } from "../../i18next_wrapper";
import { capitalize, uniq, some, isEqual } from "lodash";
import {
  NumberLtGtInput,
  toggleAndEditEqCriteria,
  clearCriteriaField,
  eqCriteriaSelected,
  criteriaHasKey,
} from ".";
import {
  CheckboxListProps,
  SubCriteriaProps,
  PlantSubCriteriaProps,
  ClearCategoryProps,
  PointSubCriteriaProps,
  SubCriteriaSectionProps,
  CheckboxListItem,
} from "./interfaces";
import {
  PLANT_STAGE_LIST, WEED_STAGE_LIST,
} from "../../plants/edit_plant_status";
import { DIRECTION_CHOICES } from "../../tools/tool_slot_edit_components";
import { Checkbox } from "../../ui";
import { PointType } from "farmbot";

export const SubCriteriaSection = (props: SubCriteriaSectionProps) => {
  const { group, dispatch, disabled } = props;
  const pointTypes = props.pointerTypes.sort();
  if (pointTypes.length > 1 &&
    !isEqual(pointTypes, ["GenericPointer", "Weed"])) {
    return <div className={"criteria-checkboxes"} />;
  }
  switch (pointTypes[0]) {
    case "Plant":
      return <PlantCriteria
        disabled={disabled}
        group={group} dispatch={dispatch} slugs={props.slugs} />;
    case "GenericPointer":
      return <PointCriteria
        disabled={disabled}
        group={group} dispatch={dispatch} />;
    case "Weed":
      return <WeedCriteria
        disabled={disabled}
        group={group} dispatch={dispatch} />;
    case "ToolSlot":
      return <ToolCriteria
        disabled={disabled}
        group={group} dispatch={dispatch} />;
    default:
      return <div className={"criteria-checkboxes"} />;
  }
};

/** "All" (any) checkbox to show or choose state of criteria subcategory. */
export const ClearCategory = (props: ClearCategoryProps) => {
  const { group, criteriaCategories, criteriaKeys, dispatch } = props;
  const all =
    !some(criteriaKeys.map(criteriaKey =>
      criteriaHasKey(group.body.criteria, criteriaCategories, criteriaKey)));
  return <div className="row grid-exp-1">
    <Checkbox
      onChange={() =>
        dispatch(clearCriteriaField(group, criteriaCategories, criteriaKeys))}
      checked={all}
      disabled={all}
      title={t("clear selections")}
      customDisabledText={t("selections empty")} />
    <p>{t("ALL")}</p>
  </div>;
};

/** List of criteria toggle checkboxes. */
export const CheckboxList =
  <T extends string | number>(props: CheckboxListProps<T>) => {
    const { criteria } = props.group.body;
    const selected = eqCriteriaSelected<T>(criteria);
    const toggle = toggleAndEditEqCriteria;
    return <div className={"criteria-checkbox-list"}>
      {props.list.map(({ label, value, color }: CheckboxListItem<T>, index) =>
        <div className="criteria-checkbox-list-item" key={index}>
          <Checkbox
            onChange={() => props.dispatch(toggle<T>(
              props.group, props.criteriaKey, value))}
            checked={selected(props.criteriaKey, value)}
            title={t(label)}
            color={color}
            disabled={props.disabled} />
          <p>{label}</p>
        </div>)}
    </div>;
  };

/** Criteria specific to plants. */
const PlantCriteria = (props: PlantSubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const commonProps = { group, dispatch, disabled };
  return <div className={"plant-criteria-options"}>
    <PlantStage {...commonProps} pointerType={"Plant"} />
    <PlantType {...commonProps} slugs={props.slugs} />
    <Radius {...commonProps} pointerType={"Plant"} />
  </div>;
};

const PlantStage = (props: PointSubCriteriaProps) =>
  <div className={"plant-stage-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>
        {props.pointerType == "Plant" ? t("Stage") : t("Status")}
      </p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["string_eq"]}
        criteriaKeys={["plant_stage"]}
        dispatch={props.dispatch} />
    </div>
    <CheckboxList<string>
      disabled={props.disabled}
      pointerType={props.pointerType}
      criteriaKey={"plant_stage"}
      group={props.group}
      dispatch={props.dispatch}
      list={
        (props.pointerType == "Plant" ? PLANT_STAGE_LIST() : WEED_STAGE_LIST())
          .map(ddi => ({ label: ddi.label, value: "" + ddi.value }))} />
  </div>;

const RemovalMethod = (props: PointSubCriteriaProps) =>
  <div className={"removal-method-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>{t("Removal Method")}</p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["string_eq"]}
        criteriaKeys={["meta.removal_method"]}
        dispatch={props.dispatch} />
    </div>
    <CheckboxList
      disabled={props.disabled}
      pointerType={props.pointerType}
      criteriaKey={"meta.removal_method"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Automatic"), value: "automatic" },
        { label: t("Manual"), value: "manual" },
      ]} />
  </div>;

const PlantType = (props: PlantSubCriteriaProps) =>
  <div className={"plant-type-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>{t("Type")}</p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["string_eq"]}
        criteriaKeys={["openfarm_slug"]}
        dispatch={props.dispatch} />
    </div>
    <CheckboxList<string>
      disabled={props.disabled}
      pointerType={"Plant"}
      criteriaKey={"openfarm_slug"}
      group={props.group}
      dispatch={props.dispatch}
      list={uniq(props.slugs
        .concat(props.group.body.criteria.string_eq.openfarm_slug || []))
        .map(slug =>
          ({ label: capitalize(slug).replace(/-/g, " "), value: slug }))} />
  </div>;

/** Criteria specific to weeds. */
const WeedCriteria = (props: SubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const pointerType: PointType = "Weed";
  const commonProps = { group, dispatch, disabled, pointerType };
  return <div className={"weed-criteria-options grid"}>
    <PointSource {...commonProps} />
    <PlantStage {...commonProps} />
    <RemovalMethod {...commonProps} />
    <Color {...commonProps} />
    <Radius {...commonProps} />
  </div>;
};

/** Criteria specific to map points. */
const PointCriteria = (props: SubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const pointerType: PointType = "GenericPointer";
  const commonProps = { group, dispatch, disabled, pointerType };
  return <div className={"point-criteria-options"}>
    <Color {...commonProps} />
    <Radius {...commonProps} />
  </div>;
};

const PointSource = (props: PointSubCriteriaProps) =>
  <div className={"point-source-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>{t("Source")}</p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["string_eq"]}
        criteriaKeys={["meta.created_by"]}
        dispatch={props.dispatch} />
    </div>
    <CheckboxList
      disabled={props.disabled}
      pointerType={props.pointerType}
      criteriaKey={"meta.created_by"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Weed Detector"), value: "plant-detection" },
        { label: t("Farm Designer"), value: "farm-designer" },
      ]} />
  </div>;

const Radius = (props: PointSubCriteriaProps) =>
  <div className={"radius-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>{t("Radius")}</p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["number_gt", "number_lt"]}
        criteriaKeys={["radius"]}
        dispatch={props.dispatch} />
    </div>
    <div className={"lt-gt-criteria"}>
      <NumberLtGtInput
        disabled={props.disabled}
        criteriaKey={"radius"}
        inputWidth={3}
        labelWidth={2}
        group={props.group}
        pointerType={props.pointerType}
        dispatch={props.dispatch} />
    </div>
  </div>;

const Color = (props: PointSubCriteriaProps) =>
  <div className={"color-criteria"}>
    <div className={"row grid-exp-1"}>
      <p className={"category"}>{t("Color")}</p>
      <ClearCategory
        group={props.group}
        criteriaCategories={["string_eq"]}
        criteriaKeys={["meta.color"]}
        dispatch={props.dispatch} />
    </div>
    <CheckboxList
      disabled={props.disabled}
      pointerType={props.pointerType}
      criteriaKey={"meta.color"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Green"), value: "green", color: "green" },
        { label: t("Red"), value: "red", color: "red" },
        { label: t("Blue"), value: "blue", color: "blue" },
        { label: t("Yellow"), value: "yellow", color: "yellow" },
        { label: t("Orange"), value: "orange", color: "orange" },
        { label: t("Purple"), value: "purple", color: "purple" },
        { label: t("Pink"), value: "pink", color: "pink" },
        { label: t("Gray"), value: "gray", color: "gray" },
      ]} />
  </div>;

/** Criteria specific to tools. */
const ToolCriteria = (props: SubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const commonProps = { group, dispatch, disabled };
  return <div className={"tool-criteria-options"}>
    <PulloutDirection {...commonProps} />
  </div>;
};

const PulloutDirection = (props: SubCriteriaProps) =>
  <div className={"pullout-direction-criteria"}>
    <p className={"category"}>{t("Direction")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["number_eq"]}
      criteriaKeys={["pullout_direction"]}
      dispatch={props.dispatch} />
    <CheckboxList<number>
      disabled={props.disabled}
      pointerType={"ToolSlot"}
      criteriaKey={"pullout_direction"}
      group={props.group}
      dispatch={props.dispatch}
      list={DIRECTION_CHOICES().map(ddi =>
        ({ label: ddi.label, value: parseInt("" + ddi.value) }))} />
  </div>;
