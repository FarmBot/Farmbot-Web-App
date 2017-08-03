import * as React from "react";
import { t } from "i18next";
import { Button, MenuItem } from "@blueprintjs/core";
import { ISelectItemRendererProps, Select } from "@blueprintjs/labs";

import { DropDownItem } from "./fb_select";
import { NULL_CHOICE } from "./new_fb_select";

const SelectComponent = Select.ofType<DropDownItem>();

interface Props {
  items: DropDownItem[];
  selectedItem: DropDownItem;
  onChange: (item: DropDownItem) => void;
  isFilterable: boolean | undefined;
}

interface State {
  item?: DropDownItem | undefined;
  subMenus: DropDownItem[];
}

export class FilterSearch extends React.Component<Props, Partial<State>> {

  public state: State = {
    item: this.props.selectedItem,
    subMenus: []
  };

  render() {
    const { item } = this.state;
    return (
      <SelectComponent
        filterable={this.props.isFilterable}
        items={this.props.items}
        itemPredicate={this.filter}
        itemRenderer={this.default}
        noResults={<MenuItem disabled text="No results." />}
        onItemSelect={this.handleValueChange}
        children={
          <Button
            rightIconName="double-caret-vertical"
            text={item ? item.label : t("(No selection)")}
          />
        }
      />
    );
  }

  styleFor(item: DropDownItem): string {
    let styles = ["filter-search-item"];
    Object.is(item, NULL_CHOICE) && styles.push("filter-search-item-none");
    return styles.join(" ");
  }

  private default = (params: ISelectItemRendererProps<DropDownItem>) => {
    let { handleClick, item, index } = params;
    return (
      <MenuItem
        className={this.styleFor(item)}
        key={item.label || index}
        onClick={handleClick}
        text={`${item.label}`}
      />
    );
  }

  private filter(query: string, item: DropDownItem, index: number) {
    return (
      `${index + 1}. ${item.label.toLowerCase()}`
        .indexOf(query.toLowerCase()) >= 0
    );
  }

  private handleValueChange = (item: DropDownItem) => {
    this.props.onChange(item);
    this.setState({ item });
  }

}
