import { Collapse } from "@blueprintjs/core";
import React from "react";
import { Icon, iconFile } from "../farm_designer/panel_header";
import { getPathArray, push } from "../history";
import { openHotkeyHelpOverlay } from "../hotkeys";
import { t } from "../i18next_wrapper";

interface Page {
  title: string;
  icon?: Icon;
  fa_icon?: string;
  iconPath?: string;
  onClick?(): void;
}

type Pages = Record<string, Page>;

const PAGES = (): Pages => ({
  help: {
    title: t("Software Documentation"),
    icon: Icon.documentation,
  },
  developer: {
    title: t("Developer Documentation"),
    icon: Icon.developer,
  },
  genesis: {
    title: t("Genesis Documentation"),
    iconPath: "/app-resources/img/favicon.png",
  },
  express: {
    title: t("Express Documentation"),
    iconPath: "/app-resources/img/favicon.png",
  },
  business: {
    title: t("Business Documentation"),
    icon: Icon.shop,
  },
  education: {
    title: t("Education Documentation"),
    fa_icon: "graduation-cap",
  },
  tours: {
    title: t("Take a Tour"),
    fa_icon: "share",
  },
  support: {
    title: t("Get Help"),
    icon: Icon.support,
  },
});

const maybeAddHotkeysMenuItem = (): [string, Page][] =>
  window.innerWidth > 450
    ? [["hotkeys", {
      title: t("Hotkeys"),
      fa_icon: "keyboard-o",
      onClick: openHotkeyHelpOverlay,
    }]]
    : [];

export const HelpHeader = () => {
  const [isOpen, setOpen] = React.useState(false);
  const click = () => setOpen(!isOpen);
  const currentSlug = getPathArray()[3];
  const currentPage = PAGES()[currentSlug] || PAGES().help;
  return <div className={"help-panel-header"} onClick={click}>
    {PageLink([currentSlug, currentPage])}
    <i className={`fa fa-chevron-${isOpen ? "up" : "down"}`} />
    {isOpen &&
      <Collapse isOpen={isOpen}>
        {Object.entries(PAGES())
          .filter(([slug, _page]) => slug != currentSlug)
          .concat(maybeAddHotkeysMenuItem())
          .map(PageLink)}
      </Collapse>}
  </div>;
};

const PageLink = ([slug, page]: [string, Page]) => {
  const iconSrc = page.icon ? iconFile(page.icon) : page.iconPath;
  return <a key={slug}
    title={page.title}
    onClick={() => page.onClick ? page.onClick() : push(`/app/designer/${slug}`)}>
    {page.fa_icon
      ? <i className={`fa fa-${page.fa_icon}`} />
      : <img width={25} height={25} src={iconSrc} />}
    {page.title}
  </a>;
};
