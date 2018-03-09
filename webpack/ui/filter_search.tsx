import * as React from "react";
import { t } from "i18next";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { ISelectItemRendererProps, Select } from "@blueprintjs/labs";
import { DropDownItem } from "./fb_select";

const SelectComponent = Select.ofType<DropDownItem | undefined>();

interface Props {
  items: DropDownItem[];
  selectedItem: DropDownItem;
  onChange: (item: DropDownItem) => void;
  nullChoice: DropDownItem;
}

interface State {
  item?: DropDownItem | undefined;
  minimal?: boolean;
  resetOnSelect?: boolean;
}

export class FilterSearch extends React.Component<Props, Partial<State>> {

  public state: State = {
    item: this.props.selectedItem,
    minimal: false,
    resetOnSelect: false,
  };

  render() {
    const { item, minimal, ...flags } = this.state;
    return <SelectComponent
      {...flags}
      items={this.props.items}
      itemPredicate={this.filter}
      itemRenderer={this.default}
      noResults={<MenuItem disabled text={t("No results.")} />}
      onItemSelect={this.handleValueChange}
      popoverProps={{ popoverClassName: minimal ? Classes.MINIMAL : "" }}>
      <Button
        rightIconName="double-caret-vertical"
        text={item ? item.label : t("(No selection)")} />
    </SelectComponent>;
  }

  styleFor(item: DropDownItem): string {
    const styles = ["filter-search-item"];
    if (Object.is(item, this.props.nullChoice)) {
      styles.push("filter-search-item-none");
    }
    if (item.heading) {
      styles.push("filter-search-heading-item");
    }
    return styles.join(" ");
  }

  private default = (params: ISelectItemRendererProps<DropDownItem>) => {
    const { handleClick, item, index } = params;
    return <MenuItem
      className={this.styleFor(item)}
      key={index + item.label}
      onClick={handleClick}
      text={`${item.label}`} />;
  }

  private filter(query: string, item: DropDownItem, index: number) {
    if (item.heading) { return true; }
    const itemHeadingId = item.headingId ? item.headingId : "";
    const itemSearchLabel = `${itemHeadingId}: ${item.label}`;
    return itemSearchLabel.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  private handleValueChange = (item: DropDownItem | undefined) => {
    if (item) {
      this.props.onChange(item);
      this.setState({ item });
    }
  }

}
