import * as React from "react";
import { NavLinksProps } from "./interfaces";
import { getPathArray } from "../history";
import { computeEditorUrlFromState } from "./compute_editor_url_from_state";
import { Link } from "../link";
import { t } from "../i18next_wrapper";
import { betterCompact } from "../util";
/** Uses a slug and a child path to compute the `href` of a navbar link. */
export type LinkComputeFn = (slug: string, childPath: string) => string;

/** If no LinkComputeFn is provided, the default behavior prevails. */
const DEFAULT: LinkComputeFn =
  (slug, childpath) => `/app/${slug}${childpath}`;

interface NavLinkParams {
  /** User visible verbiage. */
  name: string;
  /** Font awesome icon name. */
  icon: string;
  /** A unique name used for the path in the URL bar. */
  slug: string;
  computeHref?: LinkComputeFn;
  designer?: boolean;
}

export const getLinks = (): NavLinkParams[] => betterCompact([
  { name: "Farm Designer", icon: "leaf", slug: "designer" },
  {
    name: "Sequences", icon: "server", slug: "sequences",
    computeHref: computeEditorUrlFromState("Sequence", false)
  },
  {
    name: "Regimens", icon: "calendar-check-o", slug: "regimens",
    computeHref: computeEditorUrlFromState("Regimen", true), designer: true,
  },
  {
    name: "Messages", icon: "list", slug: "messages", designer: true,
    computeHref: () => "/app/designer/messages",
  },
]);

export const NavLinks = (props: NavLinksProps) => {
  const currPath = getPathArray();
  return <div className="links">
    <div className="nav-links">
      {getLinks().map(link => {
        const currPageSlug = currPath[link.designer ? 3 : 2];
        const isActive = !(link.slug === "designer"
          && ["regimens", "messages"].includes(currPath[3])) &&
          (currPageSlug === link.slug) ? "active" : "";
        const childPath = link.slug === "designer" ? "/plants" : "";
        const fn = link.computeHref || DEFAULT;
        return <Link
          to={fn(link.slug, childPath)}
          className={`${isActive}`}
          key={link.slug}
          draggable={false}
          onClick={props.close("mobileMenuOpen")}>
          <i className={`fa fa-${link.icon}`} />
          <div data-title={t(link.name)}>
            {t(link.name)}
            {link.slug === "messages" && props.alertCount > 0 &&
              <div className={"saucer fun"}>
                <p>{props.alertCount}</p>
              </div>}
          </div>
        </Link>;
      })}
    </div>
  </div>;
};
