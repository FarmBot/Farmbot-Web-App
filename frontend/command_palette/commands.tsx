import React from "react";
import { isNumber, startCase } from "lodash";
import { NavigateFunction } from "react-router";
import {
  ALLOWED_PIN_MODES, ANALOG, McuParamName, uuid, Xyz,
} from "farmbot";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
  NumberConfigKey as WebAppNumberConfigKey,
  StringConfigKey as WebAppStringConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import {
  BooleanConfigKey as FbosBooleanConfigKey,
  NumberConfigKey as FbosNumberConfigKey,
  StringConfigKey as FbosStringConfigKey,
} from "farmbot/dist/resources/configs/fbos";
import { Axis } from "../devices/interfaces";
import {
  ControlsState, Everything, PopupsState, SettingsPanelState,
} from "../interfaces";
import { Command, CommandAction } from "./interfaces";
import { t } from "../i18next_wrapper";
import {
  Actions, CAMERA_FOLLOW_PERSPECTIVE_REQUIRED, Content, DeviceSetting,
  ToolTips, UTM_FOLLOW_PERSPECTIVE_REQUIRED,
} from "../constants";
import {
  Panel, PANEL_SLUG, PANEL_TITLE, getPanelPath, setPanelOpen,
  TAB_ICON,
} from "../farm_designer/panel_header";
import { getLinks } from "../nav/nav_links";
import { FilePath, Icon, PAGE_SLUGS, Path } from "../internal_urls";
import {
  BooleanSetting, NumericSetting,
} from "../session_keys";
import {
  getWebAppConfigValueFromResources, setWebAppConfigValue,
} from "../config_storage/actions";
import {
  emergencyLock, emergencyUnlock, execSequence, findAxisLength, findHome,
  flashFirmware, moveAbsolute, moveRelative, moveToHome, pinToggle, powerOff,
  readPin, reboot, restartFirmware, setHome, sync, takePhoto,
  writePin, updateConfig, updateMCU,
} from "../devices/actions";
import { isBotOnlineFromState, forceOnline } from "../devices/must_be_online";
import {
  selectAllCrops, selectAllPeripherals, selectAllPlantPointers,
  selectAllGenericPointers, selectAllWeedPointers, selectAllSequences,
  selectAllRegimens, selectAllSensors, selectAllToolSlotPointers,
  selectAllTools, selectAllCurves, selectAllPointGroups,
  selectAllSavedGardens, selectAllSceneObjects, selectAllFarmwareEnvs,
  maybeGetDevice,
} from "../resources/selectors";
import {
  CROP_SLUGS, findCropIcon, findCropMetadata,
} from "../crops/metadata";
import { visualizeInMap } from "../farm_designer/map/sequence_visualization";
import { copySequence } from "../sequences/actions";
import { addNewSequenceToFolder } from "../folders/actions";
import { addRegimen } from "../regimens/list/add_regimen";
import { getMaxInputFromIntSize, urlFriendly } from "../util";
import { ToggleButton } from "../ui";
import { getFbosConfig, getFirmwareConfig } from "../resources/getters";
import { toggleHotkeyHelpOverlay } from "../hotkeys";
import { isMobile } from "../screen_size";
import { ExternalUrl } from "../external_urls";
import {
  CurveShape, CurveType, getTemplateScale, getTemplateShape,
  getTemplateShapeData, TemplateOption,
} from "../curves/templates";
import { scaleData } from "../curves/data_actions";
import * as crud from "../api/crud";
import { info } from "../toast/toast";
import { GetState } from "../redux/interfaces";
import {
  isBooleanMcuParam,
} from "../settings/hardware_settings/firmware_config_metadata";
import { getToolVerificationPin } from "../tools/tool_verification";
import { copyRegimen } from "../regimens/copy_regimen";
import { farmEventSchedulePath } from "../farm_events/navigation";
import { validBotLocationData } from "../util/location";
import { logout } from "../logout";
import {
  applyGarden, newSavedGarden, snapshotGarden,
} from "../saved_gardens/actions";
import { PhotosPanelState } from "../photos/interfaces";
import { DevSettings } from "../settings/dev/dev_support";
import { clearRecentCommands } from "./recents";
import {
  findOrCreate3DConfigFunction, get3DConfigValueFunction,
  GROUND_TEXTURE_NUM_FROM_SCENE_NUM, SCENE_DDI_LIST, SCENES, TEXTURE_DDIS,
} from "../settings/three_d_settings";
import { toggleSectionAxis } from "../farm_designer/three_d_section";
import { unselectPlant } from "../farm_designer/map/actions";
import { getAxisOrderOptions } from
  "../sequences/step_tiles/tile_computed_move/axis_order";
import { createPlant } from
  "../farm_designer/map/layers/plants/plant_actions";
import { round } from "../farm_designer/map/util";
import { DEFAULT_PLANT_RADIUS } from "../farm_designer/plant";
import {
  DEFAULT_POINT_GRID_RADIUS,
  DEFAULT_POINT_GRID_SPACING,
} from "../plants/grid/grid_math";
import {
  calibrateCamera, detectWeeds, measureSoilHeight,
} from "../photos/actions";
import {
  DIRECT_COMMAND_HELP, FBOS_SETTINGS, FIRMWARE_SETTINGS,
  FirmwareSettingMetadata, PaletteSettingMetadata,
  SETTINGS_ITEMS, THREE_D_DEFAULTS, THREE_D_SETTINGS, WEB_APP_BOOLEAN_SETTINGS,
  WEB_APP_NUMBER_SETTINGS, WEB_APP_STRING_SETTINGS,
} from "../settings/setting_metadata";
import {
  hasEncoders, isTMCBoard, validFirmwareHardware,
} from "../settings/firmware/firmware_hardware_support";
import {
  calculateScale, motorCurrentMaToPercent, motorCurrentPercentToMa,
} from "../settings/hardware_settings/motors";
import {
  getDefaultFwConfigValue,
} from "../settings/hardware_settings/default_values";
import {
  getDefaultConfigValue,
} from "../settings/fbos_settings/default_values";
import { resetVirtualTrail } from
  "../farm_designer/map/layers/farmbot/bot_trail";
import { linkToSetting } from "../settings/maybe_highlight";
import { Config } from "../three_d_garden/config";
import { disableBugs } from
  "../farm_designer/map/easter_eggs/bugs";

interface BuildCommandProps {
  state: Everything;
  dispatch: Function;
  navigate: NavigateFunction;
}

const localized = (english: string) => ({
  name: t(english),
  englishName: english,
});

const settingText = (metadata: PaletteSettingMetadata) => {
  const englishName = metadata.englishName || metadata.label;
  const translatedLabel = t(metadata.label);
  let translatedName = translatedLabel;
  if (metadata.englishName?.startsWith(metadata.label)) {
    translatedName = metadata.englishName.replace(
      metadata.label, translatedLabel);
  } else if (translatedLabel == metadata.label) {
    translatedName = englishName;
  }
  return {
    name: translatedName,
    englishName,
  };
};

const settingHelp = (text: string | undefined, enableMarkdown = false) =>
  text ? { help: { text, enableMarkdown } } : {};

const sectionCommandText = (
  englishName: string,
  name = t(englishName),
  aliases: string[] = [],
) => {
  const verbs = ["Open", "Close", "Toggle", "Navigate to", "Go to"];
  const verbAliases = verbs.flatMap(verb => [
    `${verb} ${englishName}`,
    `${t(verb)} ${name}`,
  ]);
  return {
    name,
    englishName,
    aliases: Array.from(new Set([...verbAliases, ...aliases])),
  };
};

const combinedPanelCommandText = (
  englishName: string,
  name = t(englishName),
) => {
  const verbs = ["Close", "Toggle", "Navigate to", "Go to"];
  const aliases = verbs.flatMap(verb => [
    `${verb} ${englishName}`,
    `${t(verb)} ${name}`,
  ]);
  return { name, englishName, aliases };
};

const clearGridPlanting = (props: BuildCommandProps) => {
  const token = props.state.resources.consumers.farm_designer
    .gridPlanting?.token;
  token && props.dispatch({
    type: Actions.CLEAR_GRID_PLANTING,
    payload: token,
  });
};

const openPanel = (props: BuildCommandProps, panel: Panel) => {
  clearGridPlanting(props);
  props.dispatch(setPanelOpen(true));
  props.navigate(getPanelPath(panel));
};

const openAddPage = (props: BuildCommandProps, path: string) => {
  clearGridPlanting(props);
  props.dispatch(setPanelOpen(true));
  props.navigate(path);
};

const panelAction = (
  props: BuildCommandProps,
  panel: Panel,
): CommandAction => ({
  id: "open-panel",
  ...localized("Open Panel"),
  aliases: [
    `Open ${panel}`,
    `${t("Open")} ${PANEL_TITLE()[panel]}`,
    "show panel",
    "navigation",
  ],
  execute: () => openPanel(props, panel),
});

const COMBINED_PANELS = new Set([
  Panel.Plants,
  Panel.Weeds,
  Panel.Points,
  Panel.Curves,
  Panel.Sequences,
  Panel.SceneObjects,
  Panel.Regimens,
  Panel.FarmEvents,
  Panel.Sensors,
  Panel.Photos,
  Panel.Tools,
  Panel.Help,
]);

const panelCommands = (props: BuildCommandProps): Command[] => {
  const genericCommand: Command = {
    id: "panel",
    name: `${t("Close")} ${t("Panel")}`,
    englishName: "Close Panel",
    aliases: [
      `${t("Hide")} ${t("Panel")}`,
      "hide panel",
      "sidebar",
      "drawer",
      "navigation",
    ],
    group: "navigation",
    icon: "step-backward",
    execute: () => props.dispatch(setPanelOpen(false)),
  };
  const panels = [Panel.Map, ...getLinks()]
    .filter(panel => !COMBINED_PANELS.has(panel));
  const specificCommands = panels.map(panel => {
    const title = PANEL_TITLE()[panel];
    const isMap = panel == Panel.Map;
    const open = () => {
      if (isMap) {
        props.dispatch(setPanelOpen(false));
        props.navigate(Path.designer());
      } else {
        openPanel(props, panel);
      }
    };
    return {
      id: `panel:${PANEL_SLUG[panel] || "map"}`,
      ...sectionCommandText(panel, title,
        ["show", "hide", "navigation", "sidebar"]),
      group: "navigation" as const,
      imageIcon: TAB_ICON[panel],
      themeAwareImageIcon: true,
      execute: open,
    };
  });
  return [genericCommand, ...specificCommands];
};

const externalAction = (
  id: string,
  title: string,
  url: string,
): CommandAction => ({
  id,
  ...localized(title),
  href: url,
  aliases: ["website", "external link"],
  execute: () => {
    const newTab = window.open(url, "_blank");
    if (newTab) {
      newTab.opener = undefined;
    } else {
      window.location.assign(url);
    }
  },
});

const shopCommand = (): Command => {
  const actions = [
    externalAction("buy-parts", "Buy Parts", ExternalUrl.Store.buyParts),
    externalAction("full-kits", "Full Kits", ExternalUrl.Store.fullKits),
    externalAction("home", "Home", ExternalUrl.Store.home),
    externalAction("blog", "Blog", ExternalUrl.Store.blog),
  ];
  return {
    id: "shop",
    ...localized("Shop"),
    aliases: ["store", "farm.bot", "website", "buy"],
    group: "navigation",
    imageIcon: TAB_ICON[Panel.Shop],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  };
};

const followFarmBotCommand = (): Command => {
  const actions = [
    externalAction(
      "newsletter", "Subscribe to our Newsletter",
      ExternalUrl.Follow.newsletter),
    externalAction("blog", "Blog", ExternalUrl.Store.blog),
  ];
  return {
    id: "follow-farmbot",
    ...localized("Follow FarmBot"),
    aliases: ["newsletter", "subscribe", "blog"],
    group: "navigation",
    imageIcon: FilePath.image("favicon", "png"),
    imageIconClass: "farmbot-favicon",
    actions,
    execute: actions[0].execute,
  };
};

