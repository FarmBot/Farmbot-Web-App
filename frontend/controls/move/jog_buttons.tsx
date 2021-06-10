import React from "react";
import { DirectionButton } from "./direction_button";
import { JogMovementControlsProps } from "./interfaces";
import { buildDirectionProps } from "./direction_axes_props";
import { TakePhotoButton } from "./take_photo_button";
import { HomeButton } from "./home_button";
import { BooleanSetting } from "../../session_keys";

const DEFAULT_STEP_SIZE = 100;

/*
 *        photo   |   ^   | ^
 * home find_home | < v > | v
 */

/** Jog controls, take photo, and home buttons. */
export function JogButtons(props: JogMovementControlsProps) {
  const {
    stepSize, arduinoBusy, locked, getConfigValue,
    highlightAxis, highlightDirection,
  } = props;
  const directionAxesProps = buildDirectionProps(props);
  const xySwap = !!getConfigValue(BooleanSetting.xy_swap);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";
  const movementDisabled = arduinoBusy || !props.botOnline;
  const commonProps = {
    steps: stepSize || DEFAULT_STEP_SIZE,
    disabled: movementDisabled,
    locked,
  };
  const highlight = {
    upDown: {
      up: highlightAxis == upDown,
      down: highlightAxis == upDown && highlightDirection == "both",
    },
    rightLeft: {
      right: highlightAxis == rightLeft,
      left: highlightAxis == rightLeft && highlightDirection == "both",
    },
    z: {
      down: highlightAxis == "z",
      up: highlightAxis == "z" && highlightDirection == "both",
    },
    home: !!props.highlightHome,
  };
  const style = (highlighted: boolean) =>
    highlighted
      ? { border: "2px solid yellow" }
      : {};
  return <table className="jog-table">
    <tbody>
      <tr>
        <td />
        <td>
          <TakePhotoButton env={props.env} disabled={!props.botOnline} />
        </td>
        <td />
        <td />
        <td style={style(highlight.upDown.up)}>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td />
        <td />
        <td style={style(highlight.z.up)}>
          <DirectionButton {...commonProps}
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z} />
        </td>
      </tr>
      <tr>
        <td>
          <HomeButton {...commonProps} doFindHome={false} />
        </td>
        <td style={style(highlight.home)}>
          <HomeButton {...commonProps} doFindHome={true} />
        </td>
        <td />
        <td style={style(highlight.rightLeft.left)}>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td style={style(highlight.upDown.down)}>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td style={style(highlight.rightLeft.right)}>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td />
        <td style={style(highlight.z.down)}>
          <DirectionButton {...commonProps}
            axis="z"
            direction="down"
            directionAxisProps={directionAxesProps.z} />
        </td>
      </tr>
      <tr>
        <td />
      </tr>
    </tbody>
  </table>;
}
