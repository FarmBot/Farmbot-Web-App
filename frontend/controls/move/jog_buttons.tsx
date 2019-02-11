import * as React from "react";
import { DirectionButton } from "./direction_button";
import { homeAll, findHome } from "../../devices/actions";
import { JogMovementControlsProps } from "./interfaces";
import { getDevice } from "../../device";
import { buildDirectionProps } from "./direction_axes_props";
import { t } from "i18next";

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

  return <table className="jog-table">
    <tbody>
      <tr>
        <td>
          <button
            className="i fa fa-camera arrow-button fb-button"
            title={t("Take a photo")}
            onClick={() => getDevice().takePhoto().catch(() => { })} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton
            axis={upDown}
            direction="up"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td />
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="up"
            directionAxisProps={directionAxesProps.z}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
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
          <DirectionButton
            axis={rightLeft}
            direction="left"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td>
          <DirectionButton
            axis={upDown}
            direction="down"
            directionAxisProps={directionAxesProps[upDown]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td>
          <DirectionButton
            axis={rightLeft}
            direction="right"
            directionAxisProps={directionAxesProps[rightLeft]}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
        <td />
        <td>
          <DirectionButton
            axis="z"
            direction="down"
            directionAxisProps={directionAxesProps.z}
            steps={stepSize || DEFAULT_STEP_SIZE}
            disabled={arduinoBusy} />
        </td>
      </tr>
      <tr>
        <td />
      </tr>
    </tbody>
  </table>;
}
