import React from "react";
import { Button, Classes, MenuItem, Alignment } from "@blueprintjs/core";
import { Select, ItemRenderer } from "@blueprintjs/select";
import { DropDownItem } from "./fb_select";
import { t } from "../i18next_wrapper";

const SelectComponent = Select.ofType<DropDownItem | undefined>();

interface FilterSearchProps {
  items: DropDownItem[];
  selectedItem: DropDownItem;
  onChange: (item: DropDownItem) => void;
  nullChoice: DropDownItem;
}

interface State {
  item?: DropDownItem | undefined;
  resetOnSelect?: boolean;
}

export class FilterSearch
  extends React.Component<FilterSearchProps, Partial<State>> {

  public state: State = {
    item: this.props.selectedItem,
    resetOnSelect: false,
  };

  render() {
    const { item, ...flags } = this.state;
    return <SelectComponent
      {...flags}
      items={this.props.items}
      itemPredicate={this.filter(this.props.items)}
      itemRenderer={this.default}
      noResults={<MenuItem disabled text={t("No results.")} />}
      onItemSelect={this.handleValueChange}
      popoverProps={{
        popoverClassName: [
          "filter-search-popover",
          Classes.MINIMAL,
          this.props.items.length < 4 ? "few-items" : "",
        ].join(" "),
        modifiers: { offset: { options: { offset: [0, 0] } } },
      }}>
      <i className="fa fa-caret-down fa-md" />
      <Button
        alignText={Alignment.START}
        text={item ? item.label : t("(No selection)")} />
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
    };

  private filter = (items: DropDownItem[]) =>
    (query: string, item: DropDownItem): boolean => {
      const matchedItems = allMatchedItems(items, query);
      return item.heading
        ? sectionHasItems(item.headingId, matchedItems)
        : isMatch(item, query);
    };

  private handleValueChange = (item: DropDownItem | undefined) => {
    if (item && !item.heading) {
      this.props.onChange(item);
      this.setState({ item });
    }
  };

}

const isMatch = (item: DropDownItem, query: string): boolean => {
  const removeEndS = (s: string) => s.endsWith("s") ? s.slice(0, -1) : s;
  return `${item.headingId || ""}: ${item.label}`
    .toLowerCase().indexOf(removeEndS(query.toLowerCase())) >= 0;
};

/** for FilterSearch */
export const allMatchedItems =
  (allItems: DropDownItem[], query: string): DropDownItem[] =>
    allItems.filter(x => !x.heading).filter(x => isMatch(x, query));

const sectionHasItems =
  (headingId: string | undefined, matchedItems: DropDownItem[]): boolean => {
    const sectionItems = matchedItems.filter(x => x.headingId === headingId);
    return sectionItems.length > 0;
  };
