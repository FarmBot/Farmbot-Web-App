import axios from "axios";
import { Session } from "./session";
import { BooleanSetting } from "./session_keys";

function generateUrl(langCode: string) {
  const lang = langCode.slice(0, 2);
  const url = "//" + location.host.split(":")
  [0] + ":" + location.port + "/app-resources/languages/" + lang + ".js";
  return url;
}

function getUserLang(langCode = "en_us") {
  return axios.get(generateUrl(langCode))
    .then(() => { return langCode.slice(0, 2); })
    .catch((error) => { return "en"; });
}

export function detectLanguage() {
  return getUserLang(navigator.language).then(function (lang) {
    // NOTE: Some international users prefer using the app in English.
    //       This preference is stored in `DISABLE_I18N`.
    const choice = Session.getBool(BooleanSetting.disableI18n) ? "en" : lang;
    const langi = require("../public/app-resources/languages/" + choice + ".js");
    return {
      nsSeparator: "",
      keySeparator: "",
      lng: lang,
      resources: { [lang]: { translation: langi } }
    };
  });
}
