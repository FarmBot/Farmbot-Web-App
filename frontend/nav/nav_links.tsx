import React from "react";
import { NavLinksProps } from "./interfaces";
import { Link } from "../link";
import {
  Panel, showSensors, showFarmware, PANEL_SLUG, TAB_ICON, PANEL_TITLE,
  getPanelPath, getCurrentPanel,
  setPanelOpen,
} from "../farm_designer/panel_header";
import { ExternalUrl } from "../external_urls";
import { maybeBeacon } from "../help/tours";

export const getLinks = (): Panel[] => [
  Panel.Plants,
  Panel.Weeds,
  Panel.Points,
  Panel.Curves,
  Panel.Sequences,
  Panel.Regimens,
  Panel.FarmEvents,
  ...(showSensors() ? [Panel.Sensors] : []),
  Panel.Photos,
  ...(showFarmware() ? [Panel.Farmware] : []),
  Panel.Tools,
  Panel.Messages,
  Panel.Help,
  Panel.Settings,
];

export const NavLinks = (props: NavLinksProps) =>
  <div className={"links"}>
    <div className={"nav-links"}>
      <a id={"map"}
        draggable={false}
        className={getCurrentPanel(props.designer) === Panel.Map
          ? "active"
          : ""}
        onClick={(e: React.MouseEvent<HTMLAnchorElement>) => {
          e.preventDefault();
          props.close();
          props.dispatch(setPanelOpen(false));
        }}>
        <NavIconAndText panel={Panel.Map} alertCount={props.alertCount} />
      </a>
      {getLinks().map(panel => {
        const isActive = getCurrentPanel(props.designer) === panel;
        return <Link
          to={getPanelPath(panel)}
          className={[
            isActive ? "active" : "",
            maybeBeacon(PANEL_SLUG[panel], "soft", props.helpState),
          ].join(" ")}
          key={PANEL_SLUG[panel]}
          draggable={false}
          onClick={() => {
            props.dispatch(setPanelOpen(!isActive));
            props.close();
          }}>
          <NavIconAndText panel={panel} alertCount={props.alertCount} />
        </Link>;
      })}
      <a className={"shop-link"} key={"shop"}
        draggable={false} onClick={props.close}
        href={ExternalUrl.Store.home} target={"_blank"} rel={"noreferrer"}>
        <NavIconAndText panel={Panel.Shop} customMiniIcon={
          <div className={"external-icon"}>
            <i className="fa fa-external-link-square" />
          </div>} />
      </a>
    </div>
  </div>;

interface NavItemProps {
  panel: Panel;
  alertCount?: number;
  customMiniIcon?: React.ReactElement;
}

const NotificationCircle = (props: NavItemProps): React.ReactElement => {
  if (PANEL_SLUG[props.panel] === "messages"
    && props.alertCount && props.alertCount > 0) {
    return <div className={"saucer fun"}><p>{props.alertCount}</p></div>;
  }
  if (props.customMiniIcon) { return props.customMiniIcon; }
  return <div className={"no-notifications"} />;
};

const NavIcon = (props: NavItemProps) =>
  <div className={"link-icon"}>
    <img width={25} height={25}
      src={TAB_ICON[props.panel]}
      title={PANEL_TITLE()[props.panel]} />
    <NotificationCircle {...props} />
  </div>;

const NavText = (props: NavItemProps) =>
  <div className={"nav-link-text"}
    data-title={PANEL_TITLE()[props.panel]}>
    {PANEL_TITLE()[props.panel]}
    <NotificationCircle {...props} />
  </div>;

const NavIconAndText = (props: NavItemProps) =>
  <div className={"link-icon-and-text"}>
    <NavIcon {...props} />
    <NavText {...props} />
  </div>;