const logoutCommand = (): Command => ({
  id: "logout",
  ...localized("Log out"),
  aliases: ["logout", "sign out", "end session"],
  group: "navigation",
  icon: "sign-out",
  execute: logout(),
});

const popupCommands = (props: BuildCommandProps): Command[] => {
  type PopupCommandKey = Exclude<keyof PopupsState, "timeTravel">;
  const names: Partial<Record<PopupCommandKey, string>> = {
    jobs: "Jobs and Logs",
  };
  const icons: Partial<Record<PopupCommandKey, string>> = {
    connectivity: "wifi",
    jobs: "history",
  };
  return (Object.keys(names) as PopupCommandKey[]).map(key => ({
    id: `popup:${key}`,
    ...sectionCommandText(names[key] || "", t(names[key] || ""),
      ["popup", "popover", "panel", "show", "hide",
        ...(key == "jobs" ? ["jobs"] : [])]),
    group: "navigation" as const,
    icon: icons[key],
    imageIcon: key == "controls" ? TAB_ICON[Panel.Controls] : undefined,
    themeAwareImageIcon: key == "controls",
    execute: () => props.dispatch({
      type: Actions.TOGGLE_POPUP,
      payload: key,
    }),
  }));
};

const timeTravelCommand = (props: BuildCommandProps): Command => {
  const setTime = (payload: string | undefined) => () => props.dispatch({
    type: Actions.SET_3D_TIME,
    payload,
  });
  const actions: CommandAction[] = [
    {
      id: "now",
      ...localized("Now"),
      aliases: ["current time", "reset time"],
      execute: setTime(undefined),
    },
    {
      id: "noon",
      ...localized("Noon"),
      aliases: ["12:00", "midday"],
      execute: setTime("12:00"),
    },
    {
      id: "midnight",
      ...localized("Midnight"),
      aliases: ["00:00", "night"],
      execute: setTime("00:00"),
    },
    {
      id: "open",
      ...localized("Open"),
      aliases: ["popup", "show"],
      execute: () => props.dispatch({
        type: Actions.OPEN_POPUP,
        payload: "timeTravel",
      }),
    },
  ];
  return {
    id: "time-travel",
    ...localized("Time travel"),
    aliases: ["sun", "3D time", "clock"],
    group: "navigation",
    icon: "clock-o",
    actions,
    execute: actions[0].execute,
  };
};

const deleteAllLogsCommand = (): Command => ({
  id: "logs:delete-all",
  ...localized("Delete all logs"),
  aliases: ["clear logs", "remove logs", "destroy logs"],
  group: "resources",
  imageIcon: TAB_ICON[Panel.Logs],
  themeAwareImageIcon: true,
  execute: () => {
    if (!confirm(t(Content.DELETE_ALL_LOGS_CONFIRMATION))) { return false; }
    return crud.destroyAll("Log", true)
      .then(() => location.assign(window.location.origin));
  },
});

const clearRecentsCommand = (): Command => ({
  id: "recents:clear",
  ...localized("Clear Recent Commands"),
  aliases: [
    "clear recent commands", "delete history", "reset command history",
  ],
  group: "settings",
  icon: "history",
  recordRecent: false,
  execute: clearRecentCommands,
});

const controlsCommands = (props: BuildCommandProps): Command[] => {
  const names: Record<keyof ControlsState, string> = {
    move: "Move",
    peripherals: "Peripherals",
    webcams: "Webcams",
  };
  const actions: CommandAction[] = [{
    id: "open-panel",
    ...localized("Open Panel"),
    aliases: ["Open Controls", "popup", "show"],
    execute: () => props.dispatch({
      type: Actions.OPEN_POPUP,
      payload: "controls",
    }),
  }, ...(Object.keys(names) as (keyof ControlsState)[]).map(key => ({
    id: key,
    ...localized(names[key]),
    aliases: ["control", "popup", "tab", "show", "hide"],
    execute: () => {
      const selected = props.state.app.controls[key];
      if (props.state.app.popups.controls && selected) {
        props.dispatch({ type: Actions.TOGGLE_POPUP, payload: "controls" });
      } else {
        props.dispatch({ type: Actions.OPEN_POPUP, payload: "controls" });
        props.dispatch({ type: Actions.SET_CONTROLS_PANEL_OPTION, payload: key });
      }
    },
  }))];
  return [{
    id: "popup:controls",
    ...combinedPanelCommandText("Controls"),
    aliases: ["control", "popup", "panel", "show", "hide"],
    group: "controls",
    imageIcon: TAB_ICON[Panel.Controls],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  }];
};

const inventorySectionCommands = (props: BuildCommandProps): Command[] => {
  const sectionAction = (
    panel: Panel,
    action: string,
    section: string,
    title = startCase(section),
  ): CommandAction => ({
    id: section,
    ...localized(title),
    aliases: ["accordion", "expand", "collapse", "show", "hide"],
    execute: () => {
      props.dispatch({ type: action, payload: section });
      openPanel(props, panel);
    },
  });
  const basicCommand = (
    panel: Panel,
    actions: CommandAction[],
  ): Command => ({
    id: `panel:${PANEL_SLUG[panel]}`,
    ...combinedPanelCommandText(panel, PANEL_TITLE()[panel]),
    group: "navigation",
    imageIcon: TAB_ICON[panel],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  });
  const point = props.state.resources.consumers.farm_designer.drawnPoint || {
    name: t("Created Point"),
    cx: undefined,
    cy: undefined,
    z: 0,
    r: 0,
    color: "green",
    at_soil_level: false,
  };
  const addPointGrid = () => {
    openAddPage(props, Path.points("add"));
    const getValue = getWebAppConfigValueFromResources(
      props.state.resources.index);
    if (!getValue(BooleanSetting.three_d_garden)) {
      props.dispatch({
        type: Actions.SET_LEGACY_POINT_GRID,
        payload: true,
      });
      return;
    }
    const token = uuid();
    props.dispatch({
      type: Actions.SET_DRAWN_POINT_DATA,
      payload: point,
    });
    props.dispatch({
      type: Actions.SET_GRID_PLANTING,
      payload: {
        token,
        gridId: token,
        gridType: "point",
        itemName: point.name,
        defaultSpacing: DEFAULT_POINT_GRID_SPACING,
        radius: DEFAULT_POINT_GRID_RADIUS,
        z: point.z,
        meta: {
          color: point.color,
          at_soil_level: "" + point.at_soil_level,
        },
      },
    });
  };
  const plants = [
    {
      id: "add-new",
      ...localized("Add New"),
      execute: () => openAddPage(props, Path.cropSearch()),
    },
    panelAction(props, Panel.Plants),
    sectionAction(
      Panel.Plants, Actions.TOGGLE_PLANTS_PANEL_OPTION, "plants"),
    sectionAction(
      Panel.Plants, Actions.TOGGLE_PLANTS_PANEL_OPTION, "groups"),
    sectionAction(
      Panel.Plants, Actions.TOGGLE_PLANTS_PANEL_OPTION,
      "savedGardens", "Gardens"),
  ];
  const weeds = [
    {
      id: "add-new",
      ...localized("Add New"),
      execute: () => openAddPage(props, Path.weeds("add")),
    },
    panelAction(props, Panel.Weeds),
    ...Object.keys(props.state.app.weedsPanelState).map(section =>
      sectionAction(
        Panel.Weeds, Actions.TOGGLE_WEEDS_PANEL_OPTION, section)),
  ];
  const points = [
    {
      id: "add-new",
      ...localized("Add New"),
      execute: () => openAddPage(props, Path.points("add")),
    },
    {
      id: "add-grid",
      ...localized("Add Grid"),
      execute: addPointGrid,
    },
    panelAction(props, Panel.Points),
    ...Object.keys(props.state.app.pointsPanelState).map(section =>
      sectionAction(
        Panel.Points, Actions.TOGGLE_POINTS_PANEL_OPTION, section)),
  ];
  const curveAdds = (
    [CurveType.water, CurveType.spread, CurveType.height] as const
  ).map(type => ({
    id: `add-${type}`,
    ...localized(`Add ${startCase(type)}`),
    execute: () => {
      props.dispatch(setPanelOpen(true));
      return props.dispatch(createCurve(type, props.navigate));
    },
  }));
  const curves = [
    ...curveAdds,
    panelAction(props, Panel.Curves),
  ];
  const sequences = [
    {
      id: "add-new",
      ...localized("Add New"),
      execute: () => addNewSequenceToFolder(props.navigate),
    },
    panelAction(props, Panel.Sequences),
    ...Object.keys(props.state.app.sequencesPanelState).map(section =>
      sectionAction(
        Panel.Sequences, Actions.TOGGLE_SEQUENCES_PANEL_OPTION, section)),
  ];
  return [
    basicCommand(Panel.Plants, plants),
    basicCommand(Panel.Weeds, weeds),
    basicCommand(Panel.Points, points),
    basicCommand(Panel.Curves, curves),
    basicCommand(Panel.Sequences, sequences),
  ];
};

type PhotoTopLevelSection = Exclude<keyof PhotosPanelState,
  "calibrationPP" | "detectionPP">;

const photoSectionCommands = (props: BuildCommandProps): Command[] => {
  const sections: [PhotoTopLevelSection, string][] = [
    ["filter", "Filters"],
    ["camera", "Settings"],
    ["calibration", "Calibration"],
    ["detection", "Weed detection"],
    ["measure", "Measure soil height"],
  ];
  const actions: CommandAction[] = [
    panelAction(props, Panel.Photos),
    ...sections.map(([section, title]) => ({
      id: section,
      ...localized(title),
      aliases: ["photos", "accordion", "expand", "show"],
      execute: () => {
        props.dispatch({
          type: Actions.BULK_TOGGLE_PHOTOS_PANEL,
          payload: false,
        });
        props.dispatch({
          type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
          payload: section,
        });
        openPanel(props, Panel.Photos);
      },
    })),
  ];
  return [{
    id: "panel:photos",
    ...combinedPanelCommandText("Photos"),
    group: "navigation",
    imageIcon: TAB_ICON[Panel.Photos],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  }];
};

const metricSectionCommands = (props: BuildCommandProps): Command[] => {
  const actions: CommandAction[] = [{
    id: "open-panel",
    ...localized("Open Panel"),
    execute: () => props.dispatch({
      type: Actions.OPEN_POPUP,
      payload: "connectivity",
    }),
  }, ...(["realtime", "network", "history"] as const).map(section => ({
    id: section,
    ...localized(startCase(section)),
    aliases: ["network", "metrics", "quality", "history"],
    execute: () => {
      if (props.state.app.popups.connectivity
        && props.state.app.metricPanelState[section]) {
        props.dispatch({
          type: Actions.TOGGLE_POPUP,
          payload: "connectivity",
        });
      } else {
        props.dispatch({
          type: Actions.OPEN_POPUP,
          payload: "connectivity",
        });
        props.dispatch({
          type: Actions.SET_METRIC_PANEL_OPTION,
          payload: section,
        });
      }
    },
  }))];
  return [{
    id: "popup:connectivity",
    ...combinedPanelCommandText("Connectivity"),
    group: "navigation",
    icon: "wifi",
    actions,
    execute: actions[0].execute,
  }];
};

