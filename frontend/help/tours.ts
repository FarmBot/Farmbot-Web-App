import { history } from "../history";
import { Step as TourStep } from "react-joyride";
import { TourContent } from "../constants";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../account/dev/dev_support";
import { selectAllTools } from "../resources/selectors";
import { store } from "../redux/store";
import { getFbosConfig } from "../resources/getters";
import {
  getFwHardwareValue, hasUTM
} from "../devices/components/firmware_hardware_support";

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

const hasTools = () =>
  selectAllTools(store.getState().resources.index).length > 0;

const noUTM = () =>
  !hasUTM(getFwHardwareValue(
    getFbosConfig(store.getState().resources.index)));

const toolsStep = () => hasTools()
  ? [{
    target: ".tools",
    content: noUTM()
      ? t(TourContent.ADD_SEED_CONTAINERS)
      : t(TourContent.ADD_TOOLS),
    title: noUTM()
      ? t("Add seed containers")
      : t("Add tools and seed containers"),
  }]
  : [{
    target: ".tools",
    content: noUTM()
      ? t(TourContent.ADD_SEED_CONTAINERS_AND_SLOTS)
      : t(TourContent.ADD_TOOLS_AND_SLOTS),
    title: noUTM()
      ? t("Add seed containers and slots")
      : t("Add tools and slots"),
  }];

const toolSlotsStep = () => hasTools()
  ? [{
    target: ".tool-slots",
    content: t(TourContent.ADD_TOOLS_AND_SLOTS),
    title: t("Add slots"),
  }]
  : [];

export const TOUR_STEPS = (): { [x: string]: TourStep[] } => ({
  [Tours.gettingStarted]: [
    {
      target: ".plant-inventory-panel",
      content: t(TourContent.ADD_PLANTS),
      title: t("Add plants"),
    },
    ...(DevSettings.futureFeaturesEnabled() ? [{
      target: ".tool-list",
      content: t(TourContent.ADD_TOOLS),
      title: t("Add tools and seed containers"),
    }] : toolsStep()),
    ...(DevSettings.futureFeaturesEnabled() ? [{
      target: ".toolbay-list",
      content: t(TourContent.ADD_TOOLS_SLOTS),
      title: t("Add tools to tool bay"),
    }] : toolSlotsStep()),
    {
      target: ".peripherals-widget",
      content: t(TourContent.ADD_PERIPHERALS),
      title: t("Add peripherals"),
    },
    {
      target: ".sequence-list-panel",
      content: t(TourContent.ADD_SEQUENCES),
      title: t("Create sequences"),
    },
    {
      target: ".regimen-list-panel",
      content: t(TourContent.ADD_REGIMENS),
      title: t("Create regimens"),
    },
    {
      target: ".farm-event-panel",
      content: t(TourContent.ADD_FARM_EVENTS),
      title: t("Create events"),
    },
  ],
  [Tours.monitoring]: [
    {
      target: ".move-widget",
      content: t(TourContent.LOCATION_GRID),
      title: t("View current location"),
    },
    {
      target: ".farm-designer",
      content: t(TourContent.VIRTUAL_FARMBOT),
      title: t("View current location"),
    },
    {
      target: ".logs-table",
      content: t(TourContent.LOGS_TABLE),
      title: t("View log messages"),
    },
    {
      target: ".photos",
      content: t(TourContent.PHOTOS),
      title: t("Take and view photos"),
    },
  ],
  [Tours.funStuff]: [
    {
      target: ".app-settings-widget",
      content: t(TourContent.APP_SETTINGS),
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
      history.push("/app/designer/events");
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
    case ".tools":
    case ".tool-slots":
      history.push("/app/designer/tools");
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
