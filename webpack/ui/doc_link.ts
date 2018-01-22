export const BASE_URL = "https://software.farm.bot/docs/";

/** A centralized list of all documentation slugs in the app makes it easier to
 * rename / move links in the future. */
export type DocSlug =
  | "farmware#section-weed-detector"
  | "farmware#section-camera-calibration"
  | "the-farmbot-web-app"
  | "farmware";

/** WHY?: The function keeps things DRY. It also makes life easier when the
 * documentation URL / slug name changes. */
export const docLink = (slug?: DocSlug) => BASE_URL + (slug || "");
