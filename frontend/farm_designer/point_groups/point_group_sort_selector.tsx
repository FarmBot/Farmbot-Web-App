import * as React from "react";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";

interface Props {
  onChange(value: PointGroupSortType): void;
  value: PointGroupSortType;
}

const optionsTable: Record<PointGroupSortType, string> = {
  "random": "Randomly",
  "xy_ascending": "X/Y, Ascending",
  "xy_decending": "X/Y, Descending",
  "yx_ascending": "Y/X, Ascending",
  "yx_decending": "Y/X Descending",
}; // Typechecker will remind us when this needs an update. Don't simplify - RC

const everyOption =
  Object.entries(optionsTable) as [PointGroupSortType, string][];

export function PointGroupSortSelector(p: Props) {
  return <div>
    Sort:
    <hr />
    {everyOption.map(([x, y]) => {
      return <button onClick={() => p.onChange(x)} key={x}>
        {p.value == x ? "=>" : ""}{y}
      </button>;
    })}
  </div>;
}
