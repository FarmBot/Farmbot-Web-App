import { detectLanguage } from "./i18n";
import { init } from "i18next";
import { noop } from "lodash";

export async function revertToEnglish() {
  init(await detectLanguage("en"), noop);
}
