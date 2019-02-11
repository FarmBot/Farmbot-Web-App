import i18n from "i18next";

declare module "i18next" {
  export function init(options: i18n.InitOptions, callback?: i18n.Callback):
    Promise<i18n.TranslationFunction>;
  export const t: i18n.TranslationFunction;
  export type InitOptions = i18n.InitOptions;
  export type Callback = i18n.Callback;
}
