import React from "react";
import { BlurableInput, ExpandableHeader } from "../ui";
import { Pair, FarmwareConfig, TaggedFarmwareEnv } from "farmbot";
import { getDevice } from "../device";
import { ShouldDisplay, Feature, UserEnv } from "../devices/interfaces";
import { toString, snakeCase, isEqual } from "lodash";
import { FarmwareManifestInfo, SaveFarmwareEnv } from "./interfaces";
import { t } from "../i18next_wrapper";
import { Collapse } from "@blueprintjs/core";
import { destroy } from "../api/crud";
import { UUID } from "../resources/interfaces";
import { equals } from "../util";
import { FarmwareName } from "../sequences/step_tiles/tile_execute_script";

export interface FarmwareFormProps {
  farmware: FarmwareManifestInfo;
  env: UserEnv;
  userEnv: UserEnv;
  farmwareEnvs: TaggedFarmwareEnv[];
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  dispatch: Function;
  botOnline: boolean;
  hideAdvanced?: boolean;
}

/** Namespace a Farmware config with the Farmware name. */
export function getConfigEnvName(farmwareName: string, configName: string) {
  return `${snakeCase(farmwareName)}_${configName}`;
}

/** Farmware description and version info for help text contents. */
export function farmwareHelpText(farmware: FarmwareManifestInfo | undefined):
  string {
  if (farmware) {
    const description = farmware.meta.description;
    const versionString = " (version: " + farmware.meta.version + ")";
    return description + versionString;
  }
  return "";
}

export interface ConfigFieldsProps {
  farmwareName: string;
  farmwareConfigs: FarmwareConfig[];
  getValue(farmwareName: string, currentConfig: FarmwareConfig): string;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  userEnv: UserEnv;
  farmwareEnvs: TaggedFarmwareEnv[];
  dispatch: Function;
}

/** Return a div that includes all Farmware input fields. */
export function ConfigFields(props: ConfigFieldsProps): JSX.Element {

  /** Set a Farmware input value on FBOS. */
  function inputChange(key: string) {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      props.shouldDisplay(Feature.api_farmware_env)
        ? props.dispatch(props.saveFarmwareEnv(key, value))
        : getDevice().setUserEnv({ [key]: value }).catch(() => { });
    };
  }

  const { farmwareName, farmwareConfigs, getValue, userEnv } = props;
  return <div className={"farmware-config-fields"}>
    {farmwareConfigs.map(config => {
      const configEnvName =
        getConfigEnvName(farmwareName, config.name);
      const value = getValue(farmwareName, config);
      const botValue = userEnv[configEnvName];
      return <div key={config.name} id={config.name}>
        <label>{config.label}</label>
        <div className={"farmware-input-group"}>
          <BlurableInput type="text"
            onCommit={inputChange(configEnvName)}
            value={value} />
          {botValue && !(value == botValue) &&
            <i className="fa fa-refresh" title={t("update to FarmBot's value")}
              onClick={() => props.dispatch(props.saveFarmwareEnv(
                configEnvName, botValue))} />}
          {!(value == config.value) &&
            <i className="fa fa-times-circle" title={t("reset to default")}
              onClick={() => props.dispatch(props.saveFarmwareEnv(
                configEnvName, config.value.toString()))} />}
        </div>
      </div>;
    })}
  </div>;
}

interface FarmwareFormState { advanced: boolean; }
interface ConfigsProps { farmwareConfigs: FarmwareConfig[]; }
interface ClearConfigsButtonProps {
  label: string;
  prefix: string;
  dispatch: Function;
}

