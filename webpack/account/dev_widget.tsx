import * as React from "react";
import {
  Widget, WidgetHeader, WidgetBody, Row, Col, BlurableInput
} from "../ui";
import { ToggleButton } from "../controls/toggle_button";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";

export const FUTURE_FE_FEATURES = "FUTURE_FEATURES";
/** Unstable FE features enabled? */
export const futureFeaturesEnabled = () =>
  !!localStorage.getItem(FUTURE_FE_FEATURES);
/** Show unstable FE features for development purposes. */
export const enableFutureFeatures = () =>
  localStorage.setItem(FUTURE_FE_FEATURES, "true");
const disableFutureFeatures = () =>
  localStorage.removeItem(FUTURE_FE_FEATURES);

export const FBOS_VERSION_OVERRIDE = "IM_A_DEVELOPER";
/** Escape hatch for platform developers doing offline development. */
const overriddenFbosVersion = () =>
  localStorage.getItem(FBOS_VERSION_OVERRIDE);
const resetFbosVersionOverride = () =>
  localStorage.removeItem(FBOS_VERSION_OVERRIDE);
const setFbosVersionOverride = (override: string) =>
  localStorage.setItem(FBOS_VERSION_OVERRIDE, override);

export const DevWidgetFERow = () =>
  <Row>
    <Col xs={8}>
      <label>
        {"Enable unstable FE features"}
      </label>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={futureFeaturesEnabled()}
        toggleAction={futureFeaturesEnabled()
          ? disableFutureFeatures
          : enableFutureFeatures} />
    </Col>
  </Row>;

export const DevWidgetFBOSRow = () => {
  return <Row>
    <Col xs={6}>
      <label>
        {"Change FBOS version"}
      </label>
    </Col>
    <Col xs={1}>
      <button className="fb-button red fa fa-times"
        onClick={resetFbosVersionOverride} />
    </Col>
    <Col xs={1}>
      <button className="fb-button green fa fa-angle-double-up"
        onClick={() => setFbosVersionOverride("1000.0.0")} />
    </Col>
    <Col xs={4}>
      <BlurableInput type="text"
        value={overriddenFbosVersion() || ""}
        onCommit={e =>
          setFbosVersionOverride(e.currentTarget.value)} />
    </Col>
  </Row>;
};

export const DevWidget = ({ dispatch }: { dispatch: Function }) =>
  <Widget>
    <WidgetHeader title={"Dev options"}>
      <button className="fb-button red"
        onClick={() => {
          disableFutureFeatures();
          resetFbosVersionOverride();
          dispatch(setWebAppConfigValue(
            "show_dev_menu" as BooleanConfigKey, false));
        }}>
        {"Reset all and remove this widget"}
      </button>
    </WidgetHeader>
    <WidgetBody>
      <DevWidgetFERow />
      <DevWidgetFBOSRow />
    </WidgetBody>
  </Widget>;
