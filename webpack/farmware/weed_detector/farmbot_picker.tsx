import * as React from "react";
import { Hue, Saturation } from "react-color/lib/components/common";
import { FarmbotPickerProps } from "./interfaces";
import * as _ from "lodash";

/** Wrapper class around `react-color`'s `<Saturation />` and `<Hue />`.
 *  Add an extra white box feature for showing user weed detection settings.
 */
export class FarmbotColorPicker extends React.Component<FarmbotPickerProps, {}> {
  BASE_CSS: React.CSSProperties = {
    position: "absolute",
    border: "2px solid white",
    boxShadow: "0 0 2px 2px rgba(0, 0, 0, 0.3) inset"
  };

  constructor() {
    super();
    this.state = {};
  }

  hueCSS = (): React.CSSProperties => {
    return {
      position: "relative",
      width: "100%",
      paddingBottom: "10%",
      overflow: "hidden"
    };
  }

  saturationCSS = (): React.CSSProperties => {
    return {
      position: "relative",
      width: "100%",
      paddingBottom: "35%",
      overflow: "hidden"
    };
  }

  hueboxCSS = (): React.CSSProperties => {
    const l = ((this.props.h[0] * 2) / 360) * 100;
    const w = ((this.props.h[1] * 2) / 360) * 100 - l;
    const width = `${w}%`;
    const left = `${l}%`;
    const height = "100%";
    const top = 0;
    return { ...this.BASE_CSS, width, height, top, left };
  }

  saturationboxCSS = (): React.CSSProperties => {
    const MAX = 255;
    const [s0, s1] = this.props.s;
    const [v0, v1] = this.props.v;

    const l = ((s0 / MAX) * 100);
    const w = ((s1 / MAX) * 100) - l;
    const t = 100 - (v1 / MAX) * 100;
    const h = (100 - (v0 / MAX) * 100) - t;

    const [width, height, left, top] = [w, h, l, t].map(x => `${x}%`);

    return { ...this.BASE_CSS, width, height, top, left };
  }

  customPointer = () => <div />;

  render() {
    const H_AVG = ((this.props.h[1] * 2 + this.props.h[0] * 2) / 2);
    /** 💥💥💥SURPRISING CODE AHEAD:
     * I think the typings for `react-color` might be missing `hsv` and `hsl`
     * as mandatory props. I don't have time to send a patch right now. Failing
     * to add these props is a runtime error.
     * TODO: Update `definitely-typed/react-color` typings
     */
    const dontTouchThis = {
      hsv: { h: H_AVG, s: 0, v: 0 },
      hsl: { h: H_AVG, s: 0, l: 0 }
    };
    return <div>
      <div style={{ width: "100%", paddingBottom: "15%" }} />
      <div style={this.hueCSS()}>
        <Hue
          {...dontTouchThis}
          pointer={this.customPointer}
          onChange={_.noop} />
        <div style={this.hueboxCSS()} />
      </div>
      <div style={{ width: "100%", paddingBottom: "2%" }} />
      <div style={this.saturationCSS()}>
        <Saturation
          {...dontTouchThis}
          pointer={this.customPointer}
          onChange={_.noop} />
        <div style={this.saturationboxCSS()} />
      </div>
    </div>;
  }
}