const sectionViewCommand = (props: BuildCommandProps): Command => {
  const designer = props.state.resources.consumers.farm_designer;
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  const unavailable = getValue(BooleanSetting.three_d_garden)
    ? undefined
    : t("Enable the 3D Garden setting first.");
  const actions: CommandAction[] = [
    {
      id: "toggle",
      ...localized("Toggle On/Off"),
      execute: () => props.dispatch({
        type: Actions.SET_3D_SECTION_OPEN,
        payload: !designer.threeDSectionOpen,
      }),
    },
    {
      id: "axis",
      ...localized("Switch Axis"),
      execute: () => toggleSectionAxis(designer, {
        x: Number(getValue(NumericSetting.map_size_x))
          || designer.threeDSectionWidth,
        y: Number(getValue(NumericSetting.map_size_y))
          || designer.threeDSectionWidth,
      }, props.dispatch),
    },
    {
      id: "follow-bot",
      ...localized("Follow Bot"),
      execute: () => props.dispatch({
        type: Actions.SET_3D_SECTION_FOLLOW_BOT,
        payload: !designer.threeDSectionFollowBot,
      }),
    },
    {
      id: "clip-all",
      ...localized("Clip All"),
      execute: () => props.dispatch({
        type: Actions.SET_3D_SECTION_CLIP_ALL,
        payload: !designer.threeDSectionClipAll,
      }),
    },
  ];
  return {
    id: "section-view",
    ...localized("Section View"),
    aliases: [
      "3D section", "Profile view", "section", "clipping", "cross section",
    ],
    group: "map",
    icon: "scissors",
    unavailable,
    actions,
    execute: actions[0].execute,
  };
};

const sectionViewCommands = (props: BuildCommandProps): Command[] =>
  [sectionViewCommand(props)];

const selectionCommand = (props: BuildCommandProps): Command => {
  const index = props.state.resources.index;
  const open = () => {
    props.dispatch(setPanelOpen(true));
    props.navigate(Path.plants("select"));
  };
  const select = (
    pointerType: "Plant" | "Weed" | "GenericPointer",
    uuids: string[],
  ) => () => {
    props.dispatch({
      type: Actions.SET_SELECTION_POINT_TYPE,
      payload: [pointerType],
    });
    props.dispatch({ type: Actions.SELECT_POINT, payload: uuids });
    open();
  };
  const none = () => {
    unselectPlant(props.dispatch)();
    const designer = props.state.resources.consumers.farm_designer;
    const selectionPanelOpen = designer.panelOpen
      && Path.getSlug(Path.plants()) == "select";
    if (selectionPanelOpen) {
      props.dispatch(setPanelOpen(false));
      props.navigate(Path.designer());
    }
  };
  const actions: CommandAction[] = [
    {
      id: "all-plants",
      ...localized("All Plants"),
      aliases: ["select every plant"],
      execute: select("Plant",
        selectAllPlantPointers(index).map(point => point.uuid)),
    },
    {
      id: "all-weeds",
      ...localized("All Weeds"),
      aliases: ["select every weed"],
      execute: select("Weed",
        selectAllWeedPointers(index).map(point => point.uuid)),
    },
    {
      id: "all-points",
      ...localized("All Points"),
      aliases: ["select every point"],
      execute: select("GenericPointer",
        selectAllGenericPointers(index).map(point => point.uuid)),
    },
    {
      id: "custom",
      ...localized("Custom"),
      aliases: ["box select", "manual selection"],
      execute: open,
    },
    {
      id: "none",
      ...localized("None"),
      aliases: ["deselect all", "clear selection"],
      execute: none,
    },
  ];
  return {
    id: "select",
    ...localized("Select"),
    aliases: ["selection", "box select", "deselect"],
    group: "map",
    icon: "mouse-pointer",
    actions,
    execute: actions[0].execute,
  };
};

const settingsSectionCommands = (props: BuildCommandProps): Command[] => {
  const sections: {
    key: keyof SettingsPanelState;
    title: DeviceSetting;
  }[] = [
    { key: "farmbot_settings", title: DeviceSetting.farmbotSettings },
    { key: "power_and_reset", title: DeviceSetting.powerAndReset },
    { key: "axis_settings", title: DeviceSetting.axisSettings },
    { key: "motors", title: DeviceSetting.motors },
    {
      key: "encoders_or_stall_detection",
      title: DeviceSetting.encoders,
    },
    { key: "limit_switches", title: DeviceSetting.limitSwitchSettings },
    { key: "error_handling", title: DeviceSetting.errorHandling },
    { key: "pin_bindings", title: DeviceSetting.pinBindings },
    { key: "pin_guard", title: DeviceSetting.pinGuard },
    {
      key: "parameter_management",
      title: DeviceSetting.parameterManagement,
    },
    { key: "custom_settings", title: DeviceSetting.customSettings },
    { key: "farm_designer", title: DeviceSetting.farmDesigner },
    { key: "three_d", title: DeviceSetting.threeDGarden },
    { key: "account", title: DeviceSetting.accountSettings },
    { key: "other_settings", title: DeviceSetting.otherSettings },
  ];
  return sections.map(({ key, title }) => ({
    id: `settings-section:${key}`,
    ...sectionCommandText(`Settings > ${title}`,
      `${t("Settings")} > ${t(title)}`,
      ["accordion", "expand", "collapse"]),
    group: "settings" as const,
    imageIcon: TAB_ICON[Panel.Settings],
    themeAwareImageIcon: true,
    execute: () => {
      props.dispatch({
        type: Actions.TOGGLE_SETTINGS_PANEL_OPTION,
        payload: key,
      });
      props.dispatch(setPanelOpen(true));
      props.navigate(Path.settings(urlFriendly(title).toLowerCase()));
    },
  }));
};

const settingsItemCommands = (props: BuildCommandProps): Command[] => {
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  const online = isBotOnlineFromState(props.state.bot) || forceOnline();
  const fbosValues = getFbosConfig(props.state.resources.index)?.body
    ?? props.state.bot.hardware.configuration;
  const firmwareHardware = validFirmwareHardware(
    fbosValues.firmware_hardware);
  return SETTINGS_ITEMS
    .filter(item => item.id != "change-ownership"
      || (online && getValue(BooleanSetting.show_advanced_settings)))
    .map(item => {
      let help = item.help;
      if (item.id == "soft-reset" && help) {
        help = `${help} ${t(Content.OS_RESET_WARNING, {
          resetMethod: t("Soft"),
        })}`;
      }
      if (item.id == "hard-reset" && help) {
        help = `${help} ${t(Content.OS_RESET_WARNING, {
          resetMethod: t("Hard"),
        })}`;
      }
      const openSettings = () => {
        props.dispatch(setPanelOpen(true));
        props.navigate(linkToSetting(item.label));
      };
      const flash = item.id == "flash-firmware" && firmwareHardware
        ? withConfirmation(
          "Are you sure you want to flash the firmware?",
          () => flashFirmware(firmwareHardware),
        )
        : undefined;
      const execute = flash || openSettings;
      let unavailable: string | undefined;
      if (item.id == "flash-firmware") {
        if (!online) {
          unavailable = t("FarmBot is offline.");
        } else if (!firmwareHardware) {
          unavailable = t("Select a firmware type first.");
        }
      }
      return {
        id: `settings-item:${item.id}`,
        ...localized(item.label),
        ...settingHelp(help),
        aliases: [
          `Open ${item.label}`,
          `Settings ${item.label}`,
          "setting", "configure", "edit",
        ],
        group: "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        unavailable,
        actions: flash
          ? [{
            id: "flash",
            ...localized("Flash"),
            execute: flash,
          }]
          : undefined,
        execute,
      };
    });
};

const setupWizardCommand = (props: BuildCommandProps): Command => {
  const setupName = t("Setup");
  return {
    id: "setup-wizard",
    name: setupName,
    englishName: "Setup",
    aliases: [
      "Open Setup",
      `${t("Open")} ${setupName}`,
      "Navigate to Setup",
      `${t("Navigate to")} ${setupName}`,
      "Go to Setup",
      `${t("Go to")} ${setupName}`,
      "setup",
      "wizard",
      "setup wizard",
      t("Setup wizard"),
    ],
    group: "navigation",
    icon: "magic",
    execute: () => {
      props.dispatch(setPanelOpen(true));
      props.navigate(Path.setup());
    },
  };
};

const helpCommands = (props: BuildCommandProps): Command[] => {
  const pageAction = (page: {
    id: string;
    title: string;
    path: string;
  }): CommandAction => ({
    id: page.id,
    ...localized(page.title),
    aliases: ["help", "docs", "documentation", "support"],
    execute: () => {
      props.dispatch(setPanelOpen(true));
      props.navigate(page.path);
    },
  });
  const documentationActions = [
    {
      id: "software", title: "Software", path: Path.help(),
    },
    {
      id: "developer", title: "Developer", path: Path.developer(),
    },
    {
      id: "genesis", title: "Genesis", path: Path.designer("genesis"),
    },
    {
      id: "express", title: "Express", path: Path.designer("express"),
    },
    {
      id: "education", title: "Education", path: Path.designer("education"),
    },
    {
      id: "business", title: "Business", path: Path.designer("business"),
    },
  ].map(pageAction);
  const helpActions: CommandAction[] = [
    pageAction({
      id: "support", title: "Get Help", path: Path.support(),
    }),
    pageAction({
      id: "tours", title: "Take a Tour", path: Path.tours(),
    }),
  ];
  if (!isMobile()) {
    helpActions.push({
      id: "hotkeys",
      ...localized("Hotkeys"),
      aliases: ["keyboard shortcuts", "shortcut help", "key bindings"],
      execute: toggleHotkeyHelpOverlay,
    });
  }
  return [
    {
      id: "documentation",
      ...localized("Docs"),
      aliases: ["Documentation", "software", "developer"],
      group: "navigation",
      imageIcon: FilePath.icon(Icon.documentation),
      themeAwareImageIcon: true,
      actions: documentationActions,
      execute: documentationActions[0].execute,
    },
    {
      id: "panel:help",
      ...localized("Help"),
      aliases: ["support", "tour", "hotkeys"],
      group: "navigation",
      imageIcon: TAB_ICON[Panel.Help],
      themeAwareImageIcon: true,
      actions: helpActions,
      execute: helpActions[0].execute,
    },
  ];
};

const boolSettingConfirmations: Partial<Record<string, string>> = {
  [BooleanSetting.discard_unsaved]: Content.DISCARD_UNSAVED_CHANGES_CONFIRM,
  [BooleanSetting.discard_unsaved_sequences]:
    Content.DISCARD_UNSAVED_SEQUENCE_CHANGES_CONFIRM,
  [BooleanSetting.disable_emergency_unlock_confirmation]:
    Content.CONFIRM_EMERGENCY_UNLOCK_CONFIRM_DISABLE,
};

const toggleAccessory = (
  current: boolean,
  disabled = false,
) => (run: () => void, recentValue?: boolean) =>
  <ToggleButton
    toggleValue={recentValue ?? current}
    disabled={disabled}
    toggleAction={event => {
      event.stopPropagation();
      run();
    }}
    customText={{ textFalse: t("off"), textTrue: t("on") }} />;

const laserCommand = (props: BuildCommandProps): Command => {
  const index = props.state.resources.index;
  const envs = selectAllFarmwareEnvs(index);
  const enabled = !!get3DConfigValueFunction(envs)("laser");
  const unavailable = getWebAppConfigValueFromResources(index)(
    BooleanSetting.three_d_garden)
    ? undefined
    : t("Enable the 3D Garden setting first.");
  const execute = () => findOrCreate3DConfigFunction(
    props.dispatch, envs)("laser", enabled ? "0" : "1");
  return {
    id: "laser",
    ...localized("Laser"),
    aliases: [
      "3D", "beam", "light", "Toggle Laser", "Laser on", "Laser off",
    ],
    group: "map",
    icon: "crosshairs",
    unavailable,
    execute,
    toggleValue: enabled,
    accessory: toggleAccessory(enabled, !!unavailable),
  };
};

const mapViewCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const getValue = getWebAppConfigValueFromResources(index);
  const is3D = !!getValue(BooleanSetting.three_d_garden);
  const amplifyZ = props.state.resources.consumers.farm_designer
    .threeDExaggeratedZ;
  const showAreas = !!getValue(BooleanSetting.show_zones);
  const unavailable3D = is3D
    ? undefined
    : t("Enable the 3D Garden setting first.");
  const mapCommand = (command: Command): Command => ({
    imageIcon: TAB_ICON[Panel.Map],
    themeAwareImageIcon: true,
    ...command,
  });
  const toggle3D = () => {
    if (is3D) { disableBugs(); }
    props.dispatch(setWebAppConfigValue(
      BooleanSetting.three_d_garden, !is3D));
  };
  const toggleAmplifyZ = () => props.dispatch({
    type: Actions.TOGGLE_3D_EXAGGERATED_Z,
    payload: !amplifyZ,
  });
  const toggleAreas = () => props.dispatch(setWebAppConfigValue(
    BooleanSetting.show_zones, !showAreas));
  return [
    mapCommand({
      id: "setting:three_d_garden:toggle",
      ...localized("3D Map"),
      aliases: ["3D Garden", "Toggle 3D Map", "enable", "disable"],
      group: "map",
      execute: toggle3D,
      toggleValue: is3D,
      accessory: toggleAccessory(is3D),
    }),
    mapCommand({
      id: "setting:amplify_z:toggle",
      ...localized("Amplify Z"),
      aliases: ["Exaggerate Z", "Toggle Amplify Z", "enable", "disable"],
      group: "map",
      unavailable: unavailable3D,
      execute: toggleAmplifyZ,
      toggleValue: amplifyZ,
      accessory: toggleAccessory(amplifyZ, !!unavailable3D),
    }),
    mapCommand({
      id: "setting:show_zones:toggle",
      ...localized("Areas Map Layer"),
      aliases: [
        "Areas", "Zones", "Toggle Areas Map Layer", "show", "hide",
      ],
      group: "map",
      execute: toggleAreas,
      toggleValue: showAreas,
      accessory: toggleAccessory(showAreas),
    }),
  ];
};

const booleanSettingCommands = (props: BuildCommandProps): Command[] => {
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  return Object.entries(WEB_APP_BOOLEAN_SETTINGS)
    .filter(([setting]) => setting != BooleanSetting.show_zones)
    .map(([setting, metadata]) => {
      const key = setting as WebAppBooleanConfigKey;
      const rawValue = getValue(key);
      const current = metadata.defaultOn && rawValue === undefined
        ? true
        : !!rawValue;
      const inverted = !!metadata.inverted;
      const enabled = inverted ? !current : current;
      const set = (value: boolean) => {
        const confirmation = boolSettingConfirmations[setting];
        const nextRawValue = inverted ? !value : value;
        if (!current && nextRawValue
          && confirmation && !confirm(t(confirmation))) {
          return false;
        }
        props.dispatch(setWebAppConfigValue(
          key,
          nextRawValue,
        ));
        metadata.callback == "resetVirtualTrail" && resetVirtualTrail();
        return true;
      };
      const execute = () => set(!enabled);
      const settingLabel = settingText(metadata);
      const removeShowPrefix = (value: string, prefix: string) =>
        value.startsWith(`${prefix} `)
          ? value.slice(prefix.length + 1)
          : value;
      const text = metadata.mapLayer
        ? {
          name: removeShowPrefix(settingLabel.name, t("Show")),
          englishName: removeShowPrefix(settingLabel.englishName, "Show"),
        }
        : settingLabel;
      const unavailable =
        setting == BooleanSetting.display_map_missed_steps
          && !getValue(BooleanSetting.display_trail)
          ? t("Enable Trail first.")
          : undefined;
      return {
        id: `setting:${setting}:toggle`,
        ...text,
        ...settingHelp(metadata.help),
        aliases: [
          `Toggle ${text.englishName}`,
          `${t("Toggle")} ${text.name}`,
          "enable", "disable", "show", "hide", "open", "close", setting,
          ...(setting == BooleanSetting.xy_swap ? ["Rotate map"] : []),
        ],
        group: metadata.mapLayer
          ? "map" as const
          : "settings" as const,
        imageIcon: TAB_ICON[
          metadata.mapLayer ? Panel.Map : Panel.Settings
        ],
        themeAwareImageIcon: true,
        unavailable,
        execute,
        toggleValue: enabled,
        accessory: toggleAccessory(enabled, !!unavailable),
      };
    });
};

export const validNumberInput = (values: Record<string, string>) => {
  if (!Number.isFinite(Number(values.value)) || values.value.trim() == "") {
    return t("Enter a valid number.");
  }
};

interface SettingValueMetadata {
  min?: number;
  max?: number;
  step?: number;
  options?: { label: string; value: string }[];
}

const verbosityOptions = [0, 1, 2, 3].map(value => ({
  label: String(value), value: String(value),
}));

const numericSettingMetadata = (
  setting: string,
  metadata: PaletteSettingMetadata,
): SettingValueMetadata => {
  let options: SettingValueMetadata["options"];
  if (setting == NumericSetting.beep_verbosity) {
    options = verbosityOptions;
  } else if (setting == NumericSetting.bot_origin_quadrant) {
    options = [1, 2, 3, 4].map(value => ({
      label: String(value), value: String(value),
    }));
  }
  return {
    min: metadata.min,
    max: metadata.max,
    step: metadata.step,
    options,
  };
};

const validSettingValue = (
  values: Record<string, string>,
  type: "number" | "text",
  metadata: SettingValueMetadata,
) => {
  if (type == "number") {
    const invalidNumber = validNumberInput(values);
    if (invalidNumber) { return invalidNumber; }
    const value = Number(values.value);
    if ((metadata.step == 1 && !Number.isInteger(value))
      || (metadata.min !== undefined && value < metadata.min)
      || (metadata.max !== undefined && value > metadata.max)) {
      return t("Enter a value within the available range.");
    }
  }
  if (metadata.options
    && !metadata.options.some(option => option.value == values.value)) {
    return t("Select a valid option.");
  }
};

const stringSettingMetadata = (current: string): SettingValueMetadata => {
  const options = Object.entries(PAGE_SLUGS())
    .map(([value, label]) => ({ value, label }));
  if (current && !options.some(option => option.value == current)) {
    options.push({ value: current, label: `${current} (${t("Current")})` });
  }
  return { options };
};

const webAppValueSettingCommands = (props: BuildCommandProps): Command[] => {
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  const numbers = Object.entries(WEB_APP_NUMBER_SETTINGS)
    .map(([setting, metadata]) => ({
      setting, metadata, type: "number" as const,
    }));
  const strings = Object.entries(WEB_APP_STRING_SETTINGS)
    .map(([setting, metadata]) => ({
      setting, metadata, type: "text" as const,
    }));
  return [...numbers, ...strings].map(({ setting, metadata, type }) => {
    const key = setting as WebAppNumberConfigKey | WebAppStringConfigKey;
    const current = String(getValue(key) ?? "");
    const valueMetadata = type == "number"
      ? numericSettingMetadata(setting, metadata)
      : stringSettingMetadata(current);
    const text = settingText(metadata);
    const unavailable = [
      NumericSetting.map_size_x,
      NumericSetting.map_size_y,
    ].includes(setting as typeof NumericSetting.map_size_x)
      && getValue(BooleanSetting.dynamic_map)
      ? t("Disable Dynamic Map Size first.")
      : undefined;
    if (metadata.control == "toggle") {
      const enabled = !!getValue(key);
      const execute = () => props.dispatch(setWebAppConfigValue(
        setting as WebAppNumberConfigKey,
        enabled ? 0 : 1,
      ));
      return {
        id: `setting:${setting}:set`,
        ...text,
        ...settingHelp(metadata.help),
        aliases: [
          `Toggle ${text.englishName}`,
          "show", "hide", "enable", "disable", setting,
        ],
        group: "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        execute,
        toggleValue: enabled,
        accessory: toggleAccessory(enabled),
      };
    }
    const validate = (values: Record<string, string>) =>
      validSettingValue(values, type, valueMetadata);
    const execute = (values?: Record<string, string>) => {
      if (!values || validate(values)) { return false; }
      return props.dispatch(setWebAppConfigValue(
        key,
        type == "number" ? Number(values.value) : values.value));
    };
    const action: CommandAction = {
      id: "set",
      ...localized("Set"),
      input: {
        fields: [{
          key: "value", label: text.name, type,
          initialValue: current,
          min: valueMetadata.min,
          max: valueMetadata.max,
          step: valueMetadata.step,
          options: valueMetadata.options,
        }],
        validate,
      },
      execute,
    };
    return {
      id: `setting:${setting}:set`,
      ...text,
      ...settingHelp(metadata.help),
      aliases: [
        "change", "update", setting,
        `Set ${text.englishName}`, t(`Set ${text.englishName}`),
      ],
      group: "settings",
      imageIcon: TAB_ICON[Panel.Settings],
      themeAwareImageIcon: true,
      unavailable,
      actions: [action],
      execute,
    };
  });
};

const fbosValueMetadata = (key: string): SettingValueMetadata => {
  let options: SettingValueMetadata["options"];
  if (key == "default_axis_order") {
    options = getAxisOrderOptions().map(option => ({
      label: option.label, value: String(option.value),
    }));
  }
  if (key == "update_channel") {
    options = ["stable", "beta", "alpha"]
      .map(channel => ({ label: t(channel), value: channel }));
  }
  return options ? { options } : {};
};

const fbosSettingCommands = (props: BuildCommandProps): Command[] => {
  const fbosConfig = getFbosConfig(props.state.resources.index);
  const values = fbosConfig?.body
    ?? props.state.bot.hardware.configuration;
  const firmwareHardware = validFirmwareHardware(
    values.firmware_hardware);
  const getDefault = getDefaultConfigValue(firmwareHardware);
  return Object.entries(FBOS_SETTINGS).flatMap<Command>(([key, setting]) => {
    const resourceValue = values[key as keyof typeof values];
    const value = resourceValue ?? getDefault(key as
      FbosBooleanConfigKey | FbosNumberConfigKey | FbosStringConfigKey);
    const text = settingText(setting);
    const help = key == "gantry_height" && setting.help
      ? t(setting.help, {
        distance: String(
          getDefault("gantry_height")),
      })
      : setting.help;
    const command = {
      ...text,
      ...settingHelp(help, key == "gantry_height"),
      aliases: [
        "fbos", "device", "change", key,
        `Set FarmBot setting ${text.englishName}`,
      ],
      group: "settings" as const,
      imageIcon: TAB_ICON[Panel.Settings],
      themeAwareImageIcon: true,
    };
    if (setting.control == "toggle") {
      const enabled = !!value;
      const execute = () => props.dispatch(updateConfig({ [key]: !enabled }));
      return [{
        id: `fbos-setting:${key}:toggle`,
        ...command,
        execute,
        toggleValue: enabled,
        accessory: toggleAccessory(enabled),
      }];
    }
    const metadata = {
      ...fbosValueMetadata(key),
      ...(setting.control == "number" ? { step: 1 } : {}),
    };
    const type = setting.control == "number"
      ? "number" as const
      : "text" as const;
    const validate = (values: Record<string, string>) =>
      validSettingValue(values, type, metadata);
    const execute = (values?: Record<string, string>) => {
      if (!values || validate(values)) { return false; }
      if (key == "update_channel" && values.value != "stable"
        && !confirm(t(Content.UNSTABLE_RELEASE_CHANNEL_WARNING))) {
        return false;
      }
      return props.dispatch(updateConfig({
        [key]: type == "number"
          ? Number(values.value)
          : values.value,
      }));
    };
    const action: CommandAction = {
      id: "set",
      ...localized("Set"),
      input: {
        fields: [{
          key: "value",
          label: text.name,
          type,
          initialValue: value === undefined ? "" : String(value),
          step: metadata.step,
          options: metadata.options,
        }],
        validate,
      },
      execute,
    };
    return [{
      id: `fbos-setting:${key}:set`,
      ...command,
      actions: [action],
      execute,
    }];
  });
};

const axisFromKey = (
  key: string,
  fallback: Xyz = "x",
): Xyz => {
  const axis = key.match(/_([xyz])$/)?.[1];
  return (axis || fallback) as Xyz;
};

