import { WDENVKey } from "./remote_env/interfaces";
import { NumericValues } from "./image_workspace";
import { envSave } from "./remote_env/actions";
type Key = keyof NumericValues;
type Translation = Record<Key, WDENVKey>;

export let translateImageWorkspaceAndSave = (map: Translation) => {
  return (key: Key, value: number) => {
    envSave(map[key], value);
  };
}
