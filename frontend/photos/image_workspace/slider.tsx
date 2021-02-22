import React from "react";
import { get, isNumber } from "lodash";
import { bail } from "../../util";
import { RangeSlider } from "@blueprintjs/core";

export interface SliderProps {
  onRelease(value: [number, number]): void;
  highest: number;
  lowest: number;
  lowValue: number;
  highValue: number;
  className?: string;
}

interface State {
  lowValue: number | undefined;
  highValue: number | undefined;
}

export class WeedDetectorSlider extends React.Component<SliderProps, State> {
  valueFor(i: (keyof State) & (keyof SliderProps)): number {
    const z = get(this.state, i, get(this.props, i, 0));
    return isNumber(z) ? z : bail("Something other than number");
  }

  onRelease = (i: [number, number]) => {
    this.props.onRelease(i);
    setTimeout(() => {
      this.setState({ highValue: undefined, lowValue: undefined });
    }, 500);
  };

  render() {
    const {
      highest,
      lowest
    } = this.props;

    return <RangeSlider
      className={this.props.className}
      onChange={(i) => this.setState({ highValue: i[1], lowValue: i[0] })}
      onRelease={this.onRelease}
      labelStepSize={highest}
      min={lowest}
      max={highest}
      value={[this.valueFor("lowValue"), this.valueFor("highValue")]} />;
  }
}
