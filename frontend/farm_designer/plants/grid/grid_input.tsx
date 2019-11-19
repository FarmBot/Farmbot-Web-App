import React from "react";
import {
  PlantGridData,
  PlantGridKey,
} from "./constants";
import { Col, Row, BlurableInput } from "../../../ui";
import { t } from "../../../i18next_wrapper";

interface GridInputProps {
  disabled: boolean;
  grid: PlantGridData;
  xy_swap: boolean;
  onChange(key: PlantGridKey, value: number): void;
}

export interface InputCellProps {
  gridKey: PlantGridKey;
  xy_swap: boolean;
  onChange: GridInputProps["onChange"];
  grid: PlantGridData;
}

interface LabelData {
  /** A `font-awesome` icon next to the input  box label.  */
  icon: string;
  /** What icon should we use if the user has `xy_swap` enabled? */
  swapped_icon: string;
  text: string;
}

const pairs: [PlantGridKey, PlantGridKey][] = [
  ["startX", "startY"],
  ["numPlantsH", "numPlantsV"],
  ["spacingH", "spacingV"],
];

const LABELS: Record<PlantGridKey, LabelData> = {
  "startX": {
    icon: "fa-arrow-right",
    swapped_icon: "fa-arrow-down",
    text: "Starting X"
  },
  "startY": {
    icon: "fa-arrow-down",
    swapped_icon: "fa-arrow-right",
    text: "starting Y"
  },
  "spacingH": {
    icon: "fa-arrows-h",
    swapped_icon: "fa-arrows-v",
    text: "Spacing (MM)"
  },
  "spacingV": {
    icon: "fa-arrows-v",
    swapped_icon: "fa-arrows-h",
    text: "Spacing (MM)"
  },
  "numPlantsH": {
    icon: "fa-arrows-h",
    swapped_icon: "fa-arrows-v",
    text: "# of plants"
  },
  "numPlantsV": {
    icon: "fa-arrows-v",
    swapped_icon: "fa-arrows-h",
    text: "# of plants"
  },
};

export const createCB =
  (key: PlantGridKey, cb: GridInputProps["onChange"]) =>
    (x: React.ChangeEvent<HTMLInputElement>) => {
      const number = parseInt(x.currentTarget.value, 10);
      (!isNaN(number)) && cb(key, number);
    };

export function InputCell({ gridKey, onChange, grid, xy_swap }: InputCellProps) {
  const data = LABELS[gridKey];
  const icon = xy_swap ? data.swapped_icon : data.icon;
  return <Col xs={6}>
    <label className={"white-text"}>
      <i className={"fa " + icon} />
      {" "}{t(LABELS[gridKey].text)}
    </label>
    <BlurableInput
      value={grid[gridKey]}
      onCommit={createCB(gridKey, onChange)} />
  </Col>;
}

export function GridInput(props: GridInputProps) {
  const { xy_swap } = props;
  return <Col>
    {pairs.map(([left, right]) => {
      return <Row key={left + right}>
        <InputCell
          xy_swap={xy_swap}
          gridKey={left}
          onChange={props.onChange}
          grid={props.grid} />
        <InputCell
          xy_swap={xy_swap}
          gridKey={right}
          onChange={props.onChange}
          grid={props.grid} />
      </Row>;
    })}
  </Col>;
}
