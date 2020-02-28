import * as React from "react";
import { StepSizeSelectorProps } from "./interfaces";
import { first, last } from "lodash";
import { t } from "../../i18next_wrapper";

export class StepSizeSelector extends React.Component<StepSizeSelectorProps, {}> {
  cssForIndex(num: number) {
    const choices = this.props.choices;
    let css = "move-amount no-radius fb-button ";
    if (num === first(choices)) {
      css += "leftmost ";
    }
    if (num === last(choices)) {
      css += "rightmost ";
    }
    if (num === this.props.selected) {
      css += "move-amount-selected ";
    }
    return css;
  }

  render() {
    return <div className="move-amount-wrapper">
      {this.props.choices.map((item: number, inx: number) =>
        <button key={inx}
          title={t("{{ amount }}mm", { amount: item })}
          className={this.cssForIndex(item)}
          onClick={() => this.props.selector(item)}>
          {item}
        </button>)}
    </div>;
  }
}
