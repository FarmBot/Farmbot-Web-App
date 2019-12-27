import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll, findHome } from "../../devices/actions";
import { JogMovementControlsProps } from "./interfaces";
import { getDevice } from "../../device";
import { buildDirectionProps } from "./direction_axes_props";
import { t } from "../../i18next_wrapper";
import {
  cameraBtnProps
} from "../../devices/components/fbos_settings/camera_selection";
const DEFAULT_STEP_SIZE = 100;

/*
 * photo |   ^   | ^
 * home  | < v > | v
 */

export function JogButtons(props: JogMovementControlsProps) {
  const { stepSize, xySwap, arduinoBusy, doFindHome } = props;
  const homeBtnAction = doFindHome
    ? () => findHome("all")
    : () => homeAll(100);
  const directionAxesProps = buildDirectionProps(props);
  const rightLeft = xySwap ? "y" : "x";
  const upDown = xySwap ? "x" : "y";
  const commonProps = {
    steps: stepSize || DEFAULT_STEP_SIZE,
    disabled: arduinoBusy
  };
  const camDisabled = cameraBtnProps(props.env);
  return <table className="jog-table">
    <tbody>
      <tr>
        <td>
          <button
            className={`fa fa-camera arrow-button fb-button ${
              camDisabled.class}`}
            title={camDisabled.title || t("Take a photo")}
            onClick={camDisabled.click ||
              (() => getDevice().takePhoto().catch(() => { }))} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z} />
        </td>
      </tr>
      <tr>
        <td>
          <button
            className="i fa fa-home arrow-button fb-button"
            title={doFindHome ? t("find home") : t("move to home")}
            onClick={homeBtnAction}
            disabled={arduinoBusy || false} />
        </td>
        <td />
        <td>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td>
          <DirectionButton {...commonProps}
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]} />
        </td>
        <td>
          <DirectionButton {...commonProps}
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]} />
        </td>
        <td />
        <td>
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
