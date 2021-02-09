import React from "react";
import { StepSizeSelectorProps } from "./interfaces";
import { first, last } from "lodash";
import { t } from "../../i18next_wrapper";
import { changeStepSize } from "../../devices/actions";

export class StepSizeSelector extends React.Component<StepSizeSelectorProps, {}> {
  get choices() { return [1, 10, 100, 1000, 10000]; }

  cssForIndex(num: number) {
    const choices = this.choices;
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
      {this.choices.map((item: number, inx: number) =>
        <button key={inx}
          title={t("{{ amount }}mm", { amount: item })}
          className={this.cssForIndex(item)}
          onClick={() => this.props.dispatch(changeStepSize(item))}>
          {item}
        </button>)}
    </div>;
  }
}
