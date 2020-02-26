import * as React from "react";
import { getPathArray } from "../history";
import { Link } from "../link";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../account/dev/dev_support";

export enum Panel {
  Map = "Map",
  Plants = "Plants",
  FarmEvents = "FarmEvents",
  SavedGardens = "SavedGardens",
  Tools = "Tools",
  Settings = "Settings",
  Points = "Points",
  Groups = "Groups",
  Weeds = "Weeds",
  Zones = "Zones",
}

type Tabs = keyof typeof Panel;

export enum PanelColor {
  green = "green",
  cyan = "cyan",
  brown = "brown",
  magenta = "magenta",
  gray = "gray",
  lightGray = "light-gray",
  yellow = "yellow",
  blue = "blue",
  navy = "navy",
  teal = "teal",
  red = "red",
}

export const TAB_COLOR: { [key in Panel]: PanelColor } = {
  [Panel.Map]: PanelColor.gray,
  [Panel.Plants]: PanelColor.green,
  [Panel.FarmEvents]: PanelColor.yellow,
  [Panel.SavedGardens]: PanelColor.navy,
  [Panel.Tools]: PanelColor.gray,
  [Panel.Settings]: PanelColor.gray,
  [Panel.Points]: PanelColor.teal,
  [Panel.Groups]: PanelColor.blue,
  [Panel.Weeds]: PanelColor.red,
  [Panel.Zones]: PanelColor.brown,
};

const iconFile = (icon: string) => `/app-resources/img/icons/${icon}.svg`;

export const TAB_ICON: { [key in Panel]: string } = {
  [Panel.Map]: iconFile("map"),
  [Panel.Plants]: iconFile("plant"),
  [Panel.FarmEvents]: iconFile("calendar"),
  [Panel.SavedGardens]: iconFile("gardens"),
  [Panel.Tools]: iconFile("tool"),
  [Panel.Settings]: iconFile("settings"),
  [Panel.Points]: iconFile("point"),
  [Panel.Groups]: iconFile("groups"),
  [Panel.Weeds]: iconFile("weeds"),
  [Panel.Zones]: iconFile("zones"),
};

const getCurrentTab = (): Tabs => {
  const pathArray = getPathArray();
  if (pathArray.join("/") === "/app/designer") {
    return Panel.Map;
  } else if (pathArray.includes("events")) {
    return Panel.FarmEvents;
  } else if (pathArray.includes("gardens")) {
    return Panel.SavedGardens;
  } else if (pathArray.includes("tools")) {
    return Panel.Tools;
  } else if (pathArray.includes("settings")) {
    return Panel.Settings;
  } else if (pathArray.includes("points")) {
    return Panel.Points;
  } else if (pathArray.includes("groups")) {
    return Panel.Groups;
  } else if (pathArray.includes("weeds")) {
    return Panel.Weeds;
  } else if (pathArray.includes("zones")) {
    return Panel.Zones;
  } else {
    return Panel.Plants;
  }
};

const common = { width: 30, height: 30 };

interface NavTabProps {
  panel: Panel;
  linkTo: string;
  title: string;
  icon?: string;
  desktopHide?: boolean;
}

const NavTab = (props: NavTabProps) =>
  <Link to={props.linkTo} style={{ flex: 0.3 }}
    className={[
      getCurrentTab() === props.panel ? "active" : "",
      props.desktopHide ? "desktop-hide" : "",
    ].join(" ")}>
    <img {...common}
      src={TAB_ICON[props.panel]} title={props.title} />
  </Link>;

export function DesignerNavTabs(props: { hidden?: boolean }) {
  const tab = getCurrentTab();
  const hidden = props.hidden ? "hidden" : "";
  return <div className={`panel-nav ${TAB_COLOR[tab]}-panel ${hidden}`}>
    <div className="panel-tabs">
      <NavTab panel={Panel.Map}
        linkTo={"/app/designer"}
        title={t("Map")} desktopHide={true} />
      <NavTab
        panel={Panel.Plants}
        linkTo={"/app/designer/plants"}
        title={t("Plants")} />
      <NavTab
        panel={Panel.Groups}
        linkTo={"/app/designer/groups"}
        title={t("Groups")} />
      <NavTab
        panel={Panel.SavedGardens}
        linkTo={"/app/designer/gardens"}
        title={t("Gardens")} />
      <NavTab
        panel={Panel.FarmEvents}
        linkTo={"/app/designer/events"}
        title={t("Events")} />
      {DevSettings.futureFeaturesEnabled() &&
        <NavTab
          panel={Panel.Zones}
          linkTo={"/app/designer/zones"}
          title={t("Zones")} />}
      <NavTab
        panel={Panel.Points}
        linkTo={"/app/designer/points"}
        title={t("Points")} />
      <NavTab
        panel={Panel.Weeds}
        linkTo={"/app/designer/weeds"}
        title={t("Weeds")} />
      {!DevSettings.futureFeaturesEnabled() &&
        <NavTab
          panel={Panel.Tools}
          linkTo={"/app/designer/tools"}
          title={t("Tools")} />}
      <NavTab
        panel={Panel.Settings}
        icon={"fa fa-gear"}
        linkTo={"/app/designer/settings"}
        title={t("Settings")} />
    </div>
  </div>;
}
