import React from "react";
import { NavLinksProps } from "./interfaces";
import { getPathArray } from "../history";
import { Link } from "../link";
import {
  Panel, showSensors, PANEL_SLUG, TAB_ICON, PANEL_TITLE, getPanelPath,
} from "../farm_designer/panel_header";

export const getLinks = (): Panel[] => [
  Panel.Plants,
  Panel.Groups,
  Panel.Sequences,
  Panel.Regimens,
  Panel.SavedGardens,
  Panel.FarmEvents,
  Panel.Points,
  Panel.Weeds,
  Panel.Controls,
  ...(showSensors() ? [Panel.Sensors] : []),
  Panel.Photos,
  Panel.Farmware,
  Panel.Tools,
  Panel.Messages,
  Panel.Help,
  Panel.Settings,
];

export const NavLinks = (props: NavLinksProps) =>
  <div className={"links"}>
    <div className={"nav-links"}>
      {(props.addMap ? [Panel.Map] : []).concat(getLinks()).map(panel => {
        const currPageSlug = getPathArray()[3];
        const isActive = currPageSlug === PANEL_SLUG[panel] ? "active" : "";
        const desktopHide = PANEL_SLUG[panel] == "" ? "desktop-hide" : "";
        const NotificationCircle = () =>
          PANEL_SLUG[panel] === "messages" && props.alertCount > 0
            ? <div className={"saucer fun"}><p>{props.alertCount}</p></div>
            : <div className={"no-notifications"} />;
        return <Link
          to={getPanelPath(panel)}
          className={`${isActive} ${desktopHide}`}
          key={PANEL_SLUG[panel]}
          draggable={false}
          onClick={props.close("mobileMenuOpen")}>
          <div className={"link-icon"}>
            <img width={25} height={25}
              src={TAB_ICON[panel]}
              title={PANEL_TITLE()[panel]} />
            <NotificationCircle />
          </div>
          <div className={"nav-link-text"}
            data-title={PANEL_TITLE()[panel]}>
            {PANEL_TITLE()[panel]}
            <NotificationCircle />
          </div>
        </Link>;
      })}
    </div>
  </div>;
