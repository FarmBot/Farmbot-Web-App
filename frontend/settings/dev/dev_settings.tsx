import React from "react";
import { Row, BlurableInput, ToggleButton } from "../../ui";
import { DevSettings } from "./dev_support";

export const DevWidgetFERow = () =>
  <Row className="grid-exp-1">
    <label>
      {"Enable unstable FE features"}
    </label>
    <ToggleButton
      toggleValue={DevSettings.futureFeaturesEnabled()}
      toggleAction={DevSettings.futureFeaturesEnabled()
        ? DevSettings.disableFutureFeatures
        : DevSettings.enableFutureFeatures} />
  </Row>;

export const DevWidgetFBOSRow = () => {
  return <Row className="grid-2-col">
    <label>
      {"Change FBOS version"}
    </label>
    <div className="row grid-exp-3">
      <button className="fb-button red fa fa-times"
        onClick={DevSettings.resetFbosVersionOverride} />
      <button className="fb-button green fa fa-angle-double-up"
        onClick={DevSettings.setMaxFbosVersionOverride} />
      <BlurableInput type="text"
        value={DevSettings.overriddenFbosVersion() || ""}
        onCommit={e =>
          DevSettings.setFbosVersionOverride(e.currentTarget.value)} />
    </div>
  </Row>;
};

export const DevWidget3dCameraRow = () => {
  return <Row className="grid-2-col">
    <label>
      {"Change inital 3D camera position"}
    </label>
    <div className="row grid-exp-3">
      <button className="fb-button red fa fa-times"
        onClick={DevSettings.remove3dCamera} />
      <button className="fb-button green fa fa-angle-double-up"
        onClick={() => DevSettings.set3dCamera(
          JSON.stringify({ position: [-500, -500, 400], target: [-1500, -200, 200] }))} />
      <BlurableInput type="text"
        value={DevSettings.get3dCamera() || ""}
        onCommit={e => DevSettings.set3dCamera(e.currentTarget.value)} />
    </div>
  </Row>;
};

export const DevWidgetDelModeRow = () =>
  <Row className="grid-exp-1">
    <label>
      {"Enable quick delete mode"}
    </label>
    <ToggleButton
      toggleValue={DevSettings.quickDeleteEnabled()}
      toggleAction={DevSettings.quickDeleteEnabled()
        ? DevSettings.disableQuickDelete
        : DevSettings.enableQuickDelete} />
  </Row>;

export const DevWidgetShowInternalEnvsRow = () =>
  <Row className="grid-exp-1">
    <label>
      {"Show internal envs"}
    </label>
    <ToggleButton
      toggleValue={DevSettings.showInternalEnvsEnabled()}
      toggleAction={DevSettings.showInternalEnvsEnabled()
        ? DevSettings.disableShowInternalEnvs
        : DevSettings.enableShowInternalEnvs} />
  </Row>;

export const DevSettingsRows = () =>
  <div className={"dev-settings-rows grid"}>
    <DevWidgetFERow />
    <DevWidget3dCameraRow />
    <DevWidgetDelModeRow />
    <DevWidgetShowInternalEnvsRow />
    <DevWidgetFBOSRow />
  </div>;
