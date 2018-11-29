import * as React from "react";
import { generateList, PARENT_DDI } from "./generate_list";
import { formatSelectedDropdown } from "./format_selected_dropdown";
import { TileMoveAbsProps } from "./interfaces";
import { FBSelect, DropDownItem } from "../../../ui/index";
import { Feature } from "../../../devices/interfaces";

export function TileMoveAbsSelect(props: TileMoveAbsProps) {
  const { selectedItem, resources, shouldDisplay } = props;
  const i = selectedItem;
  const additionalItems: DropDownItem[] =
    shouldDisplay(Feature.variables) ? PARENT_DDI : [];
  return <FBSelect
    allowEmpty={true}
    list={generateList(resources, additionalItems)}
    selectedItem={formatSelectedDropdown(resources, i)}
    onChange={(_x: DropDownItem) => {
      console.error("RE-write this!");
    }} />;
}
