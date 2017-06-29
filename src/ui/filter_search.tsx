import * as React from "react";
import { t } from "i18next";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { ISelectItemRendererProps, Select } from "@blueprintjs/labs";

import { DropDownItem } from "./fb_select";

const SelectComponent = Select.ofType<DropDownItem>();

type PossibleReferences =
  | "Sequences"
  | "Regimens"

interface ParentMenu {
  title: string;
  value: string | number;
  subMenus: DropDownItem[];
  reference: PossibleReferences;
}

interface Props {
  items: DropDownItem[];
  selectedItem: DropDownItem;
  onChange: (item: DropDownItem) => void;
  placeholder?: string;
  isASubMenu?: boolean;
  isFilterable: boolean | undefined;
}

interface State {
  item?: DropDownItem | undefined;
  isFilterable: boolean | undefined;
  filterable?: boolean;
  minimal?: boolean;
  resetOnSelect?: boolean;
  parentMenus: ParentMenu[];
  subMenus: DropDownItem[];
}

export class FilterSearch extends React.Component<Props, Partial<State>> {

  public state: State = {
    item: this.props.selectedItem,
    filterable: true,
    minimal: false,
    resetOnSelect: false,
    parentMenus: [],
    subMenus: [],
    isFilterable: this.props.isFilterable || true
  };

  render() {
    const { item, minimal, ...flags } = this.state;
    let renderer = this.props.isASubMenu ? this.default : this.subMenu;
    return <SelectComponent
      {...flags}
      items={this.props.items}
      itemPredicate={this.filter}
      itemRenderer={renderer}
      noResults={<MenuItem disabled text="No results." />}
      onItemSelect={this.handleValueChange}
      popoverProps={{ popoverClassName: minimal ? Classes.MINIMAL : "" }}
    >
      <Button
        rightIconName="double-caret-vertical"
        text={item ? item.label : t("(No selection)")}
      />
    </SelectComponent>
  }

  private subMenu(params: ISelectItemRendererProps<DropDownItem>) {
    let { handleClick, item, index } = params;
    return <MenuItem
      className={"filter-search-item"}
      key={item.label || index}
      onClick={handleClick}
      text={`${item.label}`}
    />
  }

  private default(params: ISelectItemRendererProps<DropDownItem>) {
    let { handleClick, item, index } = params;
    return <MenuItem
      className={"filter-search-item"}
      key={item.label || index}
      onClick={handleClick}
      text={`${item.label}`}
    />
  }

  private filter(query: string, item: DropDownItem, index: number) {
    return `${index + 1}. ${item.label.toLowerCase()}`
      .indexOf(query.toLowerCase()) >= 0;
  }

  private handleValueChange = (item: DropDownItem) => {
    this.props.onChange(item);
    this.setState({ item })
  }

}
