import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { overwrite, save } from "../../../api/crud";
import {
  DaySelection, EqCriteriaSelection,
  NumberCriteriaSelection, LocationSelection, CheckboxSelections,
} from ".";
import {
  GroupCriteriaProps, GroupPointCountBreakdownProps, GroupCriteriaState,
  DEFAULT_CRITERIA, ClearCriteriaProps,
} from "./interfaces";
import { ToggleButton } from "../../../controls/toggle_button";

export class GroupCriteria extends
  React.Component<GroupCriteriaProps, GroupCriteriaState> {
  state: GroupCriteriaState = { advanced: false, clearCount: 0 };
  render() {
    const { group, dispatch, slugs } = this.props;
    const criteria = group.body.criteria;
    const commonProps = { group, criteria, dispatch };
    return <div className="group-criteria">
      <label className="criteria-heading">{t("criteria")}</label>
      <ToggleButton
        title={t("toggle advanced view")}
        toggleValue={!this.state.advanced}
        customText={{ textTrue: t("basic"), textFalse: t("advanced") }}
        toggleAction={() => this.setState({ advanced: !this.state.advanced })} />
      {!this.state.advanced
        ? <div className={"basic"}>
          <CheckboxSelections group={group} dispatch={dispatch} slugs={slugs} />
          <DaySelection {...commonProps} />
          <LocationSelection {...commonProps}
            editGroupAreaInMap={this.props.editGroupAreaInMap} />
        </div>
        : <div className={"advanced"}>
          <DaySelection {...commonProps} />
          <label>{t("string criteria")}</label>
          <EqCriteriaSelection<string> {...commonProps}
            type={"string"} eqCriteria={criteria.string_eq}
            criteriaKey={"string_eq"} />
          <label>{t("number criteria")}</label>
          <EqCriteriaSelection<number> {...commonProps}
            type={"number"} eqCriteria={criteria.number_eq}
            criteriaKey={"number_eq"} />
          <NumberCriteriaSelection {...commonProps} criteriaKey={"number_lt"} />
          <NumberCriteriaSelection {...commonProps} criteriaKey={"number_gt"} />
        </div>}
      <ClearCriteria dispatch={dispatch} group={group} />
    </div>;
  }
}

/** Reset all group criteria to defaults. */
const ClearCriteria = (props: ClearCriteriaProps) =>
  <button className="clear-criteria fb-button red no-float"
    title={t("clear all criteria")}
    onClick={() => {
      props.dispatch(overwrite(props.group, {
        ...props.group.body, criteria: DEFAULT_CRITERIA
      }));
      props.dispatch(save(props.group.uuid));
    }}>
    {t("clear all criteria")}
  </button>;

/** Show counts of manual and criteria selections. */
export const GroupPointCountBreakdown = (props: GroupPointCountBreakdownProps) =>
  <div className={"criteria-point-count-breakdown"}>
    <div className={"manual-group-member-count"}>
      <div className={"manual-selection-count"}>
        {props.manualCount}
      </div>
      <p>{t("manually selected")}</p>
    </div>
    <div className={"criteria-group-member-count"}>
      <div className={"criteria-selection-count"}>
        {props.totalCount - props.manualCount}
      </div>
      <p>{t("selected by criteria")}</p>
    </div>
  </div>;
