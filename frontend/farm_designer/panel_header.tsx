import * as React from "react";

import { getPathArray } from "../history";
import { Link } from "../link";
import { DevSettings } from "../account/dev/dev_support";
import { t } from "../i18next_wrapper";

export enum Panel {
  Map = "Map",
  Plants = "Plants",
  FarmEvents = "FarmEvents",
  SavedGardens = "SavedGardens",
  Move = "Move",
}

type Tabs = keyof typeof Panel;

export const TAB_COLOR: { [key in Panel]: string } = {
  [Panel.Map]: "gray",
  [Panel.Plants]: "green",
  [Panel.FarmEvents]: "magenta",
  [Panel.SavedGardens]: "green",
  [Panel.Move]: "gray",
};

const getCurrentTab = (): Tabs => {
  const pathArray = getPathArray();
  if (pathArray.join("/") === "/app/designer") {
    return Panel.Map;
  } else if (pathArray.includes("events")) {
    return Panel.FarmEvents;
  } else if (pathArray.includes("saved_gardens")) {
    return Panel.SavedGardens;
  } else if (pathArray.includes("move_to")) {
    return Panel.Move;
  } else {
    return Panel.Plants;
  }
};

export function DesignerNavTabs(props: { hidden?: boolean }) {
  const tab = getCurrentTab();
  const hidden = props.hidden ? "hidden" : "";
  return <div className={`panel-nav ${TAB_COLOR[tab]}-panel ${hidden}`}>
    <div className="panel-tabs">
      <Link to="/app/designer"
        className={tab === Panel.Map ? "active" : ""}>
        {t("Map")}
      </Link>
      <Link to="/app/designer/plants"
        className={tab === Panel.Plants ? "active" : ""}>
        {t("Plants")}
      </Link>
      <Link to="/app/designer/events"
        className={tab === Panel.FarmEvents ? "active" : ""}>
        {t("Events")}
      </Link>
      {DevSettings.futureFeaturesEnabled() &&
        <Link to="/app/designer/saved_gardens"
          className={tab === Panel.SavedGardens ? "active" : ""}>
          {t("Gardens")}
        </Link>}
      {DevSettings.futureFeaturesEnabled() &&
        <Link to="/app/designer/move_to"
          className={tab === Panel.Move ? "active" : ""}>
          {t("Move")}
        </Link>}
    </div>
  </div>;
}
