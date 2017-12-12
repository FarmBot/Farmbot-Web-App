import * as React from "react";
import { FBSelect } from "../../../ui/new_fb_select";
import { generateList/*, PARENT_DDI*/ } from "./generate_list";
import { handleSelect } from "./handle_select";
import { formatSelectedDropdown } from "./format_selected_dropdown";
import { TileMoveAbsProps } from "./interfaces";
import { DropDownItem } from "../../../ui/index";

interface TileMoveAbsSelectProps extends TileMoveAbsProps {
  additionalItems?: DropDownItem[];
}

export function TileMoveAbsSelect(props: TileMoveAbsSelectProps) {
  const i = props.selectedItem;
  // Use `props.additionalItems || PARENT_DDI` when it is time to release the
  // variables feature.
  const list: DropDownItem[] = []; /* props.additionalItems || PARENT_DDI*/
  return <FBSelect
    allowEmpty={true}
    list={generateList(props.resources, list)}
    selectedItem={formatSelectedDropdown(props.resources, i)}
    onChange={(x) => props.onChange(handleSelect(props.resources, x))} />;
}
