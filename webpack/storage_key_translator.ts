import { BooleanSetting, NumericSetting } from "./session_keys";
import { camelCase } from "lodash";
import { Dictionary } from "farmbot";
import { Primitive } from "./util";
import axios from "axios";
import { API } from "./api/index";

/** HISTORICAL CONTEXT: Session store is gradually being replaced with API-based
 *  storage. In the process we needed to go from jsCase to ruby_elixir_case.
 * Performing a onetime translation prevents loss of settings in localstorage. */

/** All the information needed to migrate the localStorage keys from one place
 * to the other. */
interface KeyTranslation {
  jsCaseKey: string;
  ruby_case_key: string;
  value: string | null;
}

const eachEntry = (): KeyTranslation[] => {
  return Object
    .keys(BooleanSetting)
    .concat(Object.keys(NumericSetting))
    .map(key => ({
      jsCaseKey: camelCase(key),
      ruby_case_key: key,
      value: localStorage.getItem(camelCase(key))
    }));
};

export const DONE_FLAG = "done";

const markAsDone = () => localStorage.setItem(DONE_FLAG, DONE_FLAG);

const doRunMigration = () => {
  const keys = eachEntry();
  const newStuff: Dictionary<Primitive | undefined> = {};
  keys.map(key => {
    const { ruby_case_key, value } = key;
    if (value) {
      try {
        newStuff[ruby_case_key] = JSON.parse(value);
      } catch (error) {
      }
    }
  });

  const ok = () => {
    markAsDone();
  };

  return axios.put(API.current.webAppConfigPath, newStuff).then(ok, ok);
};

const mustRun = () => !localStorage.getItem(DONE_FLAG);

export const maybeRunLocalstorageMigration = () => mustRun() && doRunMigration();
