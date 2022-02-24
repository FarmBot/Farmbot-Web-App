import React from "react";
import { Row, Col, BlurableInput, ToggleButton } from "../../ui";
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

export const DevWidgetShowInternalEnvsRow = () =>
  <Row>
    <Col xs={8}>
      <label>
        {"Show internal envs"}
      </label>
    </Col>
    <Col xs={4}>
      <ToggleButton
        toggleValue={DevSettings.showInternalEnvsEnabled()}
        toggleAction={DevSettings.showInternalEnvsEnabled()
          ? DevSettings.disableShowInternalEnvs
          : DevSettings.enableShowInternalEnvs} />
    </Col>
  </Row>;

export const DevSettingsRows = () =>
  <div className={"dev-settings-rows"}>
    <Row />
    <Row />
    <DevWidgetFERow />
    <DevWidgetDelModeRow />
    <DevWidgetShowInternalEnvsRow />
    <DevWidgetFBOSRow />
  </div>;
