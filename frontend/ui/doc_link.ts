import { ExternalUrl } from "../external_urls";
import { push } from "../history";
import { Path } from "../internal_urls";

/** A centralized list of all documentation slugs in the app makes it easier to
 * rename / move links in the future. */
const DOC_SLUGS = {
  "weed-detection": "Weed Detector",
  "camera-calibration": "Camera Calibration",
  "measure-soil-height": "Measure Soil Height",
  "the-farmbot-web-app": "Web App",
  "farmware": "Farmware",
  "farmbot-os": "Installing FarmBot OS",
  "connecting-farmbot-to-the-internet": "Connecting FarmBot to the Internet",
  "for-it-security-professionals": "For IT Security Professionals",
};

const DEV_DOC_SLUGS = {
  "lua": "Lua",
};

const GENESIS_DOC_SLUGS = {
  "why-is-my-farmbot-not-moving": "Why is my FarmBot not moving?",
};

export type DocSlug = keyof typeof DOC_SLUGS;
type DevDocSlug = keyof typeof DEV_DOC_SLUGS;
type GenesisDocSlug = keyof typeof GENESIS_DOC_SLUGS;

/** WHY?: The function keeps things DRY. It also makes life easier when the
 * documentation URL / slug name changes. */
export const docLink = (slug?: DocSlug) =>
  `${ExternalUrl.softwareDocs}/${slug || ""}`;

export const devDocLink = (slug?: DevDocSlug) =>
  `${ExternalUrl.developerDocs}/${slug || ""}`;

export const genesisDocLink = (slug?: GenesisDocSlug) =>
  `${ExternalUrl.genesisDocs}/${slug || ""}`;

const genericDocLinkClick = <T>(slug: T, page: "help" | "developer") => () => {
  const path = page == "help" ? Path.help : Path.developer;
  if (Path.getSlug(Path.designer()) == page) {
    location.assign(window.location.origin + Path.withApp(path("" + slug)));
  } else {
    push(path("" + slug));
  }
};

export const docLinkClick = (slug: DocSlug) =>
  genericDocLinkClick<DocSlug>(slug, "help");

export const devDocLinkClick = (slug: DevDocSlug) =>
  genericDocLinkClick<DevDocSlug>(slug, "developer");
