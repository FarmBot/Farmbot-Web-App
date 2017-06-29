import * as React from "react";
import { DropDownItem } from "./fb_select";
import { FilterSearch } from "./filter_search";

interface Props {
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

export class FBSelect extends React.Component<Props, {}> {

  get item() { return this.props.selectedItem || NULL_CHOICE; }

  render() {
    let placeholder = this.props.placeholder || "Search...";

    return <div className="filter-search">
      <FilterSearch
        selectedItem={this.item}
        items={this.props.list}
        onChange={this.props.onChange}
        placeholder={placeholder}
        isFilterable={this.props.isFilterable}
      />
    </div>;
  }
}
