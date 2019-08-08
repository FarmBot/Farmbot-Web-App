import { detectLanguage } from "./i18n";
import I from "i18next";
import { noop } from "lodash";

export async function revertToEnglish() {
  I.init(await detectLanguage("en"), noop);
}
