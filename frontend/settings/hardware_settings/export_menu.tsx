import React from "react";
import { pickBy } from "lodash";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { GetState } from "../../redux/interfaces";
import { edit, save } from "../../api/crud";
import { t } from "../../i18next_wrapper";
import { error } from "../../toast/toast";
import { getFirmwareConfig } from "../../resources/getters";

/** i.e., { encoder_enabled: { x: 1, y: 1, z: 1 } } */
type CondensedFwConfig = {
  [key: string]: {
    [subkey: string]: boolean | number | string | undefined
  }
};

const getAxisSubKey = (key: string) => key.split("_").slice(-1)[0];
const getAxisSupKey = (key: string) => key.split("_").slice(0, -1).join("_");

const isAxisKey = (key: string) =>
  ["x", "y", "z", "z2"].includes(getAxisSubKey(key));
const isPinGuardKey = (key: string) =>
  ["_active_state", "_pin_nr", "_time_out"].includes(key.slice(11));
const isPinReportKey = (key: string) =>
  ["_pin_nr"].includes(key.slice(12));

const getSubKeyName = (key: string) => {
  if (isAxisKey(key)) {
    return getAxisSubKey(key);
  } else if (isPinGuardKey(key)) {
    return key.slice(12);
  } else if (isPinReportKey(key)) {
    return key.slice(13);
  } else {
    return "";
  }
};

const getSupKeyName = (key: string) => {
  if (isAxisKey(key)) {
    return getAxisSupKey(key);
  } else if (isPinGuardKey(key)) {
    return key.slice(0, 11);
  } else if (isPinReportKey(key)) {
    return key.slice(0, 12);
  } else {
    return key;
  }
};

export const FwParamExportMenu =
  ({ firmwareConfig }: { firmwareConfig: FirmwareConfig | undefined }) => {
    /** Filter out unnecessary parameters. */
    const filteredConfig = pickBy(firmwareConfig, (_, key) =>
      !["id", "device_id", "api_migrated", "created_at", "updated_at",
        "param_test", "param_version"].includes(key));

    const condensedFwConfig = condenseFwConfig(filteredConfig);

    /** Total number of condensed firmware config keys. */
    const entryCount = Object.keys(condensedFwConfig).length;

    /** Display in JSON using an unordered HTML list. */
    return <div className={"firmware-setting-export-menu"}>
      <ul>
        <li key={"header"}>{"{"}</li>
        {Object.entries(condensedFwConfig).map(([key, obj], keyNumber) => {
          const entryComma = (keyNumber + 1) === entryCount ? "" : ",";
          const subEntryCount = Object.keys(obj).length;
          return <li key={key}>
            {`"${key}": {`}
            {Object.entries(obj).map(([subKey, value], subKeyNo) => {
              const subentryComma = (subKeyNo + 1) === subEntryCount ? "" : ",";
              return `"${subKey}": ${value}${subentryComma} `;
            })}
            {`}${entryComma}`}
          </li>;
        })}
        <li key={"footer"}>{"}"}</li>
      </ul>
    </div>;
  };

export const condenseFwConfig =
  (fwConfig: Partial<FirmwareConfig>): CondensedFwConfig => {
    /** Set of parameter keys without suffixes such as `_<x|y|z>`. */
    const reducedParamKeys = new Set(
      Object.keys(fwConfig)
        .sort()
        .map(getSupKeyName));

    const condensedFwConfig: CondensedFwConfig = {};

    /** Add keys. */
    Array.from(reducedParamKeys).map(key => condensedFwConfig[key] = {});

    /** Add subkeys and values. */
    Object.entries(fwConfig).map(([fwConfigKey, value]) => {
      Array.from(reducedParamKeys).map(key => {
        if (key == getSupKeyName(fwConfigKey)) {
          UNITS[key] && (condensedFwConfig[key]["units"] =
            JSON.stringify(UNITS[key]));
          const subKey = getSubKeyName(fwConfigKey);
          condensedFwConfig[key][subKey] = value;
        }
      });
    });

    return condensedFwConfig;
  };

export const uncondenseFwConfig =
  (condensed: CondensedFwConfig): Partial<FirmwareConfig> => {
    const uncondensedFwConfig: {
      [key: string]: boolean | number | string | undefined
    } = {};
    Object.entries(condensed).map(([key, obj]) =>
      Object.entries(obj).map(([subKey, value]) => {
        if (subKey == "units") { return; }
        const fwConfigKey = subKey != "" ? `${key}_${subKey}` : key;
        uncondensedFwConfig[fwConfigKey] = value;
      }));
    return uncondensedFwConfig;
  };

const UNITS: { [x: string]: string } = {
  movement_axis_nr_steps: "microsteps",
  movement_home_spd: "microsteps/s",
  movement_max_spd: "microsteps/s",
  movement_min_spd: "microsteps/s",
  movement_step_per_mm: "microsteps/mm",
  movement_steps_acc_dec: "microsteps",
  movement_calibration_deadzone: "microsteps",
};

export const importParameters = (input: string) =>
  (dispatch: Function, getState: GetState) => {
    let parsedInput = {};
    try {
      parsedInput = JSON.parse(input);
    } catch {
      error(t("Hardware parameter import error."));
      return;
    }
    const newConfigs = uncondenseFwConfig(parsedInput);
    const firmwareConfig = getFirmwareConfig(getState().resources.index);
    if (firmwareConfig) {
      dispatch(edit(firmwareConfig, { ...newConfigs }));
      dispatch(save(firmwareConfig.uuid));
    }
  };

export const resendParameters = () =>
  (dispatch: Function, getState: GetState) => {
    const firmwareConfig = getFirmwareConfig(getState().resources.index);
    if (firmwareConfig) {
      const { param_version } = firmwareConfig.body;
      const paramVersion = param_version > 100 ? 1 : param_version + 1;
      dispatch(edit(firmwareConfig, {
        ...firmwareConfig.body, param_version: paramVersion
      }));
      dispatch(save(firmwareConfig.uuid));
    }
  };
