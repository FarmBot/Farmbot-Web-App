import * as React from "react";
import { Component } from "react";
import { StepSizeSelectorProps } from "./interfaces";

export class StepSizeSelector extends Component<StepSizeSelectorProps, {}> {
  cssForIndex(num: number) {
    let choices = this.props.choices;
    let css = "move-amount no-radius fb-button ";
    if (num === _.first(choices)) {
      css += "leftmost ";
    }
    if (num === _.last(choices)) {
      css += "rightmost ";
    }
    if (num === this.props.selected) {
      css += "move-amount-selected ";
    }
    return css;
  }

  render() {
    return <div className="move-amount-wrapper">
      {
        this.props.choices.map(
          (item: number, inx: number) => <button
            className={this.cssForIndex(item)}
            onClick={() => this.props.selector(item)}
            key={inx}>
            {item}
          </button>
        )
      }
    </div>;
  }
}
