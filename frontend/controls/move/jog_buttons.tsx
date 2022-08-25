import React from "react";
import { calculateDistance, DirectionButton } from "./direction_button";
import { DirectionButtonProps, JogMovementControlsProps } from "./interfaces";
import { buildDirectionProps } from "./direction_axes_props";
import { TakePhotoButton } from "./take_photo_button";
import { calculateHomeDirection, HomeButton } from "./home_button";
import { BooleanSetting } from "../../session_keys";

const DEFAULT_STEP_SIZE = 100;

interface JogButtonsState {
  popover: string | undefined;
}

/*
 *        photo   |   ^   | ^
 * home find_home | < v > | v
 */

/** Jog controls, take photo, and home buttons. */
export class JogButtons
  extends React.Component<JogMovementControlsProps, JogButtonsState> {
  state: JogButtonsState = {
    popover: undefined,
  };

  setActivePopover = (popover: string) => { this.setState({ popover }); };

  render() {
    const {
      stepSize, arduinoBusy, locked, getConfigValue, env, highlightHome,
      highlightAxis, highlightDirection, botPosition, botOnline, dispatch,
    } = this.props;
    const directionAxesProps = buildDirectionProps(this.props);
    const xySwap = !!getConfigValue(BooleanSetting.xy_swap);
    const rightLeft = xySwap ? "y" : "x";
    const upDown = xySwap ? "x" : "y";
    const commonProps = {
      steps: stepSize || DEFAULT_STEP_SIZE,
      arduinoBusy,
      botOnline,
      locked,
      botPosition,
      popover: this.state.popover,
      setActivePopover: this.setActivePopover,
      movementState: this.props.movementState,
      dispatch,
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
        down: highlightAxis == "z" && highlightDirection != "up",
        up: highlightAxis == "z" &&
          ["both", "up"].includes("" + highlightDirection),
      },
      home: !!highlightHome,
    };
    const style = (highlighted: boolean) =>
      highlighted
        ? { border: "2px solid #fd6" }
        : {};
    const upDownUpProps: DirectionButtonProps = {
      ...commonProps,
      axis: upDown,
      direction: "up",
      directionAxisProps: directionAxesProps[upDown],
    };
    const rightLeftLeftProps: DirectionButtonProps = {
      ...commonProps,
      axis: rightLeft,
      direction: "left",
      directionAxisProps: directionAxesProps[rightLeft],
    };
    const leftPositive = calculateDistance(rightLeftLeftProps) > 0;
    const upPositive = calculateDistance(upDownUpProps) > 0;
    const homeDirection = calculateHomeDirection(leftPositive, upPositive);
    return <table className="jog-table">
      <tbody>
        <tr>
          <td />
          <td>
            <TakePhotoButton env={env} disabled={!botOnline} />
          </td>
          <td />
          <td />
          <td style={style(highlight.upDown.up)}>
            <DirectionButton {...upDownUpProps} />
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
            <HomeButton {...commonProps} doFindHome={false}
              homeDirection={homeDirection} />
          </td>
          <td style={style(highlight.home)}>
            <HomeButton {...commonProps} doFindHome={true} />
          </td>
          <td />
          <td style={style(highlight.rightLeft.left)}>
            <DirectionButton {...rightLeftLeftProps} />
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
}
