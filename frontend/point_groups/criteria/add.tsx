import React from "react";
import { t } from "../../i18next_wrapper";
import { cloneDeep, uniq } from "lodash";
import { Row } from "../../ui";
import { editCriteria } from ".";
import {
  AddEqCriteriaProps,
  AddEqCriteriaState,
  NumberCriteriaProps,
  AddNumberCriteriaState,
} from "./interfaces";

export class AddEqCriteria<T extends string | number>
  extends React.Component<AddEqCriteriaProps<T>, AddEqCriteriaState> {
  state: AddEqCriteriaState = { key: "", value: "" };

  commit = () => {
    const { dispatch, group, criteriaKey, eqCriteria } = this.props;
    const tempEqCriteria = cloneDeep(eqCriteria);
    const tempValues = tempEqCriteria[this.state.key] || [];
    const value = this.props.type == "number"
      ? parseInt(this.state.value)
      : this.state.value;
    this.state.value && tempValues.push(value as T);
    tempEqCriteria[this.state.key] = uniq(tempValues);
    dispatch(editCriteria(group, { [criteriaKey]: tempEqCriteria }));
    this.setState({ key: "", value: "" });
  };

  render() {
    return <div className={`add-${this.props.type}-eq-criteria grid`}>
      <Row className="advanced-group-criteria">
        <input type="string"
          placeholder={t("field")}
          value={this.state.key}
          onChange={e => this.setState({ key: e.currentTarget.value })} />
        {"="}
        <input type={this.props.type}
          name="value"
          placeholder={t("value")}
          value={this.state.value}
          onChange={e => this.setState({ value: e.currentTarget.value })} />
        <button className="fb-button green"
          title={t("add filter")}
          onClick={this.commit}>
          <i className="fa fa-plus" />
        </button>
      </Row>
    </div>;
  }
}

export class AddNumberCriteria
  extends React.Component<NumberCriteriaProps, AddNumberCriteriaState> {
  state: AddNumberCriteriaState = { key: "", value: 0 };

  commit = () => {
    const { dispatch, group, criteriaKey } = this.props;
    const tempNumberCriteria = cloneDeep(group.body.criteria[criteriaKey]);
    tempNumberCriteria[this.state.key] = this.state.value;
    dispatch(editCriteria(group, { [criteriaKey]: tempNumberCriteria }));
    this.setState({ key: "", value: 0 });
  };

  changeKey = (e: React.FormEvent<HTMLInputElement>) =>
    this.setState({ key: e.currentTarget.value });

  changeValue = (e: React.FormEvent<HTMLInputElement>) =>
    this.setState({ value: parseInt(e.currentTarget.value) });

  render() {
    return <div className="add-number-criteria">
      <Row className="advanced-group-criteria">
        <input type="string"
          name="key"
          placeholder={t("field")}
          value={this.state.key}
          onChange={this.changeKey} />
        {this.props.criteriaKey == "number_gt" ? ">" : "<"}
        <input type="number"
          name="value"
          value={this.state.value}
          onChange={this.changeValue} />
        <button className="fb-button green"
          title={t("add number filter")}
          onClick={this.commit}>
          <i className="fa fa-plus" />
        </button>
      </Row>
    </div>;
  }
}
