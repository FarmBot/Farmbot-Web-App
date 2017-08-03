import * as React from "react";
import { DropDownItem } from "./fb_select";

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
  isFilterable?: boolean | undefined;
}

/** Used as a placeholder for a selection of "none" when allowEmpty is true. */
export const NULL_CHOICE: DropDownItem = Object.freeze({
  label: "None",
  value: ""
});

export class FBSelect extends React.Component<FBSelectProps, {}> {

  get item() { return this.props.selectedItem || NULL_CHOICE; }
  get list() {
    if (this.props.allowEmpty) {
      return this.props.list.concat(NULL_CHOICE);
    } else {
      return this.props.list;
    }
  }
  render() {
    return (
      <div className="filter-search">

      </div>
    );
  }
}
