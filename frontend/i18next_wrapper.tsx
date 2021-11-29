import { Dictionary } from "farmbot";
import { t as translate } from "i18next";

export function t(str: string, map: Dictionary<string | number> = {}): string {
  return translate(str, map) || "";
}
