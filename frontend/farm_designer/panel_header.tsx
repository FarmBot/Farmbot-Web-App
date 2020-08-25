import React from "react";
import { getPathArray } from "../history";
import { Link } from "../link";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../settings/dev/dev_support";
import { getWebAppConfigValue } from "../config_storage/actions";
import { store } from "../redux/store";
import { BooleanSetting } from "../session_keys";
import {
  getFwHardwareValue, hasSensors,
} from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";
import { computeEditorUrlFromState } from "../nav/compute_editor_url_from_state";

export enum Panel {
  Map = "Map",
  Plants = "Plants",
  Groups = "Groups",
  SavedGardens = "SavedGardens",
  Sequences = "Sequences",
  Regimens = "Regimens",
  FarmEvents = "FarmEvents",
  Zones = "Zones",
  Points = "Points",
  Weeds = "Weeds",
  Controls = "Controls",
  Sensors = "Sensors",
  Photos = "Photos",
  Farmware = "Farmware",
  Tools = "Tools",
  Messages = "Messages",
  Logs = "Logs",
  Help = "Help",
  Settings = "Settings",
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
  [Panel.Groups]: PanelColor.blue,
  [Panel.Sequences]: PanelColor.gray,
  [Panel.Regimens]: PanelColor.gray,
  [Panel.SavedGardens]: PanelColor.navy,
  [Panel.FarmEvents]: PanelColor.yellow,
  [Panel.Zones]: PanelColor.brown,
  [Panel.Points]: PanelColor.teal,
  [Panel.Weeds]: PanelColor.red,
  [Panel.Controls]: PanelColor.gray,
  [Panel.Sensors]: PanelColor.gray,
  [Panel.Photos]: PanelColor.gray,
  [Panel.Farmware]: PanelColor.gray,
  [Panel.Tools]: PanelColor.gray,
  [Panel.Messages]: PanelColor.gray,
  [Panel.Logs]: PanelColor.gray,
  [Panel.Help]: PanelColor.gray,
  [Panel.Settings]: PanelColor.gray,
};

export enum Icon {
  map = "map",
  plant = "plant",
  groups = "groups",
  sequence = "sequence",
  regimens = "regimen",
  gardens = "gardens",
  calendar = "calendar",
  zones = "zones",
  point = "point",
  weeds = "weeds",
  controls = "controls",
  sensors = "sensors",
  photos = "photos",
  farmware = "farmware",
  tool = "tool",
  messages = "messages",
  logs = "logs",
  help = "help",
  settings = "settings",
}

export const iconFile = (icon: Icon) => `/app-resources/img/icons/${icon}.svg`;

export const TAB_ICON: { [key in Panel]: string } = {
  [Panel.Map]: iconFile(Icon.map),
  [Panel.Plants]: iconFile(Icon.plant),
  [Panel.Groups]: iconFile(Icon.groups),
  [Panel.Sequences]: iconFile(Icon.sequence),
  [Panel.Regimens]: iconFile(Icon.regimens),
  [Panel.SavedGardens]: iconFile(Icon.gardens),
  [Panel.FarmEvents]: iconFile(Icon.calendar),
  [Panel.Zones]: iconFile(Icon.zones),
  [Panel.Points]: iconFile(Icon.point),
  [Panel.Weeds]: iconFile(Icon.weeds),
  [Panel.Controls]: iconFile(Icon.controls),
  [Panel.Sensors]: iconFile(Icon.sensors),
  [Panel.Photos]: iconFile(Icon.photos),
  [Panel.Farmware]: iconFile(Icon.farmware),
  [Panel.Tools]: iconFile(Icon.tool),
  [Panel.Messages]: iconFile(Icon.messages),
  [Panel.Logs]: iconFile(Icon.logs),
  [Panel.Help]: iconFile(Icon.help),
  [Panel.Settings]: iconFile(Icon.settings),
};

export const PANEL_SLUG: { [key in Panel]: string } = {
  [Panel.Map]: "",
  [Panel.Plants]: "plants",
  [Panel.Groups]: "groups",
  [Panel.Sequences]: "sequences",
  [Panel.Regimens]: "regimens",
  [Panel.SavedGardens]: "gardens",
  [Panel.FarmEvents]: "events",
  [Panel.Zones]: "zones",
  [Panel.Points]: "points",
  [Panel.Weeds]: "weeds",
  [Panel.Controls]: "controls",
  [Panel.Sensors]: "sensors",
  [Panel.Photos]: "photos",
  [Panel.Farmware]: "farmware",
  [Panel.Tools]: "tools",
  [Panel.Messages]: "messages",
  [Panel.Logs]: "logs",
  [Panel.Help]: "help",
  [Panel.Settings]: "settings",
};

export const PANEL_BY_SLUG: Record<string, Panel> = {};
Object.entries(PANEL_SLUG).map(([panel, slug]: [Panel, string]) =>
  PANEL_BY_SLUG[slug] = panel);

export const PANEL_PATH: Partial<{ [key in Panel]: () => string }> = {
  [Panel.Map]: () => "/app/designer",
  [Panel.Sequences]: computeEditorUrlFromState("Sequence"),
  [Panel.Regimens]: computeEditorUrlFromState("Regimen"),
};

