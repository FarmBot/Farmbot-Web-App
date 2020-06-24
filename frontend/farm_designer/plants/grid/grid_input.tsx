import React from "react";
import {
  PlantGridKey, GridInputProps, InputCellProps, PlantGridLabelData,
} from "./interfaces";
import { Col, Row } from "../../../ui";
import { t } from "../../../i18next_wrapper";
import { UseCurrentLocation } from "../../tools/tool_slot_edit_components";

export const LABELS = (): Record<PlantGridKey, PlantGridLabelData> => ({
  startX: {
    label: t("Starting X"),
    regular_icon: "fa-arrow-right",
    swapped_icon: "fa-arrow-down",
  },
  startY: {
    label: t("starting Y"),
    regular_icon: "fa-arrow-down",
    swapped_icon: "fa-arrow-right",
  },
  spacingH: {
    label: t("Spacing (MM)"),
    regular_icon: "fa-arrows-h",
    swapped_icon: "fa-arrows-v",
  },
  spacingV: {
    label: t("Spacing (MM)"),
    regular_icon: "fa-arrows-v",
    swapped_icon: "fa-arrows-h",
  },
  numPlantsH: {
    label: t("# of plants"),
    regular_icon: "fa-arrows-h",
    swapped_icon: "fa-arrows-v",
  },
  numPlantsV: {
    label: t("# of plants"),
    regular_icon: "fa-arrows-v",
    swapped_icon: "fa-arrows-h",
  },
});

export function InputCell(props: InputCellProps) {
  const { gridKey, onChange, grid, xy_swap, preview } = props;
  const { label, regular_icon, swapped_icon } = LABELS()[gridKey];
  return <Col xs={5}>
    <label>
      <i className={`fa ${xy_swap ? swapped_icon : regular_icon}`} />
      {t(label)}
    </label>
    <input name={gridKey}
      value={grid[gridKey]}
      onBlur={preview}
      onChange={e => {
        const number = parseInt(e.currentTarget.value, 10);
        !isNaN(number) && onChange(gridKey, number);
      }} />
  </Col>;
}

const pairs: [PlantGridKey, PlantGridKey][] = [
  ["startX", "startY"],
  ["numPlantsH", "numPlantsV"],
  ["spacingH", "spacingV"],
];

export function GridInput(props: GridInputProps) {
  return <div className="grid-input">
    {pairs.map(([left, right]) =>
      <Row key={left + right}>
        <InputCell
          xy_swap={props.xy_swap}
          gridKey={left}
          onChange={props.onChange}
          preview={props.preview}
          grid={props.grid} />
        <InputCell
          xy_swap={props.xy_swap}
          gridKey={right}
          onChange={props.onChange}
          preview={props.preview}
          grid={props.grid} />
        {left == "startX" &&
          <UseCurrentLocation botPosition={props.botPosition}
            onChange={props.onUseCurrentPosition} />}
      </Row>)}
  </div>;
}
