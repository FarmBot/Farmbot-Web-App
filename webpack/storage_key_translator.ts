import { BooleanSetting, NumericSetting } from "./session_keys";
import { camelCase } from "lodash";

/** HISTORICAL CONTEXT: Session store is gradually being replaced with API-based
 *  storage. In the process we needed to go from jsCase to ruby_elixir_case.
 * Performing a onetime translation prevents loss of settings in localstorage. */

/** All the information needed to migrate the localStorage keys from one place
 * to the other. */
type KeyTranslationPair = { jsCaseKey: string, ruby_case_key: string; };

const eachEntry = (): KeyTranslationPair[] => {
  return Object
    .keys(BooleanSetting)
    .concat(Object.keys(NumericSetting))
    .map(key => ({ jsCaseKey: camelCase(key), ruby_case_key: key, value: key }));
};

const transferKey = (x: KeyTranslationPair) =>
  localStorage.setItem(x.ruby_case_key, localStorage.getItem(x.jsCaseKey) || "");

export const DONE_FLAG = "done";

const markAsDone = () => localStorage.setItem(DONE_FLAG, DONE_FLAG);

const translateKeys = () => eachEntry().map(transferKey);

const doRunMigration = () => translateKeys() && markAsDone();

const mustRun = () => !localStorage.getItem(DONE_FLAG);

export const maybeRunLocalstorageMigration = () => mustRun() && doRunMigration();
