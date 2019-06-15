export const BASE_URL = "https://software.farm.bot/docs/";

/** A centralized list of all documentation slugs in the app makes it easier to
 * rename / move links in the future. */
export const DOC_SLUGS = {
  "weed-detection": "Weed Detector",
  "camera-calibration": "Camera Calibration",
  "the-farmbot-web-app": "Web App",
  "farmware": "Farmware",
};

export type DocSlug = keyof typeof DOC_SLUGS;

/** WHY?: The function keeps things DRY. It also makes life easier when the
 * documentation URL / slug name changes. */
export const docLink = (slug?: DocSlug) => BASE_URL + (slug || "");
