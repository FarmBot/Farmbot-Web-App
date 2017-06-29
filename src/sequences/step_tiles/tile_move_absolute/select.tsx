import * as React from "react";
import { FBSelect } from "../../../ui/new_fb_select";
import { generateList } from "./generate_list";
import { handleSelect } from "./handle_select";
import { formatSelectedDropdown } from "./format_selected_dropdown";
import { TileMoveAbsProps } from "./interfaces";

export function TileMoveAbsSelect(props: TileMoveAbsProps) {
  let i = props.selectedItem;
  return <FBSelect
    allowEmpty={true}
    list={generateList(props.resources)}
    selectedItem={formatSelectedDropdown(props.resources, i)}
    onChange={(x) => props.onChange(handleSelect(props.resources, x))} />;
}
