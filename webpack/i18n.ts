import axios from "axios";
import { InitOptions } from "i18next";
/** @public */
export function generateUrl(langCode: string) {
  const lang = langCode.slice(0, 2);
  const url = "//" + location.host.split(":")
  [0] + ":" + location.port + "/app-resources/languages/" + lang + ".js";
  return url;
}

export function getUserLang(langCode = "en_us") {
  return axios.get(generateUrl(langCode))
    .then(() => { return langCode.slice(0, 2); })
    .catch(() => { return "en"; });
}

export function generateI18nConfig(lang: string): InitOptions {
  const translation = require("../public/app-resources/languages/" + lang + ".js");

  return {
    nsSeparator: "",
    keySeparator: "",
    lng: lang,
    resources: { [lang]: { translation } }
  };
}

export const detectLanguage =
  (lang = navigator.language) => getUserLang(lang).then(generateI18nConfig);
