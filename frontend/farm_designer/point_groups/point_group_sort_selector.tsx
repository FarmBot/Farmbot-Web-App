import * as React from "react";
import { PointGroupSortType } from "farmbot/dist/resources/api_resources";
import {
  FBSelect,
  DropDownItem,
  // ToolTip
} from "../../ui";
import { t } from "../../i18next_wrapper";
import { trim } from "../../util/util";
// import { trim } from "../../util/util";

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

const optionPlusDescriptions =
  (Object
    .entries(optionsTable) as [PointGroupSortType, string][])
    .map(x => ({ label: x[1], value: x[0] }));

const optionList =
  optionPlusDescriptions.map(x => x.value);

const isSortType = (x: unknown): x is PointGroupSortType => {
  return optionList.includes(x as PointGroupSortType);
};

// const HELP_TEXT = trim(`
// When executing a sequence over a Group of locations,
// FarmBot will travel to each group member in the order
// of the chosen sort method. If the random option is
// chosen, FarmBot will travel in a random order every
// time, so the ordering shown below will only be representative."
// `);

const selected = (value: PointGroupSortType) => ({
  label: t(optionsTable[value] || value),
  value: value
});

const onChange = (cb: Function) => (ddi: DropDownItem) => {
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
        {/* CSS IS HARD - RC <ToolTip helpText={t(HELP_TEXT)} /> */}
        {t("SORT BY")}
      </label>
    </div>
    <FBSelect
      list={optionPlusDescriptions}
      selectedItem={selected(p.value as PointGroupSortType)}
      onChange={onChange(p.onChange)} />
    <p>
      {t(SORT_DESC)}
    </p>
  </div>;
}
