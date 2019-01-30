import * as React from "react";
import { Hue, Saturation } from "react-color/lib/components/common";
import { FarmbotPickerProps } from "./interfaces";
import * as _ from "lodash";
import { Color } from "../../ui/index";

/** Wrapper class around `react-color`'s `<Saturation />` and `<Hue />`.
 *  Add an extra white box feature for showing user weed detection settings.
 */

const selectedCSS: React.CSSProperties = {
  position: "absolute",
  border: "2px solid white",
  boxShadow: "0 0 5px 2px rgba(0, 0, 0, 0.3)",
  zIndex: 2
};

const unselectedCSS: React.CSSProperties = {
  position: "absolute",
  borderWidth: "5px 0 5px 0",
  borderColor: Color.lightGray,
  borderStyle: "solid",
  background: "rgba(0, 0, 0, 0.3)",
  boxShadow: "0 0 15px 2px rgba(0, 0, 0, 0.3) inset"
};

export function getHueBoxes(
  hue: number[], inverted: boolean): React.CSSProperties[] {
  /**
   *  d0     d1     d2     d3  <- divider positions
   *  .--------------------.
   *  | box0 | box1 | box2 |
   *  '--------------------'
   *     w0     w1     w2     <- widths
   */
  function n(h: number) { return ((h * 2) / 360) * 100; } // normalize
  const d = [0, n(Math.min(...hue)), n(Math.max(...hue)), 100];
  const boxWidths = [d[1], d[2] - d[1], d[3] - d[2]];
  const selected = [inverted, !inverted, inverted];
  return boxWidths.map(function (w, i) {
    const [top, height, left, width] =
      [0, 100, d[i], w].map(x => `${Math.round(x)}%`);
    return {
      top, height, left, width, ...(selected[i] ? selectedCSS : unselectedCSS)
    };
  });
}

export class FarmbotColorPicker extends React.Component<FarmbotPickerProps, {}> {
  constructor(props: FarmbotPickerProps) {
    super(props);
    this.state = {};
  }

  hueCSS = (): React.CSSProperties => {
    return {
      position: "relative",
      width: "100%",
      paddingBottom: "4rem",
    };
  }

  saturationCSS = (): React.CSSProperties => {
    return {
      position: "relative",
      width: "100%",
      paddingBottom: "12rem",
      overflow: "hidden"
    };
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

    return { ...selectedCSS, width, height, top, left };
  }

  customPointer = () => <div />;

  render() {
    const H_AVG = !!this.props.invertHue
      ? 0
      : ((this.props.h[1] * 2 + this.props.h[0] * 2) / 2);
    /** 💥💥💥SURPRISING CODE AHEAD:
     * I think the typings for `react-color` might be missing `hsv` and `hsl`
     * as mandatory props. I don't have time to send a patch right now. Failing
     * to add these props is a runtime error.
     * TODO: Update `definitely-typed/react-color` typings
     *       At this point, the fix may already be upstream. An update may fix
     *       this issue.
     */
    const dontTouchThis = {
      hsv: { h: H_AVG, s: 0, v: 0 },
      hsl: { h: H_AVG, s: 0, l: 0 }
    };
    return <div id="farmbot-color-picker">
      <div style={{ width: "100%", paddingBottom: "5rem" }} />
      <div id="hue" style={this.hueCSS()}>
        <Hue
          {...dontTouchThis}
          pointer={this.customPointer}
          onChange={_.noop} />
        {getHueBoxes(this.props.h, !!this.props.invertHue)
          .map((box, i) => <div key={i} style={box} />)}
      </div>
      <div style={{ width: "100%", paddingBottom: "1rem" }} />
      <div id="saturation" style={this.saturationCSS()}>
        <Saturation
          {...dontTouchThis}
          pointer={this.customPointer}
          onChange={_.noop} />
        <div style={this.saturationboxCSS()} />
      </div>
    </div>;
  }
}