export const PANEL_TITLE = (): { [key in Panel]: string } => ({
  [Panel.Map]: t("Map"),
  [Panel.Plants]: t("Plants"),
  [Panel.Groups]: t("Groups"),
  [Panel.Sequences]: t("Sequences"),
  [Panel.Regimens]: t("Regimens"),
  [Panel.SavedGardens]: t("Gardens"),
  [Panel.FarmEvents]: t("Events"),
  [Panel.Zones]: t("Zones"),
  [Panel.Points]: t("Points"),
  [Panel.Weeds]: t("Weeds"),
  [Panel.Controls]: t("Controls"),
  [Panel.Sensors]: t("Sensors"),
  [Panel.Photos]: t("Photos"),
  [Panel.Farmware]: t("Farmware"),
  [Panel.Tools]: t("Tools"),
  [Panel.Messages]: t("Messages"),
  [Panel.Logs]: t("Logs"),
  [Panel.Help]: t("Help"),
  [Panel.Settings]: t("Settings"),
});

// tslint:disable-next-line:cyclomatic-complexity
const getCurrentTab = (): Tabs => {
  const pathArray = getPathArray();
  if (pathArray.join("/") === "/app/designer") {
    return Panel.Map;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Groups])) {
    return Panel.Groups;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Sequences])) {
    return Panel.Sequences;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Regimens])) {
    return Panel.Regimens;
  } else if (pathArray.includes(PANEL_SLUG[Panel.SavedGardens])) {
    return Panel.SavedGardens;
  } else if (pathArray.includes(PANEL_SLUG[Panel.FarmEvents])) {
    return Panel.FarmEvents;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Zones])) {
    return Panel.Zones;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Points])) {
    return Panel.Points;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Weeds])) {
    return Panel.Weeds;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Controls])) {
    return Panel.Controls;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Sensors])) {
    return Panel.Sensors;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Photos])) {
    return Panel.Photos;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Farmware])) {
    return Panel.Farmware;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Tools])) {
    return Panel.Tools;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Messages])) {
    return Panel.Messages;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Help])) {
    return Panel.Help;
  } else if (pathArray.includes(PANEL_SLUG[Panel.Settings])) {
    return Panel.Settings;
  } else {
    return Panel.Plants;
  }
};

export const getPanelPath = (panel: Panel) => {
  const defaultLinkFn = () => `/app/designer/${PANEL_SLUG[panel]}`;
  const getPath = PANEL_PATH[panel] || defaultLinkFn;
  return getPath();
};

export interface NavTabProps {
  panel: Panel;
  desktopHide?: boolean;
}

export const NavTab = (props: NavTabProps) =>
  <Link to={getPanelPath(props.panel)}
    style={{ flex: 0.3 }}
    className={[
      getCurrentTab() === props.panel ? "active" : "",
      props.desktopHide ? "desktop-hide" : "",
    ].join(" ")}>
    <img width={25} height={25}
      src={TAB_ICON[props.panel]}
      title={PANEL_TITLE()[props.panel]} />
  </Link>;

const displayScrollIndicator = () => {
  const element = document.getElementsByClassName("panel-tabs")[1];
  const mobile = element?.scrollWidth < 430;
  const end = element?.scrollWidth - element?.scrollLeft == element?.clientWidth;
  return mobile && !end;
};

export const showSensors = () => {
  const getWebAppConfigVal = getWebAppConfigValue(store.getState);
  const firmwareHardware = getFwHardwareValue(getFbosConfig(
    store.getState().resources.index));
  return !getWebAppConfigVal(BooleanSetting.hide_sensors)
    && hasSensors(firmwareHardware);
};

export function DesignerNavTabs(props: { hidden?: boolean }) {
  const tab = getCurrentTab();
  const hidden = props.hidden ? "hidden" : "";
  return <div className={`panel-nav ${TAB_COLOR[tab]}-panel ${hidden}`}>
    {displayScrollIndicator() && <div className={"scroll-indicator"} />}
    <div className={"panel-tabs"}>
      <NavTab panel={Panel.Map} desktopHide={true} />
      <NavTab panel={Panel.Plants} />
      <NavTab panel={Panel.Groups} />
      <NavTab panel={Panel.SavedGardens} />
      <NavTab panel={Panel.Sequences} />
      <NavTab panel={Panel.Regimens} />
      <NavTab panel={Panel.FarmEvents} />
      {DevSettings.futureFeaturesEnabled() && <NavTab panel={Panel.Zones} />}
      <NavTab panel={Panel.Points} />
      <NavTab panel={Panel.Weeds} />
      <NavTab panel={Panel.Controls} />
      {showSensors() && <NavTab panel={Panel.Sensors} />}
      <NavTab panel={Panel.Photos} />
      <NavTab panel={Panel.Farmware} />
      <NavTab panel={Panel.Tools} />
      <NavTab panel={Panel.Messages} />
      <NavTab panel={Panel.Help} />
      <NavTab panel={Panel.Settings} />
    </div>
  </div>;
}
