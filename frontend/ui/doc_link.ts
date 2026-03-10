import { ExternalUrl } from "../external_urls";
import { NavigateFunction } from "react-router";
import { Path } from "../internal_urls";
import { setPanelOpen } from "../farm_designer/panel_header";

/** A centralized list of all documentation slugs in the app makes it easier to
 * rename / move links in the future. */
const _DOC_SLUGS = {
  "weed-detection": "Weed Detector",
  "camera-calibration": "Camera Calibration",
  "measure-soil-height": "Measure Soil Height",
  "the-farmbot-web-app": "Web App",
  "farmware": "Farmware",
  "farmbot-os": "Installing FarmBot OS",
  "connecting-farmbot-to-the-internet": "Connecting FarmBot to the Internet",
  "for-it-security-professionals": "For IT Security Professionals",
};

const _DEV_DOC_SLUGS = {
  "lua": "Lua",
};

const _GENESIS_DOC_SLUGS = {
  "why-is-my-farmbot-not-moving": "Why is my FarmBot not moving?",
};

export type DocSlug = keyof typeof _DOC_SLUGS;
type DevDocSlug = keyof typeof _DEV_DOC_SLUGS;
type GenesisDocSlug = keyof typeof _GENESIS_DOC_SLUGS;

/** WHY?: The function keeps things DRY. It also makes life easier when the
 * documentation URL / slug name changes. */
export const docLink = (slug?: DocSlug) =>
  `${ExternalUrl.softwareDocs}/${slug || ""}`;

export const devDocLink = (slug?: DevDocSlug) =>
  `${ExternalUrl.developerDocs}/${slug || ""}`;

export const genesisDocLink = (slug?: GenesisDocSlug) =>
  `${ExternalUrl.genesisDocs}/${slug || ""}`;

const genericDocLinkClick =
  <T>(
    slug: T,
    page: "help" | "developer",
    navigate: NavigateFunction,
    dispatch: Function,
  ) => () => {
    dispatch(setPanelOpen(true));
    const path = page == "help" ? Path.help : Path.developer;
    navigate(path("" + slug));
  };

interface DocLinkClickPropsBase {
  navigate: NavigateFunction;
  dispatch: Function;
}

export interface DocLinkClickProps extends DocLinkClickPropsBase {
  slug: DocSlug;
}

export interface DevDocLinkClickProps extends DocLinkClickPropsBase {
  slug: DevDocSlug;
}

export const docLinkClick =
  ({ slug, navigate, dispatch }: DocLinkClickProps) =>
    genericDocLinkClick<DocSlug>(slug, "help", navigate, dispatch);

export const devDocLinkClick =
  ({ slug, navigate, dispatch }: DevDocLinkClickProps) =>
    genericDocLinkClick<DevDocSlug>(slug, "developer", navigate, dispatch);
