import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { cloneDeep, capitalize } from "lodash";
import { Row, Col, FBSelect, DropDownItem } from "../../../ui";
import { editCriteria, toggleStringCriteria } from ".";
import {
  AddEqCriteriaProps,
  AddEqCriteriaState,
  NumberCriteriaProps,
  AddNumberCriteriaState,
  AddStringCriteriaProps,
} from "./interfaces";
import {
  PLANT_STAGE_DDI_LOOKUP, PLANT_STAGE_LIST,
} from "../../plants/edit_plant_status";

export class AddEqCriteria<T extends string | number>
  extends React.Component<AddEqCriteriaProps<T>, AddEqCriteriaState> {
  state: AddEqCriteriaState = { key: "", value: "" };

  commit = () => {
    const { dispatch, group, criteriaKey, criteriaField } = this.props;
    const tempEqCriteria = cloneDeep(criteriaField || {});
    const tempValues = tempEqCriteria[this.state.key] || [];
    const value = this.props.type == "number"
      ? parseInt(this.state.value)
      : this.state.value;
    this.state.value && tempValues.push(value as T);
    tempEqCriteria[this.state.key] = tempValues;
    dispatch(editCriteria(group, { [criteriaKey]: tempEqCriteria }));
    this.setState({ key: "", value: "" });
  }

  render() {
    return <div className={`add-${this.props.type}-eq-criteria`}>
      <Row>
        <Col xs={4}>
          <input type="string"
            placeholder={t("field")}
            value={this.state.key}
            onChange={e => this.setState({ key: e.currentTarget.value })} />
        </Col>
        <Col xs={1}>
          {"="}
        </Col>
        <Col xs={4}>
          <input type={this.props.type}
            name="value"
            placeholder={t("value")}
            value={this.state.value}
            onChange={e => this.setState({ value: e.currentTarget.value })} />
        </Col>
        <Col xs={2}>
          <button className="fb-button green"
            title={t("add criteria")}
            onClick={this.commit}>
            <i className="fa fa-plus" />
          </button>
        </Col>
      </Row>
    </div>;
  }
}

export const CRITERIA_TYPE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  pointer_type: { label: t("Point Type"), value: "pointer_type" },
  plant_stage: { label: t("Plant Status"), value: "plant_stage" },
  openfarm_slug: { label: t("Plant Type"), value: "openfarm_slug" },
});
export const CRITERIA_TYPE_LIST = () => [
  CRITERIA_TYPE_DDI_LOOKUP().pointer_type,
  CRITERIA_TYPE_DDI_LOOKUP().plant_stage,
  CRITERIA_TYPE_DDI_LOOKUP().openfarm_slug,
];

export const POINTER_TYPE_DDI_LOOKUP = (): { [x: string]: DropDownItem } => ({
  Plant: { label: t("Plants"), value: "Plant" },
  GenericPointer: { label: t("Points"), value: "GenericPointer" },
  ToolSlot: { label: t("Slots"), value: "ToolSlot" },
});
export const POINTER_TYPE_LIST = () => [
  POINTER_TYPE_DDI_LOOKUP().Plant,
  POINTER_TYPE_DDI_LOOKUP().GenericPointer,
  POINTER_TYPE_DDI_LOOKUP().ToolSlot,
];

export class AddStringCriteria
  extends React.Component<AddStringCriteriaProps, AddEqCriteriaState> {
  state: AddEqCriteriaState = { key: "", value: "" };

  commit = () => {
    if (this.state.key && this.state.value) {
      this.props.dispatch(toggleStringCriteria(this.props.group,
        this.state.key, this.state.value));
      this.setState({ key: "", value: "" });
    }
  }

  get key() { return JSON.stringify(this.props.group.body.criteria || {}); }

  change = (ddi: DropDownItem) => this.setState({ value: "" + ddi.value });

  get selected() {
    switch (this.state.key) {
      case "openfarm_slug":
        return this.state.value
          ? { label: t(capitalize(this.state.value)), value: this.state.value }
          : undefined;
      case "pointer_type":
        return this.state.value
          ? POINTER_TYPE_DDI_LOOKUP()[this.state.value]
          : undefined;
      case "plant_stage":
        return this.state.value
          ? PLANT_STAGE_DDI_LOOKUP()[this.state.value]
          : undefined;
      default:
        return undefined;
    }
  }

  get options() {
    switch (this.state.key) {
      case "openfarm_slug":
        return this.props.slugs.map(slug =>
          ({ label: t(capitalize(slug)), value: slug }));
      case "pointer_type":
        return POINTER_TYPE_LIST();
      case "plant_stage":
        return PLANT_STAGE_LIST();
      default:
        return [];
    }
  }

  render() {
    const noKey = this.options.length < 1;
    return <div className={"add-string-criteria"}>
      <Row>
        <Col xs={5}>
          <FBSelect key={this.key}
            customNullLabel={t("Select")}
            list={CRITERIA_TYPE_LIST()}
            selectedItem={CRITERIA_TYPE_DDI_LOOKUP()[this.state.key]}
            onChange={ddi => this.setState({ key: "" + ddi.value })} />
        </Col>
        <Col xs={5}>
          <FBSelect key={this.key}
            extraClass={noKey ? "disabled" : ""}
            list={this.options}
            selectedItem={this.selected}
            onChange={this.change} />
        </Col>
        <Col xs={2}>
          <button className="fb-button green"
            title={t("add string criteria")}
            onClick={this.commit}>
            <i className="fa fa-plus" />
          </button>
        </Col>
      </Row>
    </div>;
  }
}

export class AddNumberCriteria
  extends React.Component<NumberCriteriaProps, AddNumberCriteriaState> {
  state: AddNumberCriteriaState = { key: "", value: 0 };

  commit = () => {
    const { dispatch, group, criteriaKey } = this.props;
    const tempNumberCriteria =
      cloneDeep(group.body.criteria?.[criteriaKey] || {});
    tempNumberCriteria[this.state.key] = this.state.value;
    dispatch(editCriteria(group, { [criteriaKey]: tempNumberCriteria }));
    this.setState({ key: "", value: 0 });
  }

  changeKey = (e: React.FormEvent<HTMLInputElement>) =>
    this.setState({ key: e.currentTarget.value })

  changeValue = (e: React.FormEvent<HTMLInputElement>) =>
    this.setState({ value: parseInt(e.currentTarget.value) })

  render() {
    return <div className="add-number-criteria">
      <Row>
        <Col xs={4}>
          <input type="string"
            name="key"
            placeholder={t("field")}
            value={this.state.key}
            onChange={this.changeKey} />
        </Col>
        <Col xs={1}>
          {this.props.criteriaKey == "number_gt" ? ">" : "<"}
        </Col>
        <Col xs={4}>
          <input type="number"
            name="value"
            value={this.state.value}
            onChange={this.changeValue} />
        </Col>
        <Col xs={2}>
          <button className="fb-button green"
            title={t("add number criteria")}
            onClick={this.commit}>
            <i className="fa fa-plus" />
          </button>
        </Col>
      </Row>
    </div>;
  }
}
