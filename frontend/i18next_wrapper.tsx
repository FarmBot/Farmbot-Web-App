import { Dictionary } from "farmbot";
import I from "i18next";

export function t(str: string, map: Dictionary<string | number> = {}): string {
  return I.t(str, map) || "";
}
