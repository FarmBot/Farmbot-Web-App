import * as React from "react";
import { FBSelect } from "../../../ui/new_fb_select";
import { generateList, PARENT_DDI } from "./generate_list";
import { handleSelect } from "./handle_select";
import { formatSelectedDropdown } from "./format_selected_dropdown";
import { TileMoveAbsProps } from "./interfaces";
import { DropDownItem } from "../../../ui/index";

interface TileMoveAbsSelectProps extends TileMoveAbsProps {
  additionalItems?: DropDownItem[];
  hideNone?: boolean;
}

export function TileMoveAbsSelect(props: TileMoveAbsSelectProps) {
  const i = props.selectedItem;
  return <FBSelect
    allowEmpty={!!props.hideNone}
    list={generateList(props.resources, props.additionalItems || PARENT_DDI)}
    selectedItem={formatSelectedDropdown(props.resources, i)}
    onChange={(x) => props.onChange(handleSelect(props.resources, x))} />;
}
