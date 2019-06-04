import * as React from "react";
import { Button, Classes, MenuItem, Alignment } from "@blueprintjs/core";
import { Select, ItemRenderer } from "@blueprintjs/select";
import { DropDownItem } from "./fb_select";
import { t } from "../i18next_wrapper";

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
      itemPredicate={this.filter(this.props.items)}
      itemRenderer={this.default}
      noResults={<MenuItem disabled text={t("No results.")} />}
      onItemSelect={this.handleValueChange}
      popoverProps={{ popoverClassName: minimal ? Classes.MINIMAL : "" }}>
      <Button
        alignText={Alignment.LEFT}
        text={item ? item.label : t("(No selection)")} />
      <i className="fa fa-caret-down fa-lg" />
    </SelectComponent>;
  }

  styleFor(item: Partial<DropDownItem>): string {
    const styles = ["filter-search-item"];
    if (Object.is(item, this.props.nullChoice)) {
      styles.push("filter-search-item-none");
    }
    if (item.heading) {
      styles.push("filter-search-heading-item");
    }
    return styles.join(" ");
  }

  private default: ItemRenderer<DropDownItem | undefined> =
    (item, params) => {
      const { handleClick, index } = params;
      const i: Partial<DropDownItem> = item || { label: "" };
      return <MenuItem
        className={this.styleFor(i)}
        key={index + (i.label || "")}
        onClick={handleClick}
        text={`${i.label}`} />;
    }

  private filter = (items: DropDownItem[]) =>
    (query: string, item: DropDownItem): boolean => {
      const matchedItems = allMatchedItems(items, query);
      return item.heading
        ? sectionHasItems(item.headingId, matchedItems)
        : isMatch(item, query);
    }

  private handleValueChange = (item: DropDownItem | undefined) => {
    if (item && !item.heading) {
      this.props.onChange(item);
      this.setState({ item });
    }
  }

}

const isMatch = (item: DropDownItem, query: string): boolean =>
  `${item.headingId || ""}: ${item.label}`
    .toLowerCase().indexOf(query.toLowerCase()) >= 0;

const allMatchedItems =
  (allItems: DropDownItem[], query: string): DropDownItem[] =>
    allItems.filter(x => !x.heading).filter(x => isMatch(x, query));

const sectionHasItems =
  (headingId: string | undefined, matchedItems: DropDownItem[]): boolean => {
    const sectionItems = matchedItems.filter(x => x.headingId === headingId);
    return sectionItems.length > 0;
  };
