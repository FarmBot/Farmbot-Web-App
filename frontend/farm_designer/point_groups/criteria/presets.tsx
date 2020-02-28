import * as React from "react";
import { t } from "../../../i18next_wrapper";
import { every } from "lodash";
import { togglePointSelection } from ".";
import { CheckboxSelectionsProps, StringEqCriteria } from "./interfaces";

const CRITERIA_PRESETS = (): {
  description: string, criteria: Record<string, string>
}[] => [
    {
      description: t("planted plants"),
      criteria: {
        "pointer_type": "Plant",
        "plant_stage": "planted",
      }
    },
    {
      description: t("detected weeds"),
      criteria: {
        "meta.created_by": "plant-detection",
        "meta.color": "red",
      }
    },
    {
      description: t("created points"),
      criteria: {
        "meta.created_by": "farm-designer",
        "meta.type": "point",
      }
    },
    {
      description: t("created weeds"),
      criteria: {
        "meta.created_by": "farm-designer",
        "meta.type": "weed",
      }
    },
  ];

export const CheckboxSelections = (props: CheckboxSelectionsProps) => {
  const toggle = togglePointSelection(props.group);
  const stringCriteria = props.group.body.criteria?.string_eq;
  const selected = criteriaSelected(stringCriteria);
  return <div className={"criteria-checkbox-presets"}>
    {CRITERIA_PRESETS().map((selector, index) =>
      <div className="criteria-preset-checkbox" key={index}>
        <input type="radio"
          onChange={() => props.dispatch(toggle(selector.criteria))}
          checked={selected(selector.criteria)} />
        <p>{selector.description}</p>
      </div>)}
  </div>;
};

export const criteriaSelected = (stringCriteria: StringEqCriteria) =>
  (selectionCriteria: Record<string, string>) =>
    every(Object.entries(selectionCriteria).map(([key, value]) =>
      stringCriteria?.[key]?.includes(value)));
