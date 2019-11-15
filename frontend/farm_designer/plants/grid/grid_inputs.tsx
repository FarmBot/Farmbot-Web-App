import React from "react";
import { BlurableInput } from "../../../ui/blurable_input";
import {
  PlantGridData,
  PlantGridKey,
  plantGridKeys,
} from "./constants";

interface GridInputProps {
  disabled: boolean;
  grid: PlantGridData;
  onChange(key: PlantGridKey, value: number): void;
}

const createCB = (key: PlantGridKey, cb: GridInputProps["onChange"]) =>
  (x: React.ChangeEvent<HTMLInputElement>) => {
    const number = parseInt(x.currentTarget.value, 10);
    if (!isNaN(number)) {
      cb(key, number);
    }
  };

export function GridInput(props: GridInputProps) {
  return <div>
    {plantGridKeys.map(key => {
      return <div key={key}>
        {key}
        <BlurableInput
          disabled={props.disabled}
          value={props.grid[key]}
          onCommit={createCB(key, props.onChange)} />
      </div>;
    })}
  </div>;
}
