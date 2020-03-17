import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { capitalize, uniq } from "lodash";
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
} from "./interfaces";
import { PLANT_STAGE_LIST } from "../../plants/edit_plant_status";
import { DIRECTION_CHOICES } from "../../tools/tool_slot_edit_components";
import { Checkbox } from "../../../ui";

/** "All" (any) checkbox to show or choose state of criteria subcategory. */
const ClearCategory = (props: ClearCategoryProps) => {
  const { group, criteriaCategories, criteriaKey, dispatch } = props;
  const all =
    !criteriaHasKey(group.body.criteria, criteriaCategories, criteriaKey);
  return <div className="criteria-checkbox-list-item">
    <Checkbox
      onChange={() =>
        dispatch(clearCriteriaField(group, criteriaCategories, criteriaKey))}
      checked={all}
      disabled={all}
      title={t("clear selections")}
      customDisabledText={t("selections empty")} />
    <p>{t("all")}</p>
  </div>;
};

/** List of criteria toggle checkboxes. */
export const CheckboxList =
  <T extends string | number>(props: CheckboxListProps<T>) => {
    const { criteria } = props.group.body;
    const selected = eqCriteriaSelected<T>(criteria);
    const toggle = toggleAndEditEqCriteria;
    return <div className={"criteria-checkbox-list"}>
      {props.list.map(({ label, value }: { label: string, value: T }, index) =>
        <div className="criteria-checkbox-list-item" key={index}>
          <Checkbox
            onChange={() => props.dispatch(toggle<T>(
              props.group, props.criteriaKey, value, props.pointerType))}
            checked={selected(props.criteriaKey, value)}
            title={t(label)}
            disabled={props.disabled} />
          <p>{label}</p>
        </div>)}
    </div>;
  };

/** Criteria specific to plants. */
export const PlantCriteria = (props: PlantSubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const commonProps = { group, dispatch, disabled };
  return <div className={"plant-criteria-options"}>
    <PlantStage {...commonProps} />
    <PlantType {...commonProps} slugs={props.slugs} />
  </div>;
};

const PlantStage = (props: SubCriteriaProps) =>
  <div className={"plant-stage-criteria"}>
    <p className={"category"}>{t("Stage")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["string_eq"]}
      criteriaKey={"plant_stage"}
      dispatch={props.dispatch} />
    <CheckboxList<string>
      disabled={props.disabled}
      pointerType={"Plant"}
      criteriaKey={"plant_stage"}
      group={props.group}
      dispatch={props.dispatch}
      list={PLANT_STAGE_LIST().map(ddi =>
        ({ label: ddi.label, value: "" + ddi.value }))} />
  </div>;

const PlantType = (props: PlantSubCriteriaProps) =>
  <div className={"plant-type-criteria"}>
    <p className={"category"}>{t("Type")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["string_eq"]}
      criteriaKey={"openfarm_slug"}
      dispatch={props.dispatch} />
    <CheckboxList<string>
      disabled={props.disabled}
      pointerType={"Plant"}
      criteriaKey={"openfarm_slug"}
      group={props.group}
      dispatch={props.dispatch}
      list={uniq(props.slugs
        .concat(props.group.body.criteria.string_eq.openfarm_slug || []))
        .map(slug =>
          ({ label: capitalize(slug).replace("-", " "), value: slug }))} />
  </div>;

/** Criteria specific to map points. */
export const PointCriteria = (props: SubCriteriaProps) => {
  const { group, dispatch, disabled } = props;
  const commonProps = { group, dispatch, disabled };
  return <div className={"point-criteria-options"}>
    <PointType {...commonProps} />
    <PointSource {...commonProps} />
    <Color {...commonProps} />
    <Radius {...commonProps} />
  </div>;
};

const PointType = (props: SubCriteriaProps) =>
  <div className={"point-type-criteria"}>
    <p className={"category"}>{t("Type")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["string_eq"]}
      criteriaKey={"meta.type"}
      dispatch={props.dispatch} />
    <CheckboxList
      disabled={props.disabled}
      pointerType={"GenericPointer"}
      criteriaKey={"meta.type"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Weeds"), value: "weed" },
        { label: t("Points"), value: "point" },
      ]} />
  </div>;

const PointSource = (props: SubCriteriaProps) =>
  <div className={"point-source-criteria"}>
    <p className={"category"}>{t("Source")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["string_eq"]}
      criteriaKey={"meta.created_by"}
      dispatch={props.dispatch} />
    <CheckboxList
      disabled={props.disabled}
      pointerType={"GenericPointer"}
      criteriaKey={"meta.created_by"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Weed Detector"), value: "plant-detection" },
        { label: t("Farm Designer"), value: "farm-designer" },
      ]} />
  </div>;

const Radius = (props: SubCriteriaProps) =>
  <div className={"radius-criteria"}>
    <p className={"category"}>{t("Radius")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["number_gt", "number_lt"]}
      criteriaKey={"radius"}
      dispatch={props.dispatch} />
    <div className={"lt-gt-criteria"}>
      <NumberLtGtInput
        disabled={props.disabled}
        criteriaKey={"radius"}
        inputWidth={3}
        labelWidth={2}
        group={props.group}
        pointerType={"GenericPointer"}
        dispatch={props.dispatch} />
    </div>
  </div>;

const Color = (props: SubCriteriaProps) =>
  <div className={"color-criteria"}>
    <p className={"category"}>{t("Color")}</p>
    <ClearCategory
      group={props.group}
      criteriaCategories={["string_eq"]}
      criteriaKey={"meta.color"}
      dispatch={props.dispatch} />
    <CheckboxList
      disabled={props.disabled}
      pointerType={"GenericPointer"}
      criteriaKey={"meta.color"}
      group={props.group}
      dispatch={props.dispatch}
      list={[
        { label: t("Green"), value: "green" },
        { label: t("Red"), value: "red" },
        { label: t("Cyan"), value: "cyan" },
        { label: t("Blue"), value: "blue" },
        { label: t("Yellow"), value: "yellow" },
        { label: t("Orange"), value: "orange" },
        { label: t("Purple"), value: "purple" },
        { label: t("Pink"), value: "pink" },
        { label: t("Gray"), value: "gray" },
      ]} />
  </div>;

/** Criteria specific to tools. */
export const ToolCriteria = (props: SubCriteriaProps) => {
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
      criteriaKey={"pullout_direction"}
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
