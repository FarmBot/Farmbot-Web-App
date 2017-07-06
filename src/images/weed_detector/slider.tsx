import * as React from "react";
import {
  RangeSlider
} from "@blueprintjs/core/dist/components/slider/rangeSlider";
import { isNumber, get } from "lodash";

interface SliderProps {
  onRelease(value: [number, number]): void;
  highest: number;
  lowest: number;
  lowValue: number;
  highValue: number;
}

interface State {
  lowValue: number | undefined;
  highValue: number | undefined;
}

export class WeedDetectorSlider extends React.Component<SliderProps, State> {
  valueFor(i: (keyof State) & (keyof SliderProps)) {
    return get(this.state, i, undefined) || get(this.props, i, undefined) || 0;
  }

  onRelease = (i: [number, number]) => {
    this.props.onRelease(i);
    console.log("HEY!");
    setTimeout(() => {
      this.setState({ highValue: undefined, lowValue: undefined });
    }, 100);
  };

  render() {
    let {
      highest,
      lowest,
      lowValue,
      highValue,
      onRelease
    } = this.props;

    return <RangeSlider
      onChange={(i) => this.setState({ highValue: i[1], lowValue: i[0] })}
      onRelease={this.onRelease}
      labelStepSize={highest}
      min={lowest}
      max={highest}
      value={[this.valueFor("lowValue"), this.valueFor("highValue")]} />;
  }
}
