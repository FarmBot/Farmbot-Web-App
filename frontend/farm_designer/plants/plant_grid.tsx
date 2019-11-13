import React from "react";
import { BlurableInput } from "../../ui";

type PlantGridKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

interface PlantGridProps {
  dispatch: Function;
}

interface GridState {
  grid: Record<PlantGridKey, number>;
}

const DEFAULT_INFO: GridState = {
  grid: {
    startX: 0,
    startY: 0,
    spacingH: 0,
    spacingV: 0,
    numPlantsH: 0,
    numPlantsV: 0,
  }
};

const keys: PlantGridKey[] = [
  "numPlantsH",
  "numPlantsV",
  "spacingH",
  "spacingV",
  "startX",
  "startY",
];

export function PlantGrid(_: PlantGridProps) {
  const [state, setState] = React.useState(DEFAULT_INFO);

  const onchange = (key: PlantGridKey) =>
    (x: React.ChangeEvent<HTMLInputElement>) => setState({
      ...state,
      [key]: parseInt(x.currentTarget.value, 10)
    });

  const inputs = keys.map(key => {
    return <div>
      {key}
      <BlurableInput value={state.grid[key]} onCommit={onchange(key)} />
    </div>;
  });

  return <div>
    <hr />
    {inputs}
    <button>
      Preview
    </button>
  </div>;
}
