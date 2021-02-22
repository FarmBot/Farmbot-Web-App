import { getModifiedClassNameSpecifyDefault } from "../settings/default_values";
import { WD_KEY_DEFAULTS } from "./remote_env/constants";

type Value = string | number | boolean | undefined;
const DEFAULT_ENV_VALUES: Record<string, Value> = WD_KEY_DEFAULTS;

export const getModifiedClassName = (key: string, value: Value) => {
  const defaultValue = DEFAULT_ENV_VALUES[key];
  return getModifiedClassNameSpecifyDefault(value, defaultValue);
};