const firmwareSettingVisible = (
  setting: FirmwareSettingMetadata,
  firmwareHardware: ReturnType<typeof validFirmwareHardware>,
) => {
  switch (setting.visibility) {
    case "encoders":
      return hasEncoders(firmwareHardware);
    case "stall-future":
      return !hasEncoders(firmwareHardware)
        && DevSettings.futureFeaturesEnabled();
    case "tmc":
      return isTMCBoard(firmwareHardware);
    default:
      return true;
  }
};

const firmwareSettingCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const fbosValues = getFbosConfig(index)?.body
    ?? props.state.bot.hardware.configuration;
  const values = getFirmwareConfig(index)?.body
    ?? props.state.bot.hardware.mcu_params;
  const firmwareHardware = validFirmwareHardware(
    fbosValues.firmware_hardware);
  const sourceFwConfig = (key: McuParamName) => ({
    value: values[key],
    consistent: true,
  });
  const movementScale = calculateScale(sourceFwConfig);
  const getDefault = getDefaultFwConfigValue(firmwareHardware);
  const transform = (
    setting: FirmwareSettingMetadata,
    key: McuParamName,
    value: number,
    direction: "to-display" | "from-display",
  ) => {
    const axis = axisFromKey(key, setting.axis);
    let scale = 1;
    if (setting.transform == "movement-scale") {
      scale = movementScale[axis];
    } else if (setting.transform == "microsteps") {
      scale = values[`movement_microsteps_${axis}`] || 1;
    }
    if (setting.transform == "motor-current") {
      return direction == "to-display"
        ? motorCurrentMaToPercent(value)
        : motorCurrentPercentToMa(value);
    }
    return direction == "to-display"
      ? value / scale
      : Math.round(value * scale);
  };
  const displayValue = (
    setting: FirmwareSettingMetadata,
    key: McuParamName,
    value: number,
  ) => transform(setting, key, value, "to-display");
  const resolvedHelp = (
    setting: FirmwareSettingMetadata,
    help: string | undefined,
  ) => {
    if (!help) { return undefined; }
    const defaults = Object.fromEntries(
      setting.keys.map(key => {
        const configKey = key as McuParamName;
        const defaultValue = getDefault(configKey);
        let formattedDefault: number | string = displayValue(
          setting, configKey, defaultValue);
        if (isBooleanMcuParam(configKey)) {
          formattedDefault = defaultValue ? t("enabled") : t("disabled");
        } else if (setting.transform == "microsteps") {
          formattedDefault = defaultValue;
        }
        return [axisFromKey(key, setting.axis), formattedDefault];
      }));
    return t(help, {
      ...defaults,
      retries: getDefault("param_mov_nr_retry"),
      eStopOnError: getDefault("param_e_stop_on_mov_err")
        ? t("enabled")
        : t("disabled"),
      x2Motor: getDefault("movement_secondary_motor_x")
        ? t("enabled")
        : t("disabled"),
    });
  };
  const encoders = hasEncoders(firmwareHardware);
  const unavailable = props.state.bot.hardware.informational_settings.busy
    ? t("FarmBot is busy.")
    : undefined;
  return Object.entries(FIRMWARE_SETTINGS)
    .flatMap<Command>(([id, setting]) => {
      if (!firmwareSettingVisible(setting, firmwareHardware)) { return []; }
      const keys = setting.keys as McuParamName[];
      const label = !encoders && setting.stallLabel
        ? setting.stallLabel
        : setting.label;
      const help = !encoders && setting.stallHelp
        ? setting.stallHelp
        : setting.help;
      const text = settingText({ ...setting, label });
      const base = {
        ...text,
        ...settingHelp(resolvedHelp(setting, help)),
        aliases: [
          "mcu", "hardware", "change", id,
          `Set firmware setting ${text.englishName}`,
          ...keys,
        ],
        group: "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        unavailable,
      };
      if (keys.length == 1 && setting.control == "toggle") {
        const key = keys[0];
        const enabled = (values[key] ?? 0) != 0;
        const execute = () => props.dispatch(updateMCU(
          key, enabled ? "0" : "1"));
        return [{
          id: `firmware-setting:${id}:toggle`,
          ...base,
          execute,
          toggleValue: enabled,
          accessory: toggleAccessory(enabled, !!unavailable),
        }];
      }
      const booleanSetting = keys.every(isBooleanMcuParam);
      const actions = keys.map((key): CommandAction => {
        const actionId = keys.length == 1
          ? "set"
          : axisFromKey(key, setting.axis);
        const fieldKey = keys.length == 1 ? "value" : actionId;
        const rawValue = values[key];
        let initialValue = rawValue === undefined
          ? ""
          : String(displayValue(setting, key, rawValue));
        if (booleanSetting) {
          initialValue = String(rawValue ?? 0);
        }
        const rawMax = getMaxInputFromIntSize(setting.intSize);
        const inputMin = setting.min ?? 0;
        const transformedMax = displayValue(setting, key, rawMax);
        const inputMax = setting.max === undefined
          ? transformedMax
          : Math.min(setting.max, transformedMax);
        const validate = (input: Record<string, string>) => {
          if (booleanSetting) { return; }
          const invalid = validNumberInput({ value: input[fieldKey] });
          if (invalid) { return invalid; }
          const value = Number(input[fieldKey]);
          const rawInput = transform(
            setting, key, value, "from-display");
          const integerInput = setting.transform
            && setting.transform != "none"
            ? true
            : Number.isInteger(value);
          if (!integerInput
            || value < inputMin
            || value > inputMax
            || rawInput < -rawMax
            || rawInput > rawMax) {
            return t("Enter a value within the available range.");
          }
        };
        return {
          id: actionId,
          ...localized(keys.length == 1
            ? "Set"
            : actionId.toUpperCase()),
          aliases: [key],
          input: {
            fields: [{
              key: fieldKey,
              label: keys.length == 1 ? text.name : actionId.toUpperCase(),
              type: booleanSetting ? "boolean" : "number",
              initialValue,
              min: booleanSetting ? undefined : inputMin,
              max: booleanSetting ? undefined : inputMax,
            }],
            validate,
          },
          execute: input => {
            const inputValue = input?.[fieldKey];
            if (inputValue === undefined || validate(input || {})) {
              return false;
            }
            const value = booleanSetting
              ? inputValue
              : String(transform(
                setting, key, Number(inputValue), "from-display"));
            return props.dispatch(updateMCU(key, value));
          },
        };
      });
      return [{
        id: `firmware-setting:${id}:set`,
        ...base,
        actions,
        actionTable: keys.length > 1,
        execute: actions[0].execute,
      }];
    });
};

const configValueSettingCommands = (props: BuildCommandProps): Command[] => [
  ...fbosSettingCommands(props),
  ...firmwareSettingCommands(props),
];

const threeDSettingCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const envs = selectAllFarmwareEnvs(index);
  const getValue = get3DConfigValueFunction(envs);
  const setValue = findOrCreate3DConfigFunction(props.dispatch, envs);
  const sceneObjects = selectAllSceneObjects(index);
  return THREE_D_SETTINGS.map(setting => {
    const key = setting.key as keyof Config;
    const value = getValue(key);
    const text = settingText(setting);
    const help = setting.help
      ? t(setting.help, {
        defaultConfigValue: String(THREE_D_DEFAULTS[key]),
      })
      : undefined;
    const base = {
      ...text,
      ...settingHelp(help),
      aliases: ["3D", "garden", "change", key, `Set ${text.englishName}`],
      group: "settings" as const,
      imageIcon: TAB_ICON[Panel.Settings],
      themeAwareImageIcon: true,
    };
    if (setting.control == "toggle") {
      const enabled = !!value;
      const execute = () => setValue(key, enabled ? "0" : "1");
      return {
        id: key == "bounds"
          ? "camera:bounds"
          : `setting:3d:${key}:toggle`,
        ...base,
        execute,
        toggleValue: enabled,
        accessory: toggleAccessory(enabled),
      };
    }
    let options: SettingValueMetadata["options"];
    if (key == "scene") {
      options = SCENE_DDI_LIST().map(item => ({
        label: item.label,
        value: String(item.value),
      }));
    } else if (key == "groundTexture") {
      options = Object.values(TEXTURE_DDIS()).map(item => ({
        label: item.label,
        value: String(item.value),
      }));
    }
    const validate = (input: Record<string, string>) => {
      if (setting.control == "number") {
        return validNumberInput(input);
      }
      if (!options?.some(option => option.value == input.value)) {
        return t("Select a valid option.");
      }
    };
    const execute = (input?: Record<string, string>) => {
      if (!input || validate(input)) { return false; }
      if (key == "scene") {
        const scene = Number(input.value);
        if (scene == value) { return false; }
        if (SCENES[scene] != "Custom" && sceneObjects.length > 0
          && !confirm(t(Content.CONFIRM_SCENE_CHANGE,
            { count: sceneObjects.length }))) {
          return false;
        }
        if (SCENES[scene] != "Custom") {
          sceneObjects.map(item => props.dispatch(crud.destroy(item.uuid)));
        }
        setValue("groundTexture",
          String(GROUND_TEXTURE_NUM_FROM_SCENE_NUM[scene]));
      }
      return setValue(key, input.value);
    };
    const action: CommandAction = {
      id: "set",
      ...localized("Set"),
      input: {
        fields: [{
          key: "value",
          label: text.name,
          type: setting.control == "number" ? "number" : "text",
          initialValue: String(value),
          options,
        }],
        validate,
      },
      execute,
    };
    return {
      id: `setting:3d:${key}:set`,
      ...base,
      actions: [action],
      execute,
    };
  });
};

const commandUnavailable = (props: BuildCommandProps) => {
  const online = isBotOnlineFromState(props.state.bot) || forceOnline();
  if (!online) { return t("FarmBot is offline."); }
  if (props.state.bot.hardware.informational_settings.locked) {
    return t("Emergency stop is active.");
  }
};

const MOVE_COMMAND_ICON = "arrows";

const relativeMoveCommands = (props: BuildCommandProps): Command[] => {
  const distances = [-1000, -100, -10, -1, 1, 10, 100, 1000];
  const unavailable = commandUnavailable(props);
  return (["x", "y", "z"] as Xyz[]).map(axis => {
    const move = (distance: number) => moveRelative({
      x: axis == "x" ? distance : 0,
      y: axis == "y" ? distance : 0,
      z: axis == "z" ? distance : 0,
    });
    const presets: CommandAction[] = distances.map(distance => {
      const label = distance > 0 ? `+${distance}` : String(distance);
      return {
        id: label,
        name: label,
        englishName: label,
        aliases: [`${label} mm`, `${label} millimeters`],
        execute: () => move(distance),
      };
    });
    const customKey = `${axis}Distance`;
    const custom: CommandAction = {
      id: "custom",
      ...localized("Custom distance"),
      aliases: ["distance", "millimeters", "mm"],
      input: {
        fields: [{
          key: customKey, label: t("Custom distance"), type: "number",
        }],
        validate: values => validNumberInput({ value: values[customKey] }),
      },
      execute: values => move(Number(values?.[customKey])),
    };
    const actions = [custom, ...presets];
    return {
      id: `farmbot:move:${axis}`,
      ...localized(`Move ${axis.toUpperCase()}`),
      aliases: ["jog", "relative", axis],
      group: "farmbot",
      unavailable,
      icon: MOVE_COMMAND_ICON,
      actions,
      execute: actions[0].execute,
    };
  });
};

