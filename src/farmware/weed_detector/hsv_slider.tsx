import * as React from "react";
import { HSV, HiLo, EnvSliderProps, EnvSliderState } from "./interfaces";
import { RangeSlider } from "@blueprintjs/core/dist/components/slider/rangeSlider";

/** Max HSV allowed by farmbot weed detector. */
const RANGE: Record<HSV, HiLo> = {
  H: { lo: 0, hi: 179 },
  S: { lo: 0, hi: 255 },
  V: { lo: 0, hi: 255 }
};

/** Default HSV if none found on bot. */
const DEFAULTS: Record<HSV, HiLo> = {
  H: { lo: 30, hi: 90 },
  S: { lo: 50, hi: 255 },
  V: { lo: 50, hi: 255 }
};

export class HsvSlider extends React.Component<EnvSliderProps, EnvSliderState> {
  constructor() {
    super();
    this.state = {
      sliding: false
    };
  }

  componentDidMount() {
    this.onRelease();
  }

  onChange = (range: [number, number]) => {
    this.setState({
      hi: range[1],
      lo: range[0],
      sliding: true
    });
  }

  get name(): HSV {
    switch (this.props.name) {
      case "H": case "S": case "V": this.props.name
      default: throw new Error("HSV is bad.")
    }
  }

  /** Triggered on componentDidMount() and when the user snaps the slider to a
   * position. */
  onRelease = () => {
    let cb = this.props.onChange;
    if (cb) { cb(this.name, [this.lo, this.hi]); }
    this.setState({ sliding: false });
  }

  /** Retrieves the pair of hi/lo values from the remote end (bot).
   * Returns [number, number] if bot is online running the farmware.
   * Returns undefined otherwise.
   */
  get remoteValues() {
    console.error(`FIX THIS!`);
    return [];
  }

  /** The slider's high value */
  get hi() {
    let { hi } = this.state;
    if (this.state.sliding) {
      return hi || 1;
    } else {
      return this.remoteValues[1] || DEFAULTS[this.name].hi || 0;
    }
  }

  /** The slider's low value */
  get lo() {
    let { lo } = this.state;
    if (this.state.sliding) {
      return lo || 1;
    } else {
      return this.remoteValues[1] || DEFAULTS[this.name].lo || 0;
    }
  }

  render() {
    return <RangeSlider
      onChange={this.onChange}
      onRelease={this.onRelease}
      labelStepSize={RANGE[this.name].hi}
      min={RANGE[this.name].lo}
      max={RANGE[this.name].hi}
      value={[this.lo, this.hi]} />;
  }
}
