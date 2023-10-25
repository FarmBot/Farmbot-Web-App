import React from "react";
import {
  PlantGridKey, GridInputProps, InputCellProps,
} from "./interfaces";
import { Col, Row } from "../../ui";
import { t } from "../../i18next_wrapper";
import { UseCurrentLocation } from "../../tools/tool_slot_edit_components";

export const getLabel = (
  gridKey: PlantGridKey,
  itemType: "points" | "plants",
): string => {
  switch (gridKey) {
    case "startX":
    case "startY":
      return t("Start");
    case "spacingH":
    case "spacingV":
      return t("Spacing (MM)");
    case "numPlantsH":
    case "numPlantsV":
      return itemType == "points" ? t("# of points") : t("# of plants");
  }
};

export function InputCell(props: InputCellProps) {
  const { gridKey, onChange, grid, preview } = props;
  const [value, setValue] = React.useState("" + grid[gridKey]);
  return <Col xs={3}>
    <input name={gridKey} className={gridKey}
      type={"number"}
      value={value}
      onBlur={() => {
        const number = parseInt(value, 10);
        !isNaN(number) && onChange(gridKey, number);
        isNaN(number)
          ? setValue("" + grid[gridKey])
          : preview();
      }}
      onChange={e => setValue(e.currentTarget.value)} />
  </Col>;
}

const pairs: [PlantGridKey, PlantGridKey][] = [
  ["startX", "startY"],
  ["numPlantsH", "numPlantsV"],
  ["spacingH", "spacingV"],
];

export function GridInput(props: GridInputProps) {
  const { xy_swap } = props;
  const vertical = "fa-arrows-v";
  const horizontal = "fa-arrows-h";
  return <div className="grid-input">
    <Row>
      <Col xsOffset={6} xs={3} className={"grid-axis-label"}>
        X
        <i className={`fa ${xy_swap ? vertical : horizontal}`} />
      </Col>
      <Col xs={3} className={"grid-axis-label"}>
        Y
        <i className={`fa ${xy_swap ? horizontal : vertical}`} />
      </Col>
    </Row>
    {pairs.map(([left, right]) =>
      <Row key={left + right}>
        <Col xs={6}>
          <label>{getLabel(left, props.itemType)}</label>
          {left == "startX" &&
            <UseCurrentLocation botPosition={props.botPosition}
              onChange={props.onUseCurrentPosition} />}
        </Col>
        <InputCell
          itemType={props.itemType}
          xy_swap={props.xy_swap}
          gridKey={left}
          onChange={props.onChange}
          preview={props.preview}
          grid={props.grid} />
        <InputCell
          itemType={props.itemType}
          xy_swap={props.xy_swap}
          gridKey={right}
          onChange={props.onChange}
          preview={props.preview}
          grid={props.grid} />
      </Row>)}
  </div>;
}