const homeCommands = (props: BuildCommandProps): Command[] => {
  const unavailable = commandUnavailable(props);
  const allAxes: Axis[] = ["all", "x", "y", "z"];
  const cartesianAxes: Xyz[] = ["x", "y", "z"];
  const axisActions = <T extends Axis>(
    axes: T[],
    execute: (axis: T) => unknown,
  ): CommandAction[] => axes.map(axis => {
      const label = axis == "all" ? "All" : axis.toUpperCase();
      return {
        id: axis,
        ...localized(label),
        aliases: axis == "all" ? ["all axes"] : [axis],
        execute: () => execute(axis),
      };
    });
  const findActions = axisActions(allAxes, findHome);
  const moveActions = axisActions(allAxes, moveToHome);
  const lengthActions = axisActions(allAxes, findAxisLength);
  const setActions = axisActions(cartesianAxes, axis =>
    withConfirmation(
      "Are you sure you want to set the home position?",
      () => setHome(axis),
    )());
  const fbosValues = getFbosConfig(props.state.resources.index)?.body
    ?? props.state.bot.hardware.configuration;
  const firmwareHardware = validFirmwareHardware(
    fbosValues.firmware_hardware);
  const findHomeHelp = hasEncoders(firmwareHardware)
    ? ToolTips.FIND_HOME_ENCODERS
    : ToolTips.FIND_HOME_STALL_DETECTION;
  const findLengthHelp = hasEncoders(firmwareHardware)
    ? ToolTips.FIND_LENGTH_ENCODERS
    : ToolTips.FIND_LENGTH_STALL_DETECTION;
  const grouped: Command[] = [
    {
      id: "farmbot:find-home",
      searchPriority: 2,
      ...localized("Find Home"),
      ...settingHelp(findHomeHelp),
      aliases: ["home", "zero", "calibrate", "axis"],
      group: "farmbot",
      icon: "home",
      unavailable,
      actions: findActions,
      execute: findActions[0].execute,
    },
    {
      id: "farmbot:move-home",
      searchPriority: 3,
      ...localized("Move Home"),
      ...settingHelp(ToolTips.MOVE_TO_HOME),
      aliases: ["move to home", "home", "zero", "axis"],
      group: "farmbot",
      icon: "home",
      unavailable,
      actions: moveActions,
      execute: moveActions[0].execute,
    },
    {
      id: "farmbot:find-length",
      ...localized("Find Axis Length"),
      ...settingHelp(findLengthHelp),
      aliases: ["zero", "calibrate", "axis"],
      group: "farmbot",
      icon: "search",
      unavailable,
      actions: lengthActions,
      execute: lengthActions[0].execute,
    },
    {
      id: "farmbot:set-home",
      searchPriority: 1,
      ...localized("Set Home"),
      ...settingHelp(ToolTips.SET_HOME_POSITION),
      aliases: ["home", "zero", "calibrate", "axis"],
      group: "farmbot",
      icon: "home",
      unavailable,
      actions: setActions,
      execute: setActions[0].execute,
    },
  ];
  return grouped;
};

const withConfirmation = (
  message: string,
  execute: () => unknown,
) => () => {
  if (!confirm(t(message))) { return false; }
  return execute();
};

const verifyTool = (props: BuildCommandProps) => {
  const sensors = selectAllSensors(props.state.resources.index);
  const pin = getToolVerificationPin(sensors);
  return readPin(pin, `pin${pin}`, 0);
};

const simplePanelCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const add = (
    id: string,
    title: string,
    execute: () => unknown,
  ): CommandAction => ({
    id,
    ...localized(title),
    aliases: ["add", "new", "create"],
    execute,
  });
  const definitions: {
    panel: Panel;
    addAction: CommandAction;
    additionalActions?: CommandAction[];
  }[] = [
    {
      panel: Panel.SceneObjects,
      addAction: add("add-new", "Add New",
        () => openAddPage(props, Path.sceneObjects("catalog"))),
      additionalActions: [add("add-custom", "Add Custom",
        () => openAddPage(props, Path.sceneObjects("add"))),
      ],
    },
    {
      panel: Panel.Regimens,
      addAction: add("add-new", "Add New", () => props.dispatch(addRegimen(
        selectAllRegimens(index).length, props.navigate))),
    },
    {
      panel: Panel.FarmEvents,
      addAction: add("add-new", "Add New",
        () => openAddPage(props, Path.farmEvents("add"))),
    },
    {
      panel: Panel.Sensors,
      addAction: add("add-new", "Add New",
        () => openAddPage(props, Path.sensors())),
    },
  ];
  const commands = definitions.map(({
    panel, addAction, additionalActions = [],
  }): Command => {
    const actions = [
      addAction,
      ...additionalActions,
      panelAction(props, panel),
    ];
    return {
      id: `panel:${PANEL_SLUG[panel]}`,
      ...combinedPanelCommandText(panel, PANEL_TITLE()[panel]),
      group: "resources",
      imageIcon: TAB_ICON[panel],
      themeAwareImageIcon: true,
      actions,
      execute: actions[0].execute,
    };
  });
  const toolActions: CommandAction[] = [
    {
      id: "verify-tool",
      ...localized("Verify Tool"),
      unavailable: commandUnavailable(props),
      execute: () => verifyTool(props),
    },
    panelAction(props, Panel.Tools),
    add("add-tool", "Add Tool",
      () => openAddPage(props, Path.tools("add"))),
    add("add-tool-slot", "Add Tool Slot",
      () => openAddPage(props, Path.toolSlots("add"))),
  ];
  commands.push({
    id: "panel:tools",
    ...combinedPanelCommandText("Tools"),
    group: "resources",
    imageIcon: TAB_ICON[Panel.Tools],
    themeAwareImageIcon: true,
    actions: toolActions,
    execute: toolActions[0].execute,
  });
  return commands;
};

const cameraCommand = (props: BuildCommandProps): Command => {
  const unavailable = commandUnavailable(props);
  const actions: CommandAction[] = [
    {
      id: "take-photo",
      ...localized("Take Photo"),
      unavailable,
      execute: takePhoto,
    },
    {
      id: "detect-weeds",
      ...localized("Detect Weeds"),
      unavailable,
      execute: detectWeeds,
    },
    {
      id: "measure-soil-height",
      ...localized("Measure Soil Height"),
      unavailable,
      execute: measureSoilHeight,
    },
    {
      id: "calibrate",
      ...localized("Calibrate"),
      unavailable,
      execute: withConfirmation(
        "Are you sure you want to calibrate the camera?",
        calibrateCamera,
      ),
    },
  ];
  return {
    id: "farmbot:camera",
    ...localized("Camera"),
    aliases: ["photo", "camera calibration", "weed detection"],
    group: "farmbot",
    imageIcon: TAB_ICON[Panel.Photos],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  };
};

const powerCommand = (props: BuildCommandProps): Command => {
  const unavailable = commandUnavailable(props);
  const action = (
    id: string,
    title: string,
    confirmation: string,
    execute: () => unknown,
  ): CommandAction => ({
    id,
    ...localized(title),
    unavailable,
    execute: withConfirmation(confirmation, execute),
  });
  const actions = [
    action(
      "reboot",
      "Reboot FarmBot",
      "Are you sure you want to reboot FarmBot?",
      reboot,
    ),
    action(
      "restart-firmware",
      "Restart Firmware",
      "Are you sure you want to restart the firmware?",
      restartFirmware,
    ),
    action(
      "shutdown",
      "Shutdown FarmBot",
      "Are you sure you want to shut down FarmBot?",
      powerOff,
    ),
  ];
  return {
    id: "farmbot:power",
    ...localized("Power"),
    ...settingHelp(DIRECT_COMMAND_HELP["farmbot:reboot"]),
    aliases: ["reboot", "restart", "shutdown", "power off"],
    group: "farmbot",
    icon: "power-off",
    actions,
    execute: actions[0].execute,
  };
};

const directDeviceCommands = (props: BuildCommandProps): Command[] => {
  const unavailable = commandUnavailable(props);
  const unlock = () => {
    if (!confirm(t("Are you sure you want to unlock the device?"))) {
      return false;
    }
    return emergencyUnlock(true);
  };
  const commands: [string, string, () => unknown, string?][] = [
    ["estop", "E-Stop", emergencyLock],
    ["unlock", "Unlock", unlock],
    ["sync", "Sync FarmBot", () => props.dispatch(sync())],
  ];
  const icons: Record<string, string> = {
    estop: "pause",
    unlock: "unlock",
    sync: "refresh",
  };
  const imageIcons: Record<string, string> = {};
  const priorities: Record<string, number> = {
    estop: 2,
    unlock: 1,
  };
  const emergencyButton = (
    id: "estop" | "unlock",
  ) => (execute: () => void) =>
    <button type="button"
      className={`fb-button red e-stop${id == "unlock" ? " yellow" : ""}`}
      onClick={execute}>
      {t(id == "unlock" ? "UNLOCK" : "E-STOP")}
    </button>;
  return commands.map(([id, name, execute, reason]) => ({
    id: `farmbot:${id}`,
    priority: priorities[id],
    ...localized(name),
    ...settingHelp(DIRECT_COMMAND_HELP[`farmbot:${id}`]),
    aliases: [
      "bot", "device", "rpc", "rcp", "execute",
      ...(id == "estop"
        ? [
          "Stop", "Estop", "Emergency stop", t("Emergency stop"),
          "emergency lock",
        ]
        : []),
      ...(id == "unlock"
        ? ["Emergency unlock", t("Emergency unlock")]
        : []),
      ...(id == "verify-tool"
        ? ["tool", "utm", "sensor", "read pin"]
        : []),
    ],
    group: "farmbot",
    icon: icons[id],
    imageIcon: imageIcons[id],
    themeAwareImageIcon: !!imageIcons[id],
    unavailable: id == "estop" || id == "unlock" ? reason : unavailable,
    execute,
    accessory: id == "estop" || id == "unlock"
      ? emergencyButton(id)
      : undefined,
  }));
};

const coordinateInput = {
  fields: (["x", "y", "z"] as Xyz[]).map(axis => ({
    key: axis,
    label: axis.toUpperCase(),
    type: "number" as const,
    step: 1,
    initialValue: "0",
  })),
  validate: (values: Record<string, string>) => {
    if (!(["x", "y", "z"] as Xyz[])
      .every(axis => values[axis]?.trim() != ""
        && Number.isFinite(Number(values[axis])))) {
      return t("Enter valid X, Y, and Z coordinates.");
    }
  },
};

const moveToCommands = (props: BuildCommandProps): Command[] => {
  const unavailable = commandUnavailable(props);
  const executeCoordinates = (values?: Record<string, string>) => moveAbsolute({
    x: Number(values?.x), y: Number(values?.y), z: Number(values?.z),
  });
  const coordinateAction: CommandAction = {
    id: "move",
    ...localized("Move"),
    input: { ...coordinateInput, table: true },
    execute: executeCoordinates,
  };
  return [{
    id: "farmbot:move-to:coordinates",
    ...localized("Move to coordinates"),
    aliases: ["go to", "absolute", "location", "position"],
    group: "farmbot",
    icon: MOVE_COMMAND_ICON,
    unavailable,
    actions: [coordinateAction],
    execute: executeCoordinates,
  }];
};

const peripheralToggleAliases = (label: string) => {
  const aliases = [
    { label: "Lighting", aliases: ["Lights", "LED Strip"] },
    {
      label: "Vacuum",
      aliases: ["Vacuum Pump", "Air", "Suction", "Seeder"],
    },
    {
      label: "Water",
      aliases: ["Solenoid Valve", "Watering Nozzle"],
    },
  ];
  const normalizedLabel = label.toLowerCase();
  return aliases.find(item => [item.label, t(item.label)]
    .some(name => name.toLowerCase() == normalizedLabel))?.aliases || [];
};

const peripheralToggleValue = (
  analog: boolean,
  value: number | undefined,
) => analog ? undefined : !!value;

