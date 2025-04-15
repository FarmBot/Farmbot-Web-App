import React from "react";
import { calculateDistance, DirectionButton } from "./direction_button";
import { DirectionButtonProps, JogMovementControlsProps } from "./interfaces";
import { buildDirectionProps } from "./direction_axes_props";
import { TakePhotoButton } from "./take_photo_button";
import { calculateHomeDirection, HomeButton } from "./home_button";
import { BooleanSetting } from "../../session_keys";
import { Content, DeviceSetting } from "../../constants";
import { FbosButtonRow } from "../../settings/fbos_settings/fbos_button_row";
import { t } from "../../i18next_wrapper";
import { powerOff, reboot, restartFirmware } from "../../devices/actions";
import { FactoryResetRows } from "../../settings/fbos_settings/factory_reset_row";
import { Popover } from "../../ui";

const DEFAULT_STEP_SIZE = 100;

interface JogButtonsState {
  popover: string | undefined;
}

/*
 * power  photo   |   ^   | ^
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
    const showAdvanced = !!getConfigValue(BooleanSetting.show_advanced_settings);
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
          <td>
            <Popover
              popoverClassName={"power-btn-popover"}
              target={<button
                className={"fa fa-power-off arrow-button fb-button"}
                title={t("click to open power and reset menu")} />}
              content={<PowerAndResetMenu
                botOnline={botOnline}
                dispatch={dispatch}
                showAdvanced={showAdvanced} />} />
          </td>
          <td>
            <TakePhotoButton env={env} botOnline={botOnline}
              imageJobs={this.props.imageJobs} logs={this.props.logs} />
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
              firmwareSettings={this.props.firmwareSettings}
              homeDirection={homeDirection} />
          </td>
          <td style={style(highlight.home)}>
            <HomeButton {...commonProps} doFindHome={true}
              firmwareSettings={this.props.firmwareSettings} />
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
      </tbody>
    </table>;
  }
}

export interface PowerAndResetMenuProps {
  botOnline: boolean;
  showAdvanced: boolean;
  dispatch: Function;
}

export const PowerAndResetMenu = (props: PowerAndResetMenuProps) => {
  const { botOnline } = props;
  return <div className={"power-and-reset-menu"}>
    <FbosButtonRow
      botOnline={botOnline}
      label={DeviceSetting.restartFirmware}
      description={Content.RESTART_FIRMWARE}
      buttonText={t("RESTART")}
      color={"yellow"}
      advanced={true}
      showAdvanced={props.showAdvanced}
      action={() => { restartFirmware(); }} />
    <FbosButtonRow
      botOnline={botOnline}
      label={DeviceSetting.restartFarmbot}
      description={Content.RESTART_FARMBOT}
      buttonText={t("RESTART")}
      color={"yellow"}
      action={reboot} />
    <FbosButtonRow
      botOnline={botOnline}
      label={DeviceSetting.shutdownFarmbot}
      description={Content.SHUTDOWN_FARMBOT}
      buttonText={t("SHUTDOWN")}
      color={"red"}
      action={powerOff} />
    <FactoryResetRows
      dispatch={props.dispatch}
      botOnline={botOnline} />
  </div>;
};
