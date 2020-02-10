import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { overwrite, save } from "../../../api/crud";
import {
  CheckboxSelections, DaySelection, EqCriteriaSelection,
  NumberCriteriaSelection, LocationSelection, AddCriteria,
} from ".";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, GroupCriteriaState,
  DEFAULT_CRITERIA,
} from "./interfaces";
import { ExpandableHeader } from "../../../ui";
import { Collapse } from "@blueprintjs/core";

export class GroupCriteria extends
  React.Component<GroupCriteriaProps, GroupCriteriaState> {
  state: GroupCriteriaState = { advanced: false, clearCount: 0 };
  render() {
    const { group, dispatch, slugs } = this.props;
    const criteria = group.body.criteria || {};
    const commonProps = { group, criteria, dispatch };
    return <div className="group-criteria">
      <label className="criteria-heading">{t("criteria")}</label>
      <button className="fb-button red" onClick={() => {
        dispatch(overwrite(group, {
          ...group.body, criteria: DEFAULT_CRITERIA
        }));
        dispatch(save(group.uuid));
      }}>
        {t("clear all criteria")}
      </button>
      <div className="group-criteria-presets">
        <label>{t("presets")}</label>
        <CheckboxSelections group={group} dispatch={dispatch} />
      </div>
      <DaySelection {...commonProps} />
      <LocationSelection {...commonProps} />
      <label>{t("additional criteria")}</label>
      <AddCriteria group={group} dispatch={dispatch} slugs={slugs} />
      <ExpandableHeader
        expanded={this.state.advanced}
        title={t("Advanced")}
        onClick={() => this.setState({ advanced: !this.state.advanced })} />
      <Collapse isOpen={this.state.advanced}>
        <label>{t("string criteria")}</label>
        <EqCriteriaSelection<string> {...commonProps}
          type={"string"} criteriaField={criteria.string_eq}
          criteriaKey={"string_eq"} />
        <label>{t("number criteria")}</label>
        <EqCriteriaSelection<number> {...commonProps}
          type={"number"} criteriaField={criteria.number_eq}
          criteriaKey={"number_eq"} />
        <NumberCriteriaSelection {...commonProps} criteriaKey={"number_lt"} />
        <NumberCriteriaSelection {...commonProps} criteriaKey={"number_gt"} />
      </Collapse>
    </div>;
  }
}

export const GroupPointCountBreakdown = (props: GroupPointCountBreakdownProps) =>
  <div className={"criteria-point-count-breakdown"}>
    <div className={"manual-group-member-count"}>
      <div>
        {props.manualCount}
      </div>
      <p>{t("manually selected")}</p>
    </div>
    <div className={"criteria-group-member-count"}>
      <div>
        {props.totalCount - props.manualCount}
      </div>
      <p>{t("selected by criteria")}</p>
    </div>
  </div>;
