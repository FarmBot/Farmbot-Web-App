import { detectLanguage } from "./i18n";
import * as I18n from "i18next";

export function revertToEnglish() {
  detectLanguage("en").then(x => {
    x.lng = "en";
    I18n.init(x, () => { });
  });
}
