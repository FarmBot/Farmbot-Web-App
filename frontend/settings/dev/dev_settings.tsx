import React from "react";
import { Row, BlurableInput, ToggleButton } from "../../ui";
import { DevSettings } from "./dev_support";
import { store } from "../../redux/store";
import { INITIAL } from "../../three_d_garden/config";
import { edit, initSave, save } from "../../api/crud";
import { selectAllFarmwareEnvs } from "../../resources/selectors_by_kind";

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
  const [parseError, setParseError] = React.useState(false);
  const value = DevSettings.get3dCamera();
  React.useEffect(() => {
    try {
      JSON.parse(value);
      setParseError(false);
    } catch {
      setParseError(true);
    }
  }, [value]);
  return <Row className="grid-2-col">
    <label>
      {"Change initial 3D camera position"}
    </label>
    <div className="row grid-exp-3">
      <button className="fb-button red fa fa-times"
        onClick={DevSettings.remove3dCamera} />
      <button className="fb-button green fa fa-angle-double-up"
        onClick={() => DevSettings.set3dCamera(
          JSON.stringify({
            position: [-500, -500, 400],
            target: [-1500, -200, 200],
          }))} />
      <BlurableInput type="text"
        error={parseError ? "Invalid JSON" : ""}
        value={value}
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

export const DevWidgetAllOrderOptionsRow = () =>
  <Row className="grid-exp-1">
    <label>
      {"Show all axis order options"}
    </label>
    <ToggleButton
      toggleValue={DevSettings.allOrderOptionsEnabled()}
      toggleAction={DevSettings.allOrderOptionsEnabled()
        ? DevSettings.disableAllOrderOptions
        : DevSettings.enableAllOrderOptions} />
  </Row>;

export const DevWidgetChunkingDisabledRow = () =>
  <Row className="grid-exp-1">
    <label>
      {"Demo movement chunking"}
    </label>
    <ToggleButton
      toggleValue={localStorage.getItem("DISABLE_CHUNKING") !== "true"}
      toggleAction={localStorage.getItem("DISABLE_CHUNKING") === "true"
        ? () => localStorage.removeItem("DISABLE_CHUNKING")
        : () => localStorage.setItem("DISABLE_CHUNKING", "true")} />
  </Row>;

export const Dev3dDebugSettings = () => {
  const dispatch = store.dispatch as Function;
  const farmwareEnvs = selectAllFarmwareEnvs(store.getState().resources.index);
  return <>
    {Object.keys(INITIAL)
      .filter(key => key.includes("Debug"))
      .map(key => "3D_" + key)
      .map(key => {
        const farmwareEnv = farmwareEnvs.filter(e => e.body.key == key)[0];
        const value = farmwareEnv?.body.value ? 1 : 0;
        return <Row key={key} className="grid-exp-1">
          <label style={{ textTransform: "none" }}>
            {key}
          </label>
          <ToggleButton
            toggleValue={!!value}
            toggleAction={() => {
              if (farmwareEnv) {
                dispatch(edit(farmwareEnv, { value: value == 0 ? 1 : 0 }));
                dispatch(save(farmwareEnv.uuid));
              } else {
                dispatch(initSave("FarmwareEnv", { key, value: 1 }));
              }
            }} />
        </Row>;
      })}
  </>;
};

export const DevSettingsRows = () =>
  <div className={"dev-settings-rows grid"}>
    <DevWidgetFERow />
    <DevWidget3dCameraRow />
    <DevWidgetDelModeRow />
    <DevWidgetShowInternalEnvsRow />
    <DevWidgetFBOSRow />
    <DevWidgetAllOrderOptionsRow />
    <DevWidgetChunkingDisabledRow />
    <Dev3dDebugSettings />
    <p>Demo Queue Length: {store.getState().bot.demoQueueLength}</p>
  </div>;