const peripheralCommands = (props: BuildCommandProps): Command[] => {
  const pins = props.state.bot.hardware.pins;
  return selectAllPeripherals(props.state.resources.index).map(peripheral => {
    const pin = peripheral.body.pin;
    const analog = peripheral.body.mode == ANALOG;
    const actualValue = pins[pin || -1]?.value;
    const value = actualValue === undefined && forceOnline()
      ? 0
      : actualValue;
    const unavailable = commandUnavailable(props)
      || (!pin ? t("Peripheral has no pin assigned.") : undefined);
    const execute = (values?: Record<string, string>) => {
      if (!pin) { return; }
      return analog
        ? writePin(pin, Number(values?.value), ANALOG)
        : pinToggle(pin);
    };
    const action: CommandAction | undefined = analog
      ? {
        id: "set",
        ...localized("Set"),
        input: {
          fields: [{
            key: "value", label: t("Value"), type: "number",
            min: 0, max: 255, step: 1, initialValue: String(value || 0),
          }],
          validate: values => {
            const input = values.value;
            const value = Number(input);
            if (input.trim() == "" || !Number.isInteger(value)
              || value < 0 || value > 255) {
              return t("Enter a whole number from 0 to 255.");
            }
          },
        },
        execute,
      }
      : undefined;
    const command: Command = {
      id: `farmbot:peripheral:${peripheral.uuid}`,
      ...localized(peripheral.body.label),
      aliases: [
        "peripheral", "pin", "on", "off", "control",
        `Peripheral ${peripheral.body.label}`,
        `${analog ? "Set" : "Toggle"} peripheral ${peripheral.body.label}`,
        ...(!analog ? peripheralToggleAliases(peripheral.body.label) : []),
      ],
      group: "farmbot",
      ...(!analog ? { icon: "toggle-on" } : {}),
      unavailable,
      actions: action ? [action] : undefined,
      toggleValue: peripheralToggleValue(analog, value),
      accessory: !analog
        ? (run: () => void, recentValue?: boolean) => <ToggleButton
          toggleValue={recentValue ?? value}
          toggleAction={event => {
            event.stopPropagation();
            run();
          }}
          customText={{ textFalse: t("off"), textTrue: t("on") }} />
        : undefined,
      execute,
    };
    return command;
  });
};

const scheduleAction = (
  props: BuildCommandProps,
  executableType: "Sequence" | "Regimen",
  executableId: number | undefined,
): CommandAction => ({
  id: "schedule",
  ...localized("Schedule"),
  aliases: ["event", "farm event", "calendar"],
  unavailable: executableId ? undefined : t("Save before scheduling."),
  execute: () => {
    if (!executableId) { return; }
    props.dispatch(setPanelOpen(true));
    props.navigate(farmEventSchedulePath(executableType, executableId));
  },
});

const sequenceCommands = (props: BuildCommandProps): Command[] => {
  return selectAllSequences(props.state.resources.index).map(sequence => {
    const name = sequence.body.name;
    const actions: CommandAction[] = [
      {
        id: "run", ...localized("Run"), aliases: ["execute", "start"],
        execute: () => execSequence(sequence.body.id),
      },
      {
        id: "open", ...localized("Open"), aliases: ["edit", "view"],
        execute: () => {
          props.dispatch(setPanelOpen(true));
          props.navigate(Path.sequences(urlFriendly(name)));
        },
      },
      {
        id: "preview", ...localized("Preview"), aliases: ["view", "map"],
        execute: () => {
          props.dispatch(visualizeInMap(sequence.uuid));
          props.dispatch(setPanelOpen(false));
          props.navigate(Path.designer());
        },
      },
      {
        id: "copy", ...localized("Copy"), aliases: ["duplicate"],
        execute: () => props.dispatch(copySequence(props.navigate, sequence)),
      },
      scheduleAction(props, "Sequence", sequence.body.id),
    ];
    return {
      id: `sequence:${sequence.uuid}`,
      ...localized(name),
      aliases: ["sequence", name],
      group: "resources",
      imageIcon: TAB_ICON[Panel.Sequences],
      themeAwareImageIcon: true,
      actions,
      execute: actions[0].execute,
    };
  });
};

const regimenCommands = (props: BuildCommandProps): Command[] => {
  return selectAllRegimens(props.state.resources.index).map(regimen => {
    const name = regimen.body.name;
    const open = () => {
      props.dispatch(setPanelOpen(true));
      props.navigate(Path.regimens(urlFriendly(name)));
    };
    const actions: CommandAction[] = [
      {
        id: "open", ...localized("Open"), aliases: ["edit", "view"],
        execute: open,
      },
      {
        id: "copy", ...localized("Copy"), aliases: ["duplicate"],
        execute: () => props.dispatch(copyRegimen(props.navigate, regimen)),
      },
      scheduleAction(props, "Regimen", regimen.body.id),
    ];
    return {
      id: `regimen:${regimen.uuid}`,
      ...localized(name),
      aliases: ["regimen", name, `Open regimen ${name}`],
      group: "resources" as const,
      imageIcon: TAB_ICON[Panel.Regimens],
      themeAwareImageIcon: true,
      actions,
      execute: actions[0].execute,
    };
  });
};

const gardenCommand = (props: BuildCommandProps): Command => {
  const actions: CommandAction[] = [
    {
      id: "snapshot",
      ...localized("Snapshot current"),
      aliases: ["save current garden", "capture garden", "snapshot garden"],
      execute: () => snapshotGarden(props.navigate),
    },
    {
      id: "create",
      ...localized("Create new"),
      aliases: ["new garden", "create blank garden", "empty garden"],
      execute: () => props.dispatch(newSavedGarden(props.navigate, "", "")),
    },
  ];
  return {
    id: "garden",
    ...localized("Garden"),
    aliases: ["saved garden", "garden management"],
    group: "resources",
    imageIcon: TAB_ICON[Panel.SavedGardens],
    themeAwareImageIcon: true,
    actions,
    execute: actions[0].execute,
  };
};

const createCurve = (type: CurveType, navigate: NavigateFunction) =>
  (dispatch: Function, getState: GetState) => {
    const curves = selectAllCurves(getState().resources.index);
    const typeName = t(startCase(type));
    let number = 1;
    const name = (count: number) =>
      `${typeName} ${t("curve")} ${count}`;
    while (curves.some(curve => curve.body.type == type
      && curve.body.name == name(number))) {
      number++;
    }
    const action = crud.init("Curve", {
      name: name(number),
      type,
      data: scaleData(
        getTemplateShapeData(type),
        getTemplateScale(type, TemplateOption.day),
        getTemplateScale(type, TemplateOption.value),
        getTemplateShape(type) != CurveShape.constant),
    });
    dispatch(action);
    return dispatch(crud.save(action.payload.uuid))
      .then(() => {
        const curve = selectAllCurves(getState().resources.index)
          .find(item => item.uuid == action.payload.uuid);
        curve?.body.id && navigate(Path.curves(curve.body.id));
      })
      .catch(() => { });
  };

const addCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const designer = props.state.resources.consumers.farm_designer;
  const getConfigValue = getWebAppConfigValueFromResources(index);
  const threeDGrid =
    !!getConfigValue(BooleanSetting.three_d_garden);
  const botPosition = validBotLocationData(
    props.state.bot.hardware.location_data).position;
  const botXY = isNumber(botPosition.x) && isNumber(botPosition.y)
    ? { x: round(botPosition.x), y: round(botPosition.y) }
    : undefined;
  const locationUnavailable = t("FarmBot position unknown.");
  const decodeHtmlEntities = (value: string) => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = value;
    return textarea.value;
  };
  const cropCommandText = (cropName: string) => {
    const name = decodeHtmlEntities(cropName);
    return {
      name,
      englishName: name,
      plantAlias: decodeHtmlEntities(
        t("Plant {{ crop }}", { crop: cropName })),
    };
  };
  const openCrop = (slug: string) => {
    openAddPage(props, Path.cropSearch(slug));
  };
  const cropCommand = (slug: string): Command => {
    const crop = findCropMetadata(slug);
    const text = cropCommandText(crop.name);
    const actions: CommandAction[] = [
      {
        id: "add-new",
        ...localized("Add new"),
        aliases: ["new plant", "create plant"],
        execute: () => openCrop(slug),
      },
      {
        id: "add-grid",
        ...localized("Add grid"),
        aliases: [
          `${crop.name} grid`,
          `grid of ${crop.name}`,
          `${crop.name} row`,
        ],
        execute: () => {
          openCrop(slug);
          if (!threeDGrid) {
            props.dispatch({
              type: Actions.SET_LEGACY_GRID_PLANTING_CROP,
              payload: slug,
            });
            return;
          }
          const token = uuid();
          props.dispatch({
            type: Actions.SET_GRID_PLANTING,
            payload: {
              token,
              gridId: token,
              gridType: "plant",
              cropSlug: slug,
              itemName: crop.name,
              defaultSpacing:
                (crop.spread || DEFAULT_PLANT_RADIUS) * 10,
            },
          });
        },
      },
      {
        id: "add-current",
        ...localized("Add at current location"),
        aliases: [
          `plant ${crop.name} here`,
          `${crop.name} at FarmBot`,
          `${crop.name} at current position`,
        ],
        unavailable: botXY ? undefined : locationUnavailable,
        execute: () => botXY && createPlant({
          cropName: crop.name,
          slug,
          gardenCoords: botXY,
          gridSize: undefined,
          dispatch: props.dispatch,
          openedSavedGarden: designer.openedSavedGarden,
          depth: parseInt("" +
            getConfigValue(NumericSetting.default_plant_depth)),
          designer,
        }),
      },
    ];
    return {
      id: `add:crop:${slug}`,
      name: text.name,
      englishName: text.englishName,
      aliases: ["add", "new", "create", "crop", slug, text.plantAlias],
      group: "resources",
      imageIcon: crop.icon,
      actions,
      execute: actions[0].execute,
    };
  };
  const cropCommands = CROP_SLUGS.map(cropCommand);
  const apiCrops = selectAllCrops(index)
    .filter(crop => !CROP_SLUGS.includes(crop.body.slug))
    .map(crop => cropCommand(crop.body.slug));
  return [...cropCommands, ...apiCrops];
};

interface ResourceCommandData {
  id: string;
  uuid: string;
  name: string;
  kind: string;
  panel: Panel;
  imageIcon?: string;
  path: string;
  location?: { x: number; y: number; z: number };
  aliases?: string[];
  deleteUnavailable?: string;
}

const openResource = (
  props: BuildCommandProps,
  path: string,
) => () => {
  props.dispatch(setPanelOpen(true));
  props.navigate(path);
};

const sensorCommands = (props: BuildCommandProps): Command[] => {
  return selectAllSensors(props.state.resources.index).map(sensor => {
    const { label, mode, pin } = sensor.body;
    const readUnavailable = commandUnavailable(props)
      || (!Number.isFinite(pin)
        ? t("Sensor has no pin assigned.")
        : undefined);
    const read = () => {
      if (!Number.isFinite(pin)) { return; }
      return readPin(pin as number, `pin${pin}`, mode as ALLOWED_PIN_MODES);
    };
    const open = openResource(props, Path.sensors());
    const actions: CommandAction[] = [
      {
        id: "read",
        ...localized("Read"),
        aliases: ["read pin", "sample", "measure"],
        unavailable: readUnavailable,
        execute: read,
      },
      {
        id: "open",
        ...localized("Open"),
        aliases: ["edit", "view", "navigate"],
        execute: open,
      },
    ];
    return {
      id: `sensor:${sensor.uuid}`,
      ...localized(label),
      aliases: ["sensor", label, `Open sensor ${label}`],
      group: "resources" as const,
      imageIcon: TAB_ICON[Panel.Sensors],
      themeAwareImageIcon: true,
      actions,
      execute: actions[0].execute,
    };
  });
};

