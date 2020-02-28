import * as React from "react";
import { Col, BlurableInput } from "../ui/index";
import { Pair, FarmwareConfig } from "farmbot";
import { getDevice } from "../device";
import {
  ShouldDisplay, Feature, SaveFarmwareEnv, UserEnv
} from "../devices/interfaces";
import { kebabCase, toString, snakeCase } from "lodash";
import { FarmwareManifestInfo } from "./interfaces";
import { t } from "../i18next_wrapper";

export interface FarmwareFormProps {
  farmware: FarmwareManifestInfo;
  env: UserEnv;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  dispatch: Function;
  botOnline: boolean;
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

/** Return a div that includes all Farmware input fields. */
export function ConfigFields(props: {
  farmware: FarmwareManifestInfo,
  getValue: (farmwareName: string, currentConfig: FarmwareConfig) => string,
  shouldDisplay: ShouldDisplay,
  saveFarmwareEnv: SaveFarmwareEnv,
  dispatch: Function,
}): JSX.Element {

  /** Set a Farmware input value on FBOS. */
  function inputChange(key: string) {
    return (e: React.SyntheticEvent<HTMLInputElement>) => {
      const value = e.currentTarget.value;
      props.shouldDisplay(Feature.api_farmware_env)
        ? props.dispatch(props.saveFarmwareEnv(key, value))
        : getDevice().setUserEnv({ [key]: value }).catch(() => { });
    };
  }

  const { farmware, getValue } = props;
  return <div className={"farmware-config-fields"}>
    {farmware.config.map(config => {
      const configEnvName =
        getConfigEnvName(farmware.name, config.name);
      return <div key={config.name} id={config.name}>
        <label>{config.label}</label>
        <BlurableInput type="text"
          onCommit={inputChange(configEnvName)}
          value={getValue(farmware.name, config)} />
      </div>;
    })}
  </div>;
}

/** Render a form with Farmware input fields. */
export function FarmwareForm(props: FarmwareFormProps): JSX.Element {

  /** Get a Farmware input value from FBOS. */
  function getValue(farmwareName: string, currentConfig: FarmwareConfig) {
    return (env[getConfigEnvName(farmwareName, currentConfig.name)]
      || toString(currentConfig.value));
  }

  /** Execute a Farmware using the provided inputs. */
  function run(farmwareName: string, config: FarmwareConfig[]) {
    const pairs = config.map<Pair>((x) => {
      const label = getConfigEnvName(farmwareName, x.name);
      const value = getValue(farmwareName, x);
      return { kind: "pair", args: { value, label } };
    });
    getDevice().execScript(farmwareName, pairs).catch(() => { });
  }

  const { farmware, env } = props;
  return <Col key={farmware.name}>
    <div className={kebabCase(farmware.name)}>
      <button
        className="fb-button green farmware-button"
        disabled={!props.botOnline}
        title={t("Run Farmware")}
        onClick={() => run(farmware.name, farmware.config)}>
        {t("Run")}
      </button>
      <ConfigFields
        farmware={farmware}
        getValue={getValue}
        shouldDisplay={props.shouldDisplay}
        saveFarmwareEnv={props.saveFarmwareEnv}
        dispatch={props.dispatch} />
    </div>
  </Col>;
}

/** Determine if a Farmware has requested inputs. */
export function needsFarmwareForm(farmware: FarmwareManifestInfo): Boolean {
  const needsWidget = farmware.config?.length > 0;
  return needsWidget;
}
