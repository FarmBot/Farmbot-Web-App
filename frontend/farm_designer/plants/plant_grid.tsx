import React, { useState } from "react";
import { BlurableInput } from "../../ui";

type PlantGridInfoKey =
  "startX" | "startY" | "spacingH" | "spacingV" | "numPlantsH" | "numPlantsV";

type PlantGridInfo = Record<PlantGridInfoKey, number>;

const DEFAULT_INFO: PlantGridInfo = {
  startX: 0,
  startY: 0,
  spacingH: 0,
  spacingV: 0,
  numPlantsH: 0,
  numPlantsV: 0,
};

const keys: PlantGridInfoKey[] = [
  "numPlantsH",
  "numPlantsV",
  "spacingH",
  "spacingV",
  "startX",
  "startY",
];

export function PlantGrid(_: {}) {
  const [info, setInfo] = useState(DEFAULT_INFO);
  const onchange = (key: PlantGridInfoKey) =>
    (x: React.ChangeEvent<HTMLInputElement>) => setInfo({
      ...info,
      [key]: parseInt(x.currentTarget.value, 10)
    });
  const inputs = keys.map(key => {
    return <div>
      {key}
      <BlurableInput value={info[key]} onCommit={onchange(key)} />
    </div>;
  });
  return <div>
    <hr />
    {inputs}
    <button>
      Apply
    </button>
  </div>;
}
