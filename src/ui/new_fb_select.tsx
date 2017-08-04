import * as React from "react";
import { DropDownItem } from "./fb_select";
import { Popover, Position, Menu, MenuItem } from "@blueprintjs/core/dist";

export interface FBSelectProps {
  /** Value to show. */
  selectedItem: DropDownItem | undefined;
  /** Notifies component user that something was clicked. */
  onChange(selection: DropDownItem): void;
  /** All possible select options. */
  list: DropDownItem[];
  /** Allow user to select no value. */
  allowEmpty?: boolean;
  /** Text shown before user selection. */
  placeholder?: string | undefined;
}

/** Used as a placeholder for a selection of "none" when allowEmpty is true. */
export const NULL_CHOICE: DropDownItem = Object.freeze({
  label: "None",
  value: ""
});

interface MenuNode {
  name: string;
  child?: MenuNode | undefined;
}

export class FBSelect extends React.Component<FBSelectProps, {}> {

  // get item() { return this.props.selectedItem || NULL_CHOICE; }
  // get list() {
  //   if (this.props.allowEmpty) {
  //     return this.props.list.concat(NULL_CHOICE);
  //   } else {
  //     return this.props.list;
  //   }
  // }

  idea(items: any[]): any {
    return items.map((item, index) => {
      if (item) {
        return (
          <MenuItem key={index} text={item.executable_type} />
        );
      }
    });

    // if (m.child) {
    //   return <div>{m.name} (idea(m.child))</div>;
    // } else {
    //   return <div>{m.name}</div>;
    // }
  }

  render() {
    return (
      <div className="filter-search">
        <Popover position={Position.BOTTOM_LEFT}>
          <button className="fb-button green">Select...</button>
          <Menu>
            {this.idea(this.props.list)}
          </Menu>
        </Popover>
      </div>
    );
  }
}
