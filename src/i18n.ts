import axios from "axios";
import { HttpData } from "./util";

function generateUrl(langCode: string) {
  let lang = langCode.slice(0, 2);
  let url = "//" + location.host.split(":")
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
    // TODO: Possibly requires optimization using Webpack chunking.
    let langi = require("../public/app-resources/languages/" + lang + ".js");
    return {
      nsSeparator: "",
      keySeparator: "",
      lng: lang,
      resources: { [lang]: { translation: langi } }
    };
  });
}
