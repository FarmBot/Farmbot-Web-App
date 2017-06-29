import * as React from "react";
import { DropDownItem } from "../ui/index";
import { MenuItem, Menu, Popover, Position, Classes, MenuDivider } from "@blueprintjs/core/dist";

let RECURSIVE_LIST: DropDownItem = {
  label: "Top Level",
  value: 0,
  children: [
    { label: "0.1", value: 0 },
    { label: "0.2", value: 0 },
    { label: "0.3", value: 0 },
    {
      label: "1.1",
      value: 0,
      children: [
        { label: "2.1", value: 0 },
        { label: "2.2", value: 0 }
      ]
    },
  ]
};

function renderDDI(parent: DropDownItem, key = "TOP_LEVEL"): JSX.Element {
  if (parent.children) {
    if (parent.children.length) {
      return <MenuItem text={parent.label} key={key + `_RECURSION`}>
        {parent.children.map((item, index) => renderDDI(item, key + `_CHILD_${index}`))}
      </MenuItem>;
    };
  }
  // base case
  return <MenuItem
    text={parent.label}
    key={key} />;
}

export function DeleteMe(props: any) {
  return <Popover
    content={renderDDI(RECURSIVE_LIST)}
    position={Position.RIGHT_BOTTOM}>
    <button className="pt-button pt-icon-share" type="button">
      Hey.
    </button>
  </Popover>;
}
