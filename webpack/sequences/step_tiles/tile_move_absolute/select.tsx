import * as React from "react";
import { Feature } from "../../../devices/interfaces";
import { FBSelect } from "../../../ui/index";
import { formatSelectedDropdown } from "./format_selected_dropdown";
import { generateList, PARENT_DDI } from "./generate_list";
import { TileMoveAbsProps } from "./interfaces";
import {
  convertDdiToCelery
} from "../../../resources/sequence_meta";

export function TileMoveAbsSelect(props: TileMoveAbsProps) {
  const { selectedItem, resources, shouldDisplay } = props;
  const i = selectedItem;
  const additionalItems = shouldDisplay(Feature.variables) ? PARENT_DDI : [];
  const list = generateList(resources, additionalItems);
  return <FBSelect
    allowEmpty={true}
    list={list}
    selectedItem={formatSelectedDropdown(resources, i)}
    onChange={(d) => props.onChange(convertDdiToCelery(resources, d, props.uuid))} />;
}
