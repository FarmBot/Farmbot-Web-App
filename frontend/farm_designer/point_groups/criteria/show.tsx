import * as React from "react";
import { Row, Col, FBSelect, DropDownItem } from "../../../ui";
import {
  AddEqCriteria, editCriteria, AddNumberCriteria,
  editGtLtCriteriaField,
  removeEqCriteriaValue,
  clearCriteriaField,
} from ".";
import {
  EqCriteriaSelectionProps, NumberCriteriaProps,
  CriteriaSelectionProps, LocationSelectionProps,
  NumberLtGtInputProps,
} from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { ToggleButton } from "../../../controls/toggle_button";
import { Actions } from "../../../constants";

/** Add and view string or number equal criteria. */
export class EqCriteriaSelection<T extends string | number>
  extends React.Component<EqCriteriaSelectionProps<T>> {
  render() {
    const { eqCriteria, criteriaKey, group, dispatch } = this.props;
    return <div className={`${this.props.type}-eq-criteria`}>
      <AddEqCriteria<T> group={group} dispatch={dispatch}
        type={this.props.type} eqCriteria={eqCriteria}
        criteriaKey={criteriaKey} />
      {eqCriteria && Object.entries(eqCriteria)
        .map(([key, values]: [string, T[]], keyIndex) =>
          values && values.length > 0 &&
          <div key={keyIndex}>
            <code>{key}</code>
            {values.map((value, valueIndex) =>
              <Row key={"" + keyIndex + valueIndex}>
                <Col xs={9}>
                  <input name="value"
                    disabled={true}
                    value={value} />
                </Col>
                <Col xs={2}>
                  <button className="fb-button red"
                    title={t("remove criteria")}
                    onClick={() => dispatch(removeEqCriteriaValue(
                      group, eqCriteria, criteriaKey, key, value))}>
                    <i className="fa fa-minus" />
                  </button>
                </Col>
              </Row>)}
          </div>)}
    </div>;
  }
}

/** Add and view > or < number criteria. */
export const NumberCriteriaSelection = (props: NumberCriteriaProps) => {
  const criteriaField = props.criteria[props.criteriaKey];
  return <div className={"number-gt-lt-criteria"}>
    <AddNumberCriteria {...props} />
    {criteriaField && Object.entries(criteriaField)
      .map(([key, value], keyIndex) =>
        <div key={keyIndex}>
          <Row>
            <Col xs={4}>
              <p>{key}</p>
            </Col>
            <Col xs={1}>
              {props.criteriaKey == "number_gt" ? ">" : "<"}
            </Col>
            <Col xs={4}>
              <p>{value}</p>
            </Col>
            <Col xs={2}>
              <button className="fb-button red"
                title={t("remove number criteria")}
                onClick={() => props.dispatch(clearCriteriaField(
                  props.group, [props.criteriaKey], key))}>
                <i className="fa fa-minus" />
              </button>
            </Col>
          </Row>
        </div>)}
  </div>;
};

const DAY_OPERATOR_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  ["<"]: { label: t("Less than"), value: "<" },
  [">"]: { label: t("Greater than"), value: ">" },
});

/** Edit and view day criteria. */
export const DaySelection = (props: CriteriaSelectionProps) => {
  const { group, criteria, dispatch } = props;
  const dayCriteria = criteria.day;
  return <div className="day-criteria">
    <label>{t("Age selection")}</label>
    <Row>
      <Col xs={5}>
        <FBSelect key={JSON.stringify(criteria)}
          list={[DAY_OPERATOR_DDI_LOOKUP()["<"],
          DAY_OPERATOR_DDI_LOOKUP()[">"]]}
          selectedItem={!dayCriteria
            ? { label: t("Select one"), value: "" }
            : DAY_OPERATOR_DDI_LOOKUP()[dayCriteria.op]}
          onChange={ddi => dispatch(editCriteria(group, {
            day: {
              days_ago: dayCriteria?.days_ago || 0,
              op: ddi.value as "<" | ">"
            }
          }))} />
      </Col>
      <Col xs={3}>
        <input type="number" name="days_ago"
          value={!dayCriteria ? "" : dayCriteria.days_ago}
          disabled={!dayCriteria}
          onChange={e => {
            const op = dayCriteria?.op || "<";
            const days_ago = parseInt(e.currentTarget.value);
            dispatch(editCriteria(group, { day: { days_ago, op } }));
          }} />
      </Col>
      <Col xs={4}>
        <p>{t("days old")}</p>
      </Col>
    </Row>
  </div>;
};

/** Edit number < and > criteria. */
export const NumberLtGtInput = (props: NumberLtGtInputProps) => {
  const { group, dispatch, criteriaKey, pointerType } = props;
  const gtCriteria = props.group.body.criteria.number_gt;
  const ltCriteria = props.group.body.criteria.number_lt;
  return <Row>
    <Col xs={props.inputWidth || 4}>
      <input key={JSON.stringify(gtCriteria)}
        type="number"
        name={`${criteriaKey}-number-gt`}
        defaultValue={gtCriteria[criteriaKey]}
        disabled={props.disabled}
        onBlur={e => dispatch(editGtLtCriteriaField(
          group, "number_gt", criteriaKey, pointerType)(e))} />
    </Col>
    <Col xs={1}>
      <p>{"<"}</p>
    </Col>
    <Col xs={props.labelWidth || 1}>
      <p>{criteriaKey}</p>
    </Col>
    <Col xs={1}>
      <p>{"<"}</p>
    </Col>
    <Col xs={props.inputWidth || 4}>
      <input key={JSON.stringify(ltCriteria)}
        type="number"
        name={`${criteriaKey}-number-lt`}
        defaultValue={ltCriteria[criteriaKey]}
        disabled={props.disabled}
        onBlur={e => dispatch(editGtLtCriteriaField(
          group, "number_lt", criteriaKey, pointerType)(e))} />
    </Col>
  </Row>;
};

/** Form inputs to define a 2D group criteria area. */
export const LocationSelection = (props: LocationSelectionProps) =>
  <div className="location-criteria">
    <label>{t("Location selection")}</label>
    {["x", "y"].map((axis: "x" | "y") =>
      <NumberLtGtInput
        key={axis}
        criteriaKey={axis}
        group={props.group}
        dispatch={props.dispatch} />)}
    <div className={"edit-in-map"}>
      <ToggleButton
        title={props.editGroupAreaInMap
          ? t("map boxes will change location criteria")
          : t("map boxes will manually add plants")}
        customText={{ textFalse: t("off"), textTrue: t("on") }}
        toggleValue={props.editGroupAreaInMap}
        toggleAction={() =>
          props.dispatch({
            type: Actions.EDIT_GROUP_AREA_IN_MAP,
            payload: !props.editGroupAreaInMap
          })} />
      <label>{t("edit in map")}</label>
    </div>
  </div>;
