import React from "react";
import { getPathArray } from "../history";
import { Link } from "../link";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../settings/dev/dev_support";
import { getWebAppConfigValue } from "../config_storage/actions";
import { store } from "../redux/store";
import { BooleanSetting } from "../session_keys";
import { computeEditorUrlFromState } from "../nav/compute_editor_url_from_state";
import { compact } from "lodash";
import { selectAllFarmwareInstallations } from "../resources/selectors";
import { FilePath, Icon, Path } from "../internal_urls";

export enum Panel {
  Map = "Map",
  Plants = "Plants",
  Weeds = "Weeds",
  Points = "Points",
  Groups = "Groups",
  Curves = "Curves",
  SavedGardens = "SavedGardens",
  Sequences = "Sequences",
  Regimens = "Regimens",
  FarmEvents = "FarmEvents",
  Zones = "Zones",
  Controls = "Controls",
  Sensors = "Sensors",
  Photos = "Photos",
  Farmware = "Farmware",
  Tools = "Tools",
  Messages = "Messages",
  Logs = "Logs",
  Help = "Help",
  Settings = "Settings",
  Shop = "Shop",
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

export const TAB_COLOR: Record<Panel, PanelColor> = {
  [Panel.Map]: PanelColor.gray,
  [Panel.Plants]: PanelColor.green,
  [Panel.Weeds]: PanelColor.red,
  [Panel.Points]: PanelColor.teal,
  [Panel.Groups]: PanelColor.blue,
  [Panel.Curves]: PanelColor.gray,
  [Panel.Sequences]: PanelColor.gray,
  [Panel.Regimens]: PanelColor.gray,
  [Panel.SavedGardens]: PanelColor.navy,
  [Panel.FarmEvents]: PanelColor.yellow,
  [Panel.Zones]: PanelColor.brown,
  [Panel.Controls]: PanelColor.gray,
  [Panel.Sensors]: PanelColor.gray,
  [Panel.Photos]: PanelColor.gray,
  [Panel.Farmware]: PanelColor.gray,
  [Panel.Tools]: PanelColor.gray,
  [Panel.Messages]: PanelColor.gray,
  [Panel.Logs]: PanelColor.gray,
  [Panel.Help]: PanelColor.gray,
  [Panel.Settings]: PanelColor.gray,
  [Panel.Shop]: PanelColor.gray,
};

export const TAB_ICON: Record<Panel, string> = {
  [Panel.Map]: FilePath.icon(Icon.map),
  [Panel.Plants]: FilePath.icon(Icon.plant),
  [Panel.Weeds]: FilePath.icon(Icon.weeds),
  [Panel.Points]: FilePath.icon(Icon.point),
  [Panel.Groups]: FilePath.icon(Icon.groups),
  [Panel.Curves]: FilePath.icon(Icon.curves),
  [Panel.Sequences]: FilePath.icon(Icon.sequence),
  [Panel.Regimens]: FilePath.icon(Icon.regimens),
  [Panel.SavedGardens]: FilePath.icon(Icon.gardens),
  [Panel.FarmEvents]: FilePath.icon(Icon.calendar),
  [Panel.Zones]: FilePath.icon(Icon.zones),
  [Panel.Controls]: FilePath.icon(Icon.controls),
  [Panel.Sensors]: FilePath.icon(Icon.sensors),
  [Panel.Photos]: FilePath.icon(Icon.photos),
  [Panel.Farmware]: FilePath.icon(Icon.farmware),
  [Panel.Tools]: FilePath.icon(Icon.tool),
  [Panel.Messages]: FilePath.icon(Icon.messages),
  [Panel.Logs]: FilePath.icon(Icon.logs),
  [Panel.Help]: FilePath.icon(Icon.help),
  [Panel.Settings]: FilePath.icon(Icon.settings),
  [Panel.Shop]: FilePath.icon(Icon.shop),
};

export const PANEL_SLUG: Record<Panel, string> = {
  [Panel.Map]: "",
  [Panel.Plants]: "plants",
  [Panel.Weeds]: "weeds",
  [Panel.Points]: "points",
  [Panel.Groups]: "groups",
  [Panel.Curves]: "curves",
  [Panel.Sequences]: "sequences",
  [Panel.Regimens]: "regimens",
  [Panel.SavedGardens]: "gardens",
  [Panel.FarmEvents]: "events",
  [Panel.Zones]: "zones",
  [Panel.Controls]: "controls",
  [Panel.Sensors]: "sensors",
  [Panel.Photos]: "photos",
  [Panel.Farmware]: "farmware",
  [Panel.Tools]: "tools",
  [Panel.Messages]: "messages",
  [Panel.Logs]: "logs",
  [Panel.Help]: "help",
  [Panel.Settings]: "settings",
  [Panel.Shop]: "shop",
};

const ALT_PANEL_SLUG: Record<string, string[]> = {
  [PANEL_SLUG[Panel.Tools]]: ["tool-slots"],
  [PANEL_SLUG[Panel.Help]]: ["developer", "tours", "support"],
};

export const PANEL_BY_SLUG: Record<string, Panel> = {};
Object.entries(PANEL_SLUG).map(([panel, slug]: [Panel, string]) =>
  PANEL_BY_SLUG[slug] = panel);

const PANEL_PATH: Partial<Record<Panel, () => string>> = {
  [Panel.Map]: Path.designer,
  [Panel.Sequences]: computeEditorUrlFromState("Sequence"),
  [Panel.Regimens]: computeEditorUrlFromState("Regimen"),
};

export const PANEL_TITLE = (): Record<Panel, string> => ({
  [Panel.Map]: t("Map"),
  [Panel.Plants]: t("Plants"),
  [Panel.Weeds]: t("Weeds"),
  [Panel.Points]: t("Points"),
  [Panel.Groups]: t("Groups"),
  [Panel.Curves]: t("Curves"),
  [Panel.Sequences]: t("Sequences"),
  [Panel.Regimens]: t("Regimens"),
  [Panel.SavedGardens]: t("Gardens"),
  [Panel.FarmEvents]: t("Events"),
  [Panel.Zones]: t("Zones"),
  [Panel.Controls]: t("Controls"),
  [Panel.Sensors]: t("Sensors"),
  [Panel.Photos]: t("Photos"),
  [Panel.Farmware]: t("Farmware"),
  [Panel.Tools]: t("Tools"),
  [Panel.Messages]: t("Messages"),
  [Panel.Logs]: t("Logs"),
  [Panel.Help]: t("Help"),
  [Panel.Settings]: t("Settings"),
  [Panel.Shop]: t("Shop"),
});

export const getCurrentPanel = (): Tabs | undefined => {
  if (getPathArray().join("/") === Path.withApp(Path.designer())) {
    return Panel.Map;
  } else if (Path.getSlug(Path.app()) == "sequences") {
    return Panel.Sequences;
  } else if (Path.getSlug(Path.app()) == "logs") {
    return undefined;
  } else if (Path.getSlug(Path.savedGardens()) == "templates") {
    return Panel.Plants;
  } else {
    const panelMatches = Object.values(PANEL_SLUG).map(slug => {
      const altSlugs = ALT_PANEL_SLUG[slug];
      if ([slug, ...(altSlugs || [])]
        .includes(Path.getSlug(Path.designer()))) {
        return PANEL_BY_SLUG[slug];
      }
    });
    return compact(panelMatches)[0];
  }
};

export const getPanelPath = (panel: Panel) => {
  const defaultLinkFn = () => Path.designer(PANEL_SLUG[panel]);
  const getPath = PANEL_PATH[panel] || defaultLinkFn;
  return getPath();
};

interface NavTabProps {
  panel: Panel;
}

const NavTab = (props: NavTabProps) =>
  <Link id={PANEL_SLUG[props.panel] || "map"}
    to={getPanelPath(props.panel)}
    style={{ flex: 0.3 }}
    className={[
      getCurrentPanel() === props.panel ? "active" : "",
    ].join(" ")}>
    <img width={35} height={30}
      src={TAB_ICON[props.panel]}
      title={PANEL_TITLE()[props.panel]} />
  </Link>;

const displayScrollIndicator = () => {
  const element = document.getElementsByClassName("panel-tabs")[1];
  const mobile = element?.clientWidth <= 500;
  const end = element?.scrollWidth - element?.scrollLeft == element?.clientWidth;
  return mobile && !end;
};

export const showSensors = () => {
  const getWebAppConfigVal = getWebAppConfigValue(store.getState);
  return !getWebAppConfigVal(BooleanSetting.hide_sensors);
};

export const showFarmware = () => {
  const { resources } = store.getState();
  const all = selectAllFarmwareInstallations(resources.index);
  const { firstPartyFarmwareNames } = resources.consumers.farmware;
  const installs = all
    .map(fw => fw.body.package || "")
    .filter(fwName => !firstPartyFarmwareNames.includes(fwName));
  return installs.length > 0;
};

interface DesignerNavTabsProps {
  hidden?: boolean;
}

interface DesignerNavTabsState {
  atEnd?: boolean;
}

export class DesignerNavTabs
  extends React.Component<DesignerNavTabsProps, DesignerNavTabsState> {
  state: DesignerNavTabsState = {};

  componentDidMount = () => this.updateScroll();

  updateScroll = () => this.setState({ atEnd: !displayScrollIndicator() });

  render() {
    const tab = getCurrentPanel();
    const hidden = this.props.hidden ? "hidden" : "";
    const color = TAB_COLOR[tab || Panel.Plants];
    return <div className={`panel-nav ${color}-panel ${hidden}`}>
      {!this.state.atEnd && <div className={"scroll-indicator"} />}
      <div className={"panel-tabs"} onScroll={this.updateScroll}>
        <NavTab panel={Panel.Map} />
        <NavTab panel={Panel.Plants} />
        <NavTab panel={Panel.Weeds} />
        <NavTab panel={Panel.Points} />
        <NavTab panel={Panel.Curves} />
        <NavTab panel={Panel.Sequences} />
        <NavTab panel={Panel.Regimens} />
        <NavTab panel={Panel.FarmEvents} />
        {DevSettings.futureFeaturesEnabled() && <NavTab panel={Panel.Zones} />}
        {showSensors() && <NavTab panel={Panel.Sensors} />}
        <NavTab panel={Panel.Photos} />
        {showFarmware() && <NavTab panel={Panel.Farmware} />}
        <NavTab panel={Panel.Tools} />
        <NavTab panel={Panel.Messages} />
        <NavTab panel={Panel.Help} />
        <NavTab panel={Panel.Settings} />
      </div>
    </div>;
  }
}
