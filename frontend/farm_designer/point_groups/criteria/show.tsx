import * as React from "react";
import { cloneDeep, capitalize } from "lodash";
import { Row, Col, FBSelect, DropDownItem } from "../../../ui";
import {
  AddEqCriteria, toggleEqCriteria, editCriteria, AddNumberCriteria,
  POINTER_TYPE_DDI_LOOKUP, AddStringCriteria,
  CRITERIA_TYPE_DDI_LOOKUP, toggleStringCriteria,
} from ".";
import {
  EqCriteriaSelectionProps, NumberCriteriaProps,
  CriteriaSelectionProps, LocationSelectionProps, GroupCriteriaProps,
  AddCriteriaState,
  DEFAULT_CRITERIA,
} from "./interfaces";
import { t } from "../../../i18next_wrapper";
import { PointGroup } from "farmbot/dist/resources/api_resources";
import { PLANT_STAGE_DDI_LOOKUP } from "../../plants/edit_plant_status";

export class EqCriteriaSelection<T extends string | number>
  extends React.Component<EqCriteriaSelectionProps<T>> {
  render() {
    const { criteriaField, criteriaKey, group, dispatch } = this.props;
    return <div className={`${this.props.type}-eq-criteria`}>
      <AddEqCriteria<T> group={group} dispatch={dispatch}
        type={this.props.type} criteriaField={criteriaField}
        criteriaKey={criteriaKey} />
      {criteriaField && Object.entries(criteriaField)
        .map(([key, values]: [string, T[]], keyIndex) =>
          values && values.length > 0 &&
          <div key={keyIndex}>
            <label>{key}</label>
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
                    onClick={() => {
                      const tempCriteriaField = cloneDeep(criteriaField);
                      toggleEqCriteria<T>(tempCriteriaField)(key, value);
                      dispatch(editCriteria(group, {
                        [criteriaKey]: tempCriteriaField
                      }));
                    }}>
                    <i className="fa fa-minus" />
                  </button>
                </Col>
              </Row>)}
          </div>)}
    </div>;
  }
}

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
              <input key={"" + keyIndex}
                name="value"
                disabled={true}
                value={value} />
            </Col>
            <Col xs={2}>
              <button className="fb-button red"
                title={t("remove number criteria")}
                onClick={() => {
                  const tempNumberCriteria = cloneDeep(criteriaField);
                  delete tempNumberCriteria[key];
                  props.dispatch(editCriteria(props.group, {
                    [props.criteriaKey]: tempNumberCriteria
                  }));
                }}>
                <i className="fa fa-minus" />
              </button>
            </Col>
          </Row>
        </div>)}
  </div>;
};

const DAY_OPERATOR_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  ["<"]: { label: t("less than"), value: "<" },
  [">"]: { label: t("greater than"), value: ">" },
});

export const DaySelection = (props: CriteriaSelectionProps) => {
  const { group, criteria, dispatch } = props;
  const dayCriteria = criteria.day || cloneDeep(DEFAULT_CRITERIA.day);
  return <div className="day-criteria">
    <label>{t("Age selection")}</label>
    <Row>
      <Col xs={5}>
        <FBSelect key={JSON.stringify(criteria)}
          list={[DAY_OPERATOR_DDI_LOOKUP()["<"],
          DAY_OPERATOR_DDI_LOOKUP()[">"]]}
          selectedItem={DAY_OPERATOR_DDI_LOOKUP()[dayCriteria.op]}
          onChange={ddi => dispatch(editCriteria(group, {
            day: {
              days_ago: dayCriteria.days_ago,
              op: ddi.value as PointGroup["criteria"]["day"]["op"]
            }
          }))} />
      </Col>
      <Col xs={3}>
        <input type="number" value={dayCriteria.days_ago} name="days_ago"
          onChange={e => {
            const { op } = dayCriteria;
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

export const LocationSelection = (props: LocationSelectionProps) => {
  const { group, criteria, dispatch } = props;
  const gtCriteria = criteria.number_gt || {};
  const ltCriteria = criteria.number_lt || {};
  return <div className="location-criteria">
    <label>{t("Location selection")}</label>
    {["x", "y"].map(axis =>
      <Row key={axis}>
        <Col xs={4}>
          <input key={JSON.stringify(gtCriteria)}
            type="number"
            name={`${axis}-number-gt`}
            defaultValue={gtCriteria[axis]}
            onBlur={e => {
              const tempGtCriteria = cloneDeep(gtCriteria);
              tempGtCriteria[axis] = parseInt(e.currentTarget.value);
              dispatch(editCriteria(group, { number_gt: tempGtCriteria }));
            }} />
        </Col>
        <Col xs={1}>
          <p>{"<"}</p>
        </Col>
        <Col xs={1}>
          <label>{axis}</label>
        </Col>
        <Col xs={1}>
          <p>{"<"}</p>
        </Col>
        <Col xs={4}>
          <input key={JSON.stringify(ltCriteria)}
            type="number"
            name={`${axis}-number-lt`}
            defaultValue={ltCriteria[axis]}
            onBlur={e => {
              const tempLtCriteria = cloneDeep(ltCriteria);
              tempLtCriteria[axis] = parseInt(e.currentTarget.value);
              dispatch(editCriteria(group, { number_lt: tempLtCriteria }));
            }} />
        </Col>
      </Row>)}
  </div>;
};

export class AddCriteria
  extends React.Component<GroupCriteriaProps, AddCriteriaState> {

  labelLookup = (key: string, value: string) => {
    switch (key) {
      case "openfarm_slug":
        return capitalize(value);
      case "pointer_type":
        return POINTER_TYPE_DDI_LOOKUP()[value].label;
      case "plant_stage":
        return PLANT_STAGE_DDI_LOOKUP()[value].label;
    }
  }

  render() {
    const { props } = this;
    const stringCriteria = this.props.group.body.criteria?.string_eq || {};
    const displayedCriteria = Object.entries(stringCriteria)
      .filter(([key, _values]) =>
        ["openfarm_slug", "pointer_type", "plant_stage"].includes(key));
    return <div className={"add-criteria"}>
      <AddStringCriteria
        group={props.group} dispatch={props.dispatch} slugs={props.slugs} />
      {displayedCriteria.map(([key, values]) =>
        values && values.map((value, index) =>
          <div key={key + index} className={"criteria-string"}>
            <Row>
              <Col xs={5}>
                <input value={CRITERIA_TYPE_DDI_LOOKUP()[key].label}
                  name="key"
                  disabled={true} />
              </Col>
              <Col xs={5}>
                <input value={this.labelLookup(key, value)}
                  name="value"
                  disabled={true} />
              </Col>
              <Col xs={2}>
                <button className="fb-button red"
                  title={t("remove criteria")}
                  onClick={() => props.dispatch(
                    toggleStringCriteria(props.group, key, value))}>
                  <i className="fa fa-minus" />
                </button>
              </Col>
            </Row>
          </div>))}
    </div>;
  }
}
