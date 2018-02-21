import * as React from "react";
import { t } from "i18next";
import { Button, Classes, MenuItem } from "@blueprintjs/core";
import { ISelectItemRendererProps, Select } from "@blueprintjs/labs";
import { DropDownItem } from "./fb_select";

const SelectComponent = Select.ofType<DropDownItem | undefined>();

type PossibleReferences =
  | "Sequence"
  | "Regimen";

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
  isASubMenu?: boolean;
  nullChoice: DropDownItem;
}

interface State {
  item?: DropDownItem | undefined;
  filterable?: boolean;
  minimal?: boolean;
  resetOnSelect?: boolean;
  parentMenus: ParentMenu[];
  subMenus: DropDownItem[];
}

export class FilterSearch extends React.Component<Props, Partial<State>> {

  public state: State = {
    item: this.props.selectedItem,
    minimal: false,
    resetOnSelect: false,
    parentMenus: [],
    subMenus: []
  };

  render() {
    const { item, minimal, ...flags } = this.state;
    return <SelectComponent
      {...flags}
      items={this.props.items}
      itemPredicate={this.filter}
      itemRenderer={this.default}
      noResults={<MenuItem disabled text="No results." />}
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
    return item.label.toLowerCase().indexOf(query.toLowerCase()) >= 0;
  }

  private handleValueChange = (item: DropDownItem | undefined) => {
    if (item) {
      this.props.onChange(item);
      this.setState({ item });
    }
  }

}
