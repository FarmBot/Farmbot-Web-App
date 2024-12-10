import React from "react";
import { Row, FBSelect, DropDownItem, Checkbox, ToggleButton } from "../../ui";
import {
  AddEqCriteria, editCriteria, AddNumberCriteria,
  editGtLtCriteriaField,
  removeEqCriteriaValue,
  clearCriteriaField,
  dayCriteriaEmpty,
  ClearCategory,
} from ".";
import {
  EqCriteriaSelectionProps,
  NumberCriteriaProps,
  LocationSelectionProps,
  NumberLtGtInputProps,
  PointGroupCriteria,
  DaySelectionProps,
} from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Actions } from "../../constants";
import { spaceSelected } from "../../farm_designer/map/layers/zones/zones";

/** Add and view string or number equal criteria. */
export class EqCriteriaSelection<T extends string | number>
  extends React.Component<EqCriteriaSelectionProps<T>> {
  render() {
    const { eqCriteria, criteriaKey, group, dispatch } = this.props;
    return <div className={`${this.props.type}-eq-criteria grid`}>
      <AddEqCriteria<T> group={group} dispatch={dispatch}
        type={this.props.type} eqCriteria={eqCriteria}
        criteriaKey={criteriaKey} />
      {eqCriteria && Object.entries(eqCriteria)
        .map(([key, values]: [string, T[]], keyIndex) =>
          values && values.length > 0 &&
          <div key={keyIndex} className="row advanced-group-criteria">
            <code>{key}</code>
            <p>=</p>
            {values.map((value, valueIndex) =>
              <Row key={"" + keyIndex + valueIndex} className="grid-exp-1">
                <input name="value"
                  disabled={true}
                  value={value} />
                <button className="fb-button red"
                  title={t("remove filter")}
                  onClick={() => dispatch(removeEqCriteriaValue(
                    group, eqCriteria, criteriaKey, key, value))}>
                  <i className="fa fa-minus" />
                </button>
              </Row>)}
          </div>)}
    </div>;
  }
}

/** Add and view > or < number criteria. */
export const NumberCriteriaSelection = (props: NumberCriteriaProps) => {
  const criteriaField = props.criteria[props.criteriaKey];
  return <div className={"number-gt-lt-criteria grid"}>
    <AddNumberCriteria {...props} />
    {criteriaField && Object.entries(criteriaField)
      .map(([key, value], keyIndex) =>
        <div key={keyIndex}>
          <Row className="advanced-group-criteria">
            <p>{key}</p>
            {props.criteriaKey == "number_gt" ? ">" : "<"}
            <p>{value}</p>
            <button className="fb-button red"
              title={t("remove number criteria")}
              onClick={() => props.dispatch(clearCriteriaField(
                props.group, [props.criteriaKey], [key]))}>
              <i className="fa fa-minus" />
            </button>
          </Row>
        </div>)}
  </div>;
};

const DAY_OPERATOR_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  ["<"]: { label: t("Less than"), value: "<" },
  [">"]: { label: t("Greater than"), value: ">" },
});

/** Edit and view day criteria. */
export const DaySelection = (props: DaySelectionProps) => {
  const { group, criteria, dispatch, advanced } = props;
  const dayCriteria = criteria.day;
  const noDayCriteria = !advanced &&
    dayCriteriaEmpty(dayCriteria) && !props.dayChanged;
  return <div className="day-criteria">
    <div className="row grid-exp-1">
      {advanced
        ? <label>{t("Age")}</label>
        : <p className={"category"}>{t("Age")}</p>}
      {!advanced &&
        <div className="all-criteria-checkbox row">
          <Checkbox
            onChange={() => {
              dispatch(editCriteria(group, { day: { op: "<", days_ago: 0 } }));
              props.changeDay(false);
            }}
            checked={noDayCriteria}
            disabled={noDayCriteria}
            title={t("clear age selection")}
            customDisabledText={t("age selection empty")} />
          <p>{t("ALL")}</p>
        </div>
      }
    </div>
    <Row className="grid-3-col">
      <FBSelect key={JSON.stringify(group.body)}
        list={[
          DAY_OPERATOR_DDI_LOOKUP()["<"],
          DAY_OPERATOR_DDI_LOOKUP()[">"]]}
        selectedItem={noDayCriteria
          ? { label: t("Select one"), value: "" }
          : DAY_OPERATOR_DDI_LOOKUP()[dayCriteria.op]}
        onChange={ddi => {
          dispatch(editCriteria(group, {
            day: {
              days_ago: dayCriteria.days_ago,
              op: ddi.value as PointGroupCriteria["day"]["op"]
            }
          }));
          props.changeDay(true);
        }} />
      <input type="number" name="days_ago"
        value={noDayCriteria ? "" : dayCriteria.days_ago}
        disabled={noDayCriteria}
        onChange={e => {
          const { op } = dayCriteria;
          const days_ago = parseInt(e.currentTarget.value);
          dispatch(editCriteria(group, { day: { days_ago, op } }));
          props.changeDay(true);
        }} />
      <p className={"days-old-text"}>{t("days old")}</p>
    </Row>
  </div>;
};

/** Edit number < and > criteria. */
export const NumberLtGtInput = (props: NumberLtGtInputProps) => {
  const { group, dispatch, criteriaKey } = props;
  const gtCriteria = props.group.body.criteria.number_gt;
  const ltCriteria = props.group.body.criteria.number_lt;
  return <Row className="grid-col-3">
    <input key={"gt-" + JSON.stringify(gtCriteria)}
      type="number"
      name={`${criteriaKey}-number-gt`}
      defaultValue={gtCriteria[criteriaKey]}
      disabled={props.disabled}
      onBlur={e => dispatch(editGtLtCriteriaField(
        group, "number_gt", criteriaKey)(e))} />
    <div className="row criteria-operators-grid">
      <p>{"<"}</p>
      <p>{criteriaKey}</p>
      <p>{"<"}</p>
    </div>
    <input key={"lt-" + JSON.stringify(ltCriteria)}
      type="number"
      name={`${criteriaKey}-number-lt`}
      defaultValue={ltCriteria[criteriaKey]}
      disabled={props.disabled}
      onBlur={e => dispatch(editGtLtCriteriaField(
        group, "number_lt", criteriaKey)(e))} />
  </Row>;
};

/** Form inputs to define a 2D group criteria area. */
export const LocationSelection = (props: LocationSelectionProps) =>
  <div className="location-criteria grid">
    <div className="row grid-exp-1">
      <p className={"category"}>{t("Location")}</p>
      <label>{t("edit in map")}</label>
      <ToggleButton
        title={props.editGroupAreaInMap
          ? t("map boxes will change location filter")
          : t("map boxes will manually add plants")}
        customText={{ textFalse: t("off"), textTrue: t("on") }}
        toggleValue={props.editGroupAreaInMap}
        toggleAction={() =>
          props.dispatch({
            type: Actions.EDIT_GROUP_AREA_IN_MAP,
            payload: !props.editGroupAreaInMap
          })} />
    </div>
    <ClearCategory
      group={props.group}
      criteriaCategories={["number_lt", "number_gt"]}
      criteriaKeys={["x", "y"]}
      dispatch={props.dispatch} />
    {!spaceSelected(props.group, props.botSize) &&
      <div className="location-selection-warning">
        <i className="fa fa-exclamation-triangle" />
        <p>{t("Invalid selection.")}</p>
      </div>}
    {["x", "y"].map((axis: "x" | "y") =>
      <NumberLtGtInput
        key={axis}
        criteriaKey={axis}
        group={props.group}
        dispatch={props.dispatch} />)}
  </div>;
