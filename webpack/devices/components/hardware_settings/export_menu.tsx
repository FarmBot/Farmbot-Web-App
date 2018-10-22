import * as React from "react";
import { pickBy } from "lodash";
import { FirmwareConfig } from "farmbot/dist/resources/api_resources";

/** i.e., { encoder_enabled: { x: 1, y: 1, z: 1 } } */
type CondensedFwConfig = {
  [key: string]: {
    [subkey: string]: boolean | number | string | undefined
  }
};

const isAxisKey = (key: string) =>
  ["_x", "_y", "_z"].includes(key.slice(-2));
const isPinGuardKey = (key: string) =>
  ["_active_state", "_pin_nr", "_time_out"].includes(key.slice(11));

const getSubKeyName = (key: string) => {
  if (isAxisKey(key)) {
    return key.slice(-1);
  } else if (isPinGuardKey(key)) {
    return key.slice(12);
  } else {
    return "";
  }
};

export const FwParamExportMenu =
  ({ firmwareConfig }: { firmwareConfig: FirmwareConfig }) => {
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
    const reducedParamKeys = new Set(Object.keys(fwConfig)
      .map(key => isAxisKey(key) ? key.slice(0, -2) : key)
      .map(key => isPinGuardKey(key) ? key.slice(0, 11) : key));

    const condensedFwConfig: CondensedFwConfig = {};

    /** Add keys. */
    Array.from(reducedParamKeys).map(key => condensedFwConfig[key] = {});

    /** Add subkeys and values. */
    Object.entries(fwConfig).map(([fwConfigKey, value]) => {
      Array.from(reducedParamKeys).map(key => {
        if (fwConfigKey.startsWith(key)) {
          condensedFwConfig[key][getSubKeyName(fwConfigKey)] = value;
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
        const fwConfigKey = subKey != "" ? `${key}_${subKey}` : key;
        uncondensedFwConfig[fwConfigKey] = value;
      }
      ));
    return uncondensedFwConfig;
  };
