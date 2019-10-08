import * as React from "react";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import {
  FBSelect,
  DropDownItem
} from "../../ui";
import { t } from "../../i18next_wrapper";
import { trim } from "../../util/util";
import { TaggedPlant } from "../map/interfaces";
import { shuffle, sortBy } from "lodash";

interface Props {
  onChange(value: PointGroupSortType): void;
  value: PointGroupSortType;
}

const optionsTable: Record<PointGroupSortType, string> = {
  "random": "Random Order",
  "xy_ascending": "X/Y, Ascending",
  "xy_descending": "X/Y, Descending",
  "yx_ascending": "Y/X, Ascending",
  "yx_descending": "Y/X Descending",
}; // Typechecker will remind us when this needs an update. Don't simplify - RC

const optionPlusDescriptions =
  (Object
    .entries(optionsTable) as [PointGroupSortType, string][])
    .map(x => ({ label: x[1], value: x[0] }));

const optionList =
  optionPlusDescriptions.map(x => x.value);

export const isSortType = (x: unknown): x is PointGroupSortType => {
  return optionList.includes(x as PointGroupSortType);
};

const selected = (value: PointGroupSortType) => ({
  label: t(optionsTable[value] || value),
  value: value
});

export const sortTypeChange = (cb: Function) => (ddi: DropDownItem) => {
  const { value } = ddi;
  isSortType(value) && cb(value);
};

const SORT_DESC = trim(`When executing a sequence
over a Group of locations, FarmBot will travel to
each group member in the order of the chosen sort
method. If the random option is chosen, FarmBot will
travel in a random order every time, so the
ordering shown below will only be representative.`);

export function PointGroupSortSelector(p: Props) {

  return <div>
    <div className="default-value-tooltip">
      <label>
        {t("SORT BY")}
      </label>
    </div>
    <FBSelect
      list={optionPlusDescriptions}
      selectedItem={selected(p.value as PointGroupSortType)}
      onChange={sortTypeChange(p.onChange)} />
    <p>
      {(p.value == "random") ? t(SORT_DESC) : ""}
    </p>
  </div>;
}

type Sorter = (p: TaggedPlant[]) => TaggedPlant[];
type SortDictionary = Record<PointGroupSortType, Sorter>;

export const SORT_OPTIONS: SortDictionary = {
  random(plants) {
    return shuffle(plants);
  },
  xy_ascending(plants) {
    return sortBy(plants, ["body.x", "body.y"]);
  },
  xy_descending(plants) {
    return sortBy(plants, ["body.x", "body.y"]).reverse();
  },
  yx_ascending(plants) {
    return sortBy(plants, ["body.y", "body.x"]);
  },
  yx_descending(plants) {
    return sortBy(plants, ["body.y", "body.x"]).reverse();
  }
};
export const sortGroupBy =
  (st: PointGroupSortType, p: TaggedPlant[]) => SORT_OPTIONS[st](p);
