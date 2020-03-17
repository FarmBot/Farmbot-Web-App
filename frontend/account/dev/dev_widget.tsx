import * as React from "react";
import {
  Widget, WidgetHeader, WidgetBody, Row, Col, BlurableInput,
} from "../../ui";
import { ToggleButton } from "../../controls/toggle_button";
import { setWebAppConfigValue } from "../../config_storage/actions";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { DevSettings } from "./dev_support";

export const DevWidgetFERow = () =>
  <Row>
    <Col xs={8}>
      <label>
        {"Enable unstable FE features"}
      </label>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={DevSettings.futureFeaturesEnabled()}
        toggleAction={DevSettings.futureFeaturesEnabled()
          ? DevSettings.disableFutureFeatures
          : DevSettings.enableFutureFeatures} />
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
        onClick={DevSettings.resetFbosVersionOverride} />
    </Col>
    <Col xs={1}>
      <button className="fb-button green fa fa-angle-double-up"
        onClick={DevSettings.setMaxFbosVersionOverride} />
    </Col>
    <Col xs={4}>
      <BlurableInput type="text"
        value={DevSettings.overriddenFbosVersion() || ""}
        onCommit={e =>
          DevSettings.setFbosVersionOverride(e.currentTarget.value)} />
    </Col>
  </Row>;
};

export const DevWidgetDelModeRow = () =>
  <Row>
    <Col xs={8}>
      <label>
        {"Enable quick delete mode"}
      </label>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={DevSettings.quickDeleteEnabled()}
        toggleAction={DevSettings.quickDeleteEnabled()
          ? DevSettings.disableQuickDelete
          : DevSettings.enableQuickDelete} />
    </Col>
  </Row>;

export const DevWidget = ({ dispatch }: { dispatch: Function }) =>
  <Widget>
    <WidgetHeader title={"Dev options"}>
      <button className="fb-button red"
        onClick={() => {
          DevSettings.disableFutureFeatures();
          DevSettings.resetFbosVersionOverride();
          dispatch(setWebAppConfigValue(
            "show_dev_menu" as BooleanConfigKey, false));
        }}>
        {"Reset all and remove this widget"}
      </button>
    </WidgetHeader>
    <WidgetBody>
      <DevWidgetFERow />
      <DevWidgetDelModeRow />
      <DevWidgetFBOSRow />
    </WidgetBody>
  </Widget>;
