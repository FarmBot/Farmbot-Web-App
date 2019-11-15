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
  onChange(key: PlantGridKey, value: number): void;
}

interface InputCellProps {
  gridKey: PlantGridKey;
  onChange: GridInputProps["onChange"];
  grid: PlantGridData;
}

const pairs: [PlantGridKey, PlantGridKey][] = [
  ["startX", "startY"],
  ["numPlantsH", "spacingH"],
  ["numPlantsV", "spacingV"],
];

const LABELS: Record<PlantGridKey, { icon: string, text: string }> = {
  "startX": {
    icon: "fa-arrow-right",
    text: "Starting X"
  },
  "startY": {
    icon: "fa-arrow-down",
    text: "starting Y"
  },
  "spacingH": {
    icon: "fa-arrows-h",
    text: "Spacing (MM)"
  },
  "spacingV": {
    icon: "fa-arrows-v",
    text: "Spacing (MM)"
  },
  "numPlantsH": {
    icon: "fa-arrows-h",
    text: "# of plants"
  },
  "numPlantsV": {
    icon: "fa-arrows-v",
    text: "# of plants"
  },
};

const createCB = (key: PlantGridKey, cb: GridInputProps["onChange"]) =>
  (x: React.ChangeEvent<HTMLInputElement>) => {
    const number = parseInt(x.currentTarget.value, 10);
    (!isNaN(number)) && cb(key, number);
  };

function InputCell({ gridKey, onChange, grid }: InputCellProps) {
  return <Col xs={6}>
    <label className={"white-text"}>
      <i className={"fa " + LABELS[gridKey].icon} />
      {" "}{t(LABELS[gridKey].text)}
    </label>
    <BlurableInput
      value={grid[gridKey]}
      onCommit={createCB(gridKey, onChange)} />
  </Col>;
}

export function GridInput(props: GridInputProps) {
  return <Col>
    {pairs.map(([left, right]) => {
      return <Row key={left + right}>
        <InputCell
          gridKey={left}
          onChange={props.onChange}
          grid={props.grid} />
        <InputCell
          gridKey={right}
          onChange={props.onChange}
          grid={props.grid} />
      </Row>;
    })}
  </Col>;
}
