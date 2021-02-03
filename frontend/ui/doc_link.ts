import { ExternalUrl } from "../external_urls";
import { getPathArray, push } from "../history";

/** A centralized list of all documentation slugs in the app makes it easier to
 * rename / move links in the future. */
export const DOC_SLUGS = {
  "weed-detection": "Weed Detector",
  "camera-calibration": "Camera Calibration",
  "measure-soil-height": "Measure Soil Height",
  "the-farmbot-web-app": "Web App",
  "farmware": "Farmware",
  "farmbot-os#section-installation": "Installing FarmBot OS",
  "connecting-farmbot-to-the-internet": "Connecting FarmBot to the Internet",
  "for-it-security-professionals": "For IT Security Professionals",
};

export const DEV_DOC_SLUGS = {
  "lua": "Lua",
};

export type DocSlug = keyof typeof DOC_SLUGS;
export type DevDocSlug = keyof typeof DEV_DOC_SLUGS;

/** WHY?: The function keeps things DRY. It also makes life easier when the
 * documentation URL / slug name changes. */
export const docLink = (slug?: DocSlug) =>
  `${ExternalUrl.softwareDocs}/${slug || ""}`;

export const devDocLink = (slug?: DevDocSlug) =>
  `${ExternalUrl.developerDocs}/${slug || ""}`;

const genericDocLinkClick = <T>(slug: T, page: "help" | "developer") => () => {
  const path = `/app/designer/${page}?page=${slug}`;
  if (getPathArray()[3] == page) {
    location.assign(window.location.origin + path);
  } else {
    push(path);
  }
};

export const docLinkClick = (slug: DocSlug) =>
  genericDocLinkClick<DocSlug>(slug, "help");

export const devDocLinkClick = (slug: DevDocSlug) =>
  genericDocLinkClick<DevDocSlug>(slug, "developer");
