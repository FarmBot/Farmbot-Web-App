import axios from "axios";
import { Session } from "./session";
import { BooleanSetting } from "./session_keys";
import { InitOptions } from "i18next";

export function generateUrl(langCode: string) {
  const lang = langCode.slice(0, 2);
  const url = "//" + location.host.split(":")
  [0] + ":" + location.port + "/app-resources/languages/" + lang + ".js";
  return url;
}

export function getUserLang(langCode = "en_us") {
  return axios.get(generateUrl(langCode))
    .then(() => { return langCode.slice(0, 2); })
    .catch((error) => { return "en"; });
}

export function generateI18nConfig(lang: string): InitOptions {
  const choice = Session.deprecatedGetBool(BooleanSetting.disable_i18n) ? "en" : lang;
  const translation = require("../public/app-resources/languages/" + choice + ".js");

  return {
    nsSeparator: "",
    keySeparator: "",
    lng: lang,
    resources: { [lang]: { translation } }
  };
}

export const detectLanguage =
  (lang = navigator.language) => getUserLang(lang).then(generateI18nConfig);