/** Render a form with Farmware input fields. */
export class FarmwareForm
  extends React.Component<FarmwareFormProps, FarmwareFormState> {
  state: FarmwareFormState = { advanced: false };

  shouldComponentUpdate(
    nextProps: FarmwareFormProps,
    nextState: FarmwareFormState,
  ) {
    return !(equals(this.props, nextProps) && isEqual(this.state, nextState));
  }

  get farmwareEnvUuidLookup() {
    const lookup: Record<string, UUID> = {};
    this.props.farmwareEnvs.map(farmwareEnv => {
      lookup[farmwareEnv.body.key] = farmwareEnv.uuid;
    });
    return lookup;
  }

  Configs = ({ farmwareConfigs }: ConfigsProps) => {
    const {
      farmware, env, userEnv, farmwareEnvs, shouldDisplay, saveFarmwareEnv,
      dispatch,
    } = this.props;
    return <ConfigFields
      farmwareName={farmware.name}
      farmwareConfigs={farmwareConfigs}
      getValue={getValue(env)}
      userEnv={userEnv}
      farmwareEnvs={farmwareEnvs}
      shouldDisplay={shouldDisplay}
      saveFarmwareEnv={saveFarmwareEnv}
      dispatch={dispatch} />;
  }

  ClearConfigsButton = ({ label, prefix, dispatch }: ClearConfigsButtonProps) => {
    const { env } = this.props;
    const selectedKeys = Object.keys(env).filter(key => key.startsWith(prefix));
    return <button
      className={"fb-button red reset-configs"}
      title={t("Reset Farmware config values")}
      onClick={() => confirm(t("Reset {{ count }} values?",
        { count: selectedKeys.length })) &&
        selectedKeys.map(key =>
          dispatch(destroy(this.farmwareEnvUuidLookup[key])))}>
      {label}
    </button>;
  }

  render() {
    const { farmware, env, dispatch, botOnline } = this.props;

    const collapsed = (config: FarmwareConfig) =>
      farmware.name == FarmwareName.MeasureSoilHeight
      && ((nonZeroValue(env.measure_soil_height_calibration_factor)
        && nonZeroValue(env.measure_soil_height_measured_distance)) ||
        config.name != "measured_distance");
    const openConfigs = farmware.config.filter(config => !collapsed(config));
    const collapsedConfigs = farmware.config.filter(collapsed);

    return <div className={"farmware-form"}>
      <button
        className={["fb-button green farmware-button",
          nonZeroValue(env.measure_soil_height_measured_distance)
            ? ""
            : "pseudo-disabled",
        ].join(" ")}
        disabled={!botOnline}
        title={t("Run Farmware")}
        onClick={() => run(env)(farmware.name, farmware.config)}>
        {runButtonText(farmware.name, env)}
      </button>
      <this.Configs farmwareConfigs={openConfigs} />
      {!this.props.hideAdvanced && collapsedConfigs.length > 0 &&
        <div className={"advanced-configs"}>
          <ExpandableHeader
            expanded={this.state.advanced}
            title={t("Advanced")}
            onClick={() => this.setState({ advanced: !this.state.advanced })} />
          <Collapse isOpen={this.state.advanced}>
            <this.Configs farmwareConfigs={collapsedConfigs} />
          </Collapse>
        </div>}
      {farmware.name == FarmwareName.MeasureSoilHeight
        && <this.ClearConfigsButton
          label={t("Reset calibration values")}
          prefix={"measure_soil_height_calibration_"}
          dispatch={dispatch} />}
      <this.ClearConfigsButton
        label={t("Reset all values")}
        prefix={snakeCase(farmware.name)}
        dispatch={dispatch} />
    </div>;
  }
}

/** Determine if a Farmware has requested inputs. */
export function needsFarmwareForm(farmware: FarmwareManifestInfo): Boolean {
  const needsWidget = farmware.config?.length > 0;
  return needsWidget;
}


/** Get a Farmware input value from FBOS. */
const getValue = (env: UserEnv) =>
  (farmwareName: string, currentConfig: FarmwareConfig) =>
    (env[getConfigEnvName(farmwareName, currentConfig.name)]
      || toString(currentConfig.value));

/** Execute a Farmware using the provided inputs. */
const run = (env: UserEnv) =>
  (farmwareName: string, config: FarmwareConfig[]) => {
    const pairs = config.map<Pair>((x) => {
      const label = getConfigEnvName(farmwareName, x.name);
      const value = getValue(env)(farmwareName, x);
      return { kind: "pair", args: { value, label } };
    });
    getDevice().execScript(farmwareName, pairs).catch(() => { });
  };

/** Check if a FarmwareEnv has a value other than "0". */
const nonZeroValue = (value: string | undefined) =>
  parseFloat(value || "0") > 0;

/** Farmware Run button text. */
const runButtonText = (farmwareName: string, env: UserEnv) => {
  if (farmwareName == FarmwareName.MeasureSoilHeight) {
    if (!nonZeroValue(env.measure_soil_height_measured_distance)) {
      return t("Input required");
    }
    if (!nonZeroValue(env.measure_soil_height_calibration_factor)) {
      return t("Calibrate");
    }
    return t("Measure");
  }
  return t("Run");
};
