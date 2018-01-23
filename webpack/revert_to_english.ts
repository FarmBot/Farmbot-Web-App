import { detectLanguage } from "./i18n";
import { init } from "i18next";

export async function revertToEnglish() {
  const x = init;
  debugger;
  init(await detectLanguage("en"), () => { });
}
