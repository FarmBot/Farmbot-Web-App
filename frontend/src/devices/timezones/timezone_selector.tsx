import * as React from "react";
import { DropDownItem } from "../../ui/fb_select";
import { list } from "./tz_list";
import { inferTimezone } from "./guess_timezone";
import { FBSelect } from "../../ui/new_fb_select";

const CHOICES: DropDownItem[] = list.map(x => ({ label: x, value: x }));

interface TZSelectorProps {
  currentTimezone: string | undefined;
  onUpdate(ts: string): void;
}

export class TimezoneSelector extends React.Component<TZSelectorProps, {}> {
  dropdownList = (): DropDownItem[] => {
    return [];
  }

  componentDidMount() {
    let tz = inferTimezone(this.props.currentTimezone);
    if (!this.props.currentTimezone) {
      // Nasty hack to prepopulate data of users who have yet to set a TZ.
      this.props.onUpdate(tz);
    }
  }

  selectedItem = (): DropDownItem => {
    let tz = inferTimezone(this.props.currentTimezone);
    return { label: tz, value: tz };
  }

  itemSelected = (d: DropDownItem): void => {
    if (_.isString(d.value)) {
      this.props.onUpdate(d.value);
    }
  }

  render() {
    return <FBSelect
      list={CHOICES}
      selectedItem={this.selectedItem()}
      onChange={this.itemSelected}
    />;
  }
}
