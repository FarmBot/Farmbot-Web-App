import axios from "axios";
import { InitOptions } from "i18next";
import { merge } from "lodash";
import { FilePath } from "./internal_urls";

/** @public */
export function generateUrl(langCode: string, host: string, port: string) {
  const lang = langCode.slice(0, 2);
  const baseUrl = `//${host.split(":")[0]}:${port}`;
  const url = `${baseUrl}${FilePath.language(lang)}`;
  return url;
}

export function getUserLang(
  langCode = "en_us", host = location.host, port = location.port) {
  return axios.get(generateUrl(langCode, host, port))
    .then(() => langCode.slice(0, 2))
    .catch(() => "en");
}

type TranslationFile = { [cat: string]: { [key: string]: string } };
type Translations = { [key: string]: string };

const parseTranslationData = (data: TranslationFile): Translations =>
  merge(data["translated"], data["untranslated"], data["other_translations"]);

export function generateI18nConfig(lang: string): Promise<InitOptions> {
  return axios
    .get<TranslationFile>(FilePath.language(lang))
    .then(response => {
      const translation = parseTranslationData(response.data);
      return {
        nsSeparator: false,
        keySeparator: false,
        lng: lang,
        resources: { [lang]: { translation } }
      };
    });
}

export const detectLanguage =
  (lang = navigator.language) => getUserLang(lang).then(generateI18nConfig);
