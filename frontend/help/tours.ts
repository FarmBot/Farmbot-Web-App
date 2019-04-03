import { history } from "../history";
import { Step as TourStep } from "react-joyride";

import { TourContent } from "../constants";
import { t } from "../i18next_wrapper";

export enum Tours {
  gettingStarted = "gettingStarted",
  monitoring = "monitoring",
  funStuff = "funStuff",
}

export const tourNames = () => [
  { name: Tours.gettingStarted, description: t("getting started") },
  { name: Tours.monitoring, description: t("see what FarmBot is doing") },
  { name: Tours.funStuff, description: t("find new features") },
];

export const TOUR_STEPS = (): { [x: string]: TourStep[] } => ({
  [Tours.gettingStarted]: [
    {
      target: ".plant-inventory-panel",
      content: TourContent.ADD_PLANTS,
      title: t("Add plants"),
    },
    {
      target: ".tool-list",
      content: TourContent.ADD_TOOLS,
      title: t("Add tools"),
    },
    {
      target: ".toolbay-list",
      content: TourContent.ADD_TOOLS_SLOTS,
      title: t("Add tools to tool bay"),
    },
    {
      target: ".peripherals-widget",
      content: TourContent.ADD_PERIPHERALS,
      title: t("Add peripherals"),
    },
    {
      target: ".sequence-list-panel",
      content: TourContent.ADD_SEQUENCES,
      title: t("Create sequences"),
    },
    {
      target: ".regimen-list-panel",
      content: TourContent.ADD_REGIMENS,
      title: t("Create regimens"),
    },
    {
      target: ".farm-event-panel",
      content: TourContent.ADD_FARM_EVENTS,
      title: t("Create farm events"),
    },
  ],
  [Tours.monitoring]: [
    {
      target: ".move-widget",
      content: TourContent.LOCATION_GRID,
      title: t("View current location"),
    },
    {
      target: ".farm-designer",
      content: TourContent.VIRTUAL_FARMBOT,
      title: t("View current location"),
    },
    {
      target: ".logs-table",
      content: TourContent.LOGS_TABLE,
      title: t("View log messages"),
    },
    {
      target: ".photos",
      content: TourContent.PHOTOS,
      title: t("Take and view photos"),
    },
  ],
  [Tours.funStuff]: [
    {
      target: ".app-settings-widget",
      content: TourContent.APP_SETTINGS,
      title: t("Customize your web app experience"),
    },
  ],
});

export const tourPageNavigation = (nextStepTarget: string | HTMLElement) => {
  switch (nextStepTarget) {
    case ".farm-designer":
      history.push("/app/designer");
      break;
    case ".plant-inventory-panel":
      history.push("/app/designer/plants");
      break;
    case ".farm-event-panel":
      history.push("/app/designer/farm_events");
      break;
    case ".move-widget":
    case ".peripherals-widget":
      history.push("/app/controls");
      break;
    case ".device-widget":
      history.push("/app/device");
      break;
    case ".sequence-list-panel":
      history.push("/app/sequences");
      break;
    case ".regimen-list-panel":
      history.push("/app/regimens");
      break;
    case ".tool-list":
    case ".toolbay-list":
      history.push("/app/tools");
      break;
    case ".photos":
      history.push("/app/farmware");
      break;
    case ".logs-table":
      history.push("/app/logs");
      break;
    case ".app-settings-widget":
      history.push("/app/account");
      break;
  }
};
