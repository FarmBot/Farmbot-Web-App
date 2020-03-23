import * as React from "react";
import { t } from "../../../i18next_wrapper";
import {
  togglePointTypeCriteria,
  eqCriteriaSelected,
  hasSubCriteria,
  typeDisabled,
  PlantCriteria,
  PointCriteria,
  ToolCriteria,
} from ".";
import {
  CheckboxSelectionsProps,
  CheckboxSelectionsState,
  PointerType,
} from "./interfaces";
import { Checkbox } from "../../../ui";

const CRITERIA_POINT_TYPES =
  (): { label: string, pointerType: PointerType }[] => [
    { label: t("Plants"), pointerType: "Plant" },
    { label: t("Points and Weeds"), pointerType: "GenericPointer" },
    { label: t("Slots"), pointerType: "ToolSlot" },
  ];

export class CheckboxSelections extends React.Component
  <CheckboxSelectionsProps, Partial<CheckboxSelectionsState>> {
  state: CheckboxSelectionsState = {
    Plant: false, GenericPointer: false, ToolSlot: false, Weed: false
  };

  toggleMore = (section: keyof CheckboxSelectionsState) => () =>
    this.setState({ [section]: !this.state[section] });

  render() {
    const { group, dispatch, slugs } = this.props;
    const { criteria } = group.body;
    const selected = eqCriteriaSelected<string>(criteria);
    return <div className={"point-type-checkboxes"}>
      {CRITERIA_POINT_TYPES().map(({ label, pointerType }, index) => {
        const typeSelected = selected("pointer_type", pointerType);
        const partial = hasSubCriteria(criteria)(pointerType) && !typeSelected;
        return <div className="point-type-section" key={index}>
          <div className="point-type-checkbox"
            onClick={this.toggleMore(pointerType)}>
            <Checkbox
              onChange={() =>
                dispatch(togglePointTypeCriteria(group, pointerType))}
              checked={typeSelected}
              partial={partial}
              title={t(label)}
              disabled={typeDisabled(criteria, pointerType)}
              onClick={e => e.stopPropagation()} />
            <p>{label}</p>
            <i className={
              `fa fa-caret-${this.state[pointerType] ? "up" : "down"}`}
              title={this.state[pointerType]
                ? t("hide additional criteria")
                : t("show additional criteria")} />
          </div>
          {this.state.Plant && pointerType == "Plant" &&
            <PlantCriteria
              disabled={!typeSelected && !partial}
              group={group} dispatch={dispatch} slugs={slugs} />}
          {this.state.GenericPointer && pointerType == "GenericPointer" &&
            <PointCriteria
              disabled={!typeSelected && !partial}
              group={group} dispatch={dispatch} />}
          {this.state.ToolSlot && pointerType == "ToolSlot" &&
            <ToolCriteria
              disabled={!typeSelected && !partial}
              group={group} dispatch={dispatch} />}
        </div>;
      })}
    </div>;
  }
}