const locatedResourceCommand = (
  props: BuildCommandProps,
  data: ResourceCommandData,
): Command => {
  const { location } = data;
  const name = location
    ? `${data.name} (${location.x}, ${location.y}, ${location.z})`
    : data.name;
  const movementUnavailable = commandUnavailable(props)
    || (!location ? t("No location is assigned to this resource.") : undefined);
  const currentZ = validBotLocationData(
    props.state.bot.hardware.location_data).position.z || 0;
  const go = (includeZ: boolean) => {
    if (!location) { return; }
    return moveAbsolute({
      x: location.x,
      y: location.y,
      z: includeZ ? location.z : currentZ,
    });
  };
  const open = openResource(props, data.path);
  const actions: CommandAction[] = [
    {
      id: "go-xy",
      ...localized("Go (XY)"),
      aliases: ["move", "go to", "XY"],
      unavailable: movementUnavailable,
      execute: () => go(false),
    },
    {
      id: "go-xyz",
      ...localized("Go (XYZ)"),
      aliases: ["move", "go to", "XYZ"],
      unavailable: movementUnavailable,
      execute: () => go(true),
    },
    {
      id: "open",
      ...localized("Open"),
      aliases: ["edit", "view", "navigate"],
      execute: open,
    },
    {
      id: "delete",
      ...localized("Delete"),
      aliases: ["remove", "destroy"],
      unavailable: data.deleteUnavailable,
      execute: () => props.dispatch(crud.destroy(data.uuid)),
    },
  ];
  return {
    id: data.id,
    ...localized(name),
    aliases: [data.kind, data.name, ...(data.aliases || [])],
    group: "resources",
    imageIcon: data.imageIcon || TAB_ICON[data.panel],
    themeAwareImageIcon: !data.imageIcon,
    actions,
    execute: actions[0].execute,
  };
};

const locatedResourceCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const tools = selectAllTools(index);
  const slots = selectAllToolSlotPointers(index);
  const resources: ResourceCommandData[] = [
    ...selectAllPlantPointers(index).map(point => ({
      id: `plant:${point.uuid}`,
      uuid: point.uuid,
      name: point.body.name,
      kind: "plant",
      panel: Panel.Plants,
      imageIcon: findCropIcon(point.body.openfarm_slug),
      path: Path.plants(point.body.id),
      location: {
        x: point.body.x, y: point.body.y, z: point.body.z,
      },
    })),
    ...selectAllGenericPointers(index).map(point => ({
      id: `point:${point.uuid}`,
      uuid: point.uuid,
      name: point.body.name,
      kind: "point",
      panel: Panel.Points,
      path: Path.points(point.body.id),
      location: {
        x: point.body.x, y: point.body.y, z: point.body.z,
      },
    })),
    ...selectAllWeedPointers(index).map(point => ({
      id: `weed:${point.uuid}`,
      uuid: point.uuid,
      name: point.body.name,
      kind: "weed",
      panel: Panel.Weeds,
      path: Path.weeds(point.body.id),
      location: {
        x: point.body.x, y: point.body.y, z: point.body.z,
      },
    })),
    ...slots.map(slot => ({
      id: `tool-slot:${slot.uuid}`,
      uuid: slot.uuid,
      name: slot.body.name,
      kind: "tool slot",
      panel: Panel.Tools,
      path: Path.toolSlots(slot.body.id),
      location: {
        x: slot.body.x, y: slot.body.y, z: slot.body.z,
      },
      aliases: [
        "slot",
        tools.find(tool => tool.body.id == slot.body.tool_id)?.body.name || "",
      ],
    })),
  ];
  const mountedToolId = maybeGetDevice(index)?.body.mounted_tool_id;
  tools.map(tool => {
    const slot = slots.find(item => item.body.tool_id == tool.body.id);
    const mounted = !!tool.body.id && mountedToolId == tool.body.id;
    const location = slot
      ? { x: slot.body.x, y: slot.body.y, z: slot.body.z }
      : undefined;
    let deleteUnavailable: string | undefined;
    if (mounted) {
      deleteUnavailable = t("Cannot delete while mounted.");
    } else if (slot) {
      deleteUnavailable = t("Cannot delete while in a slot.");
    }
    resources.push({
      id: `tool:${tool.uuid}`,
      uuid: tool.uuid,
      name: tool.body.name || t("Unnamed tool"),
      kind: "tool",
      panel: Panel.Tools,
      path: Path.tools(tool.body.id),
      location,
      aliases: slot ? [slot.body.name] : [],
      deleteUnavailable,
    });
  });
  return resources.map(data => locatedResourceCommand(props, data));
};

interface NavigationResourceCommandData {
  id: string;
  name: string;
  kind: string;
  panel: Panel;
  path: string;
  garden?: boolean;
  gardenId?: number;
}

const resourceNavigationCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const resources: NavigationResourceCommandData[] = [
    ...selectAllCurves(index).map(resource => ({
      id: `curve:${resource.uuid}`,
      name: resource.body.name || t("Unnamed curve"),
      kind: "curve",
      panel: Panel.Curves,
      path: Path.curves(resource.body.id),
    })),
    ...selectAllPointGroups(index).map(resource => {
      const name = resource.body.name || t("Unnamed group");
      const memberCount = resource.body.member_count || 0;
      return {
        id: `group:${resource.uuid}`,
        name: `${name} (${memberCount})`,
        kind: "group",
        panel: Panel.Groups,
        path: Path.groups(resource.body.id),
      };
    }),
    ...selectAllSavedGardens(index).map(resource => ({
      id: `garden:${resource.uuid}`,
      name: resource.body.name || t("Unnamed garden"),
      kind: "garden",
      panel: Panel.SavedGardens,
      path: Path.savedGardens(resource.body.id),
      garden: true,
      gardenId: resource.body.id,
    })),
    ...selectAllSceneObjects(index).map(resource => ({
      id: `scene-object:${resource.uuid}`,
      name: resource.body.name || t("Unnamed scene object"),
      kind: "scene object",
      panel: Panel.SceneObjects,
      path: Path.sceneObjects(resource.body.id),
    })),
  ];
  const plantCount = selectAllPlantPointers(index).length;
  return resources.map(resource => {
    const open = openResource(props, resource.path);
    const actions: CommandAction[] = [{
      id: "open",
      ...localized("Open"),
      aliases: ["edit", "view", "navigate"],
      execute: open,
    }];
    if (resource.garden) {
      let applyUnavailable: string | undefined;
      if (!resource.gardenId) {
        applyUnavailable = t("Save before applying.");
      } else if (plantCount > 0) {
        applyUnavailable = `${t("Please clear current garden first.")}`
          + ` (${plantCount} ${t("plants")})`;
      }
      actions.push({
        id: "apply",
        ...localized("Apply"),
        aliases: ["use garden", "plant garden"],
        unavailable: applyUnavailable,
        execute: () => {
          if (!resource.gardenId || plantCount > 0) { return; }
          return props.dispatch(applyGarden(
            props.navigate, resource.gardenId));
        },
      });
    }
    return {
      id: resource.id,
      ...localized(resource.name),
      aliases: [resource.kind, `Open ${resource.kind} ${resource.name}`],
      group: "resources" as const,
      imageIcon: TAB_ICON[resource.panel],
      themeAwareImageIcon: true,
      actions,
      execute: open,
    };
  });
};

const cameraCommands = (props: BuildCommandProps): Command[] => {
  const index = props.state.resources.index;
  const getValue = getWebAppConfigValueFromResources(index);
  const is3D = !!getValue(BooleanSetting.three_d_garden);
  const unavailable = is3D
    ? undefined
    : t("Enable the 3D Garden setting first.");
  const perspective = props.state.resources.consumers.farm_designer
    .threeDPerspective ?? true;
  const cameraFollow = props.state.resources.consumers.farm_designer
    .threeDCameraFollow;
  const utmFollow = props.state.resources.consumers.farm_designer
    .threeDUTMFollow;
  const execute = () => cameraFollow || utmFollow
    ? info(t(utmFollow
      ? UTM_FOLLOW_PERSPECTIVE_REQUIRED
      : CAMERA_FOLLOW_PERSPECTIVE_REQUIRED))
    : props.dispatch({
      type: Actions.SET_3D_PERSPECTIVE,
      payload: !perspective,
    });
  const viewActions: CommandAction[] = [
    {
      id: "toggle-perspective",
      ...localized("Toggle Perspective"),
      unavailable,
      execute,
    },
    {
      id: "reset-view",
      ...localized("Reset"),
      unavailable,
      execute: () => props.dispatch({
        type: Actions.SET_3D_VIEW,
        payload: { reset: true, nonce: Date.now() },
      }),
    },
    {
      id: "follow-camera",
      ...localized("Follow Camera"),
      unavailable,
      execute: () => props.dispatch({
        type: Actions.SET_3D_CAMERA_FOLLOW,
        payload: !cameraFollow,
      }),
    },
    {
      id: "follow-utm",
      ...localized("Follow UTM"),
      unavailable,
      execute: () => props.dispatch({
        type: Actions.SET_3D_UTM_FOLLOW,
        payload: !utmFollow,
      }),
    },
  ];
  const result: Command[] = [{
    id: "camera:view",
    ...localized("3D Camera View"),
    aliases: ["3d", "camera", "projection", "perspective", "reset view"],
    group: "map",
    icon: "cube",
    actions: viewActions,
    execute: viewActions[0].execute,
  }];
  const orbitCommand = (
    id: string,
    title: string,
    targets: [string, [number, number, number]][],
  ): Command => {
    const actions = targets.map(([name, direction]) => ({
      id: name.toLowerCase().replace(/ /g, "-"),
      name,
      englishName: name,
      aliases: ["camera", "view", "cube", direction.join(" ")],
      unavailable,
      execute: () => props.dispatch({
        type: Actions.SET_3D_VIEW,
        payload: { direction, nonce: Date.now() },
      }),
    }));
    return {
      id: `camera:orbit:${id}`,
      ...localized(title),
      aliases: ["camera", "view", "cube", "orbit"],
      group: "map",
      icon: "cube",
      actions,
      execute: actions[0].execute,
    };
  };
  result.push(
    orbitCommand("top", "Orbit to Top", [
      ["Top", [0, 0, 1]],
      ["Top +X", [1, 0, 1]],
      ["Top +Y", [0, 1, 1]],
      ["Top -X", [-1, 0, 1]],
      ["Top -Y", [0, -1, 1]],
    ]),
    orbitCommand("corner", "Orbit to Corner", [
      ["+X -Y", [1, -1, 1]],
      ["+X +Y", [1, 1, 1]],
      ["-X +Y", [-1, 1, 1]],
      ["-X -Y", [-1, -1, 1]],
    ]),
    orbitCommand("side", "Orbit to Side", [
      ["+X -Y", [1, -1, 0]],
      ["+X", [1, 0, 0]],
      ["+X +Y", [1, 1, 0]],
      ["+Y", [0, 1, 0]],
      ["-X +Y", [-1, 1, 0]],
      ["-X", [-1, 0, 0]],
      ["-X -Y", [-1, -1, 0]],
      ["-Y", [0, -1, 0]],
    ]),
  );
  return result;
};

const lowerSettingsPriority = (command: Command): Command =>
  command.group == "settings"
    ? { ...command, priority: (command.priority || 0) - 1 }
    : command;

export const buildCommands = (props: BuildCommandProps): Command[] => [
  ...panelCommands(props),
  shopCommand(),
  followFarmBotCommand(),
  logoutCommand(),
  ...popupCommands(props),
  timeTravelCommand(props),
  deleteAllLogsCommand(),
  clearRecentsCommand(),
  ...controlsCommands(props),
  ...inventorySectionCommands(props),
  ...photoSectionCommands(props),
  ...metricSectionCommands(props),
  ...sectionViewCommands(props),
  selectionCommand(props),
  laserCommand(props),
  ...mapViewCommands(props),
  ...settingsSectionCommands(props),
  ...settingsItemCommands(props),
  setupWizardCommand(props),
  ...helpCommands(props),
  ...booleanSettingCommands(props),
  ...webAppValueSettingCommands(props),
  ...configValueSettingCommands(props),
  ...threeDSettingCommands(props),
  ...cameraCommands(props),
  ...relativeMoveCommands(props),
  ...homeCommands(props),
  ...simplePanelCommands(props),
  cameraCommand(props),
  powerCommand(props),
  ...directDeviceCommands(props),
  ...moveToCommands(props),
  ...locatedResourceCommands(props),
  ...sensorCommands(props),
  ...peripheralCommands(props),
  ...sequenceCommands(props),
  ...regimenCommands(props),
  gardenCommand(props),
  ...addCommands(props),
  ...resourceNavigationCommands(props),
].map(lowerSettingsPriority);
