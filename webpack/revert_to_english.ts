import { detectLanguage } from "./i18n";
import * as I18n from "i18next";

function revertToEnglish() {
  detectLanguage("en").then(x => {
    x.lng = "en";
    I18n.init(x, () => console.log("Should be in Russian now."));
  });
}
