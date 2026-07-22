import React from "react";
import { isNumber, startCase } from "lodash";
import { NavigateFunction } from "react-router";
import {
  ALLOWED_PIN_MODES, ANALOG, TaggedGenericPointer, uuid, Xyz,
} from "farmbot";
import { Axis } from "../devices/interfaces";
import {
  ControlsState, Everything, PopupsState, SettingsPanelState,
} from "../interfaces";
import { Command, CommandAction } from "./interfaces";
import { t } from "../i18next_wrapper";
import {
  Actions, CAMERA_FOLLOW_PERSPECTIVE_REQUIRED, Content, DeviceSetting,
  UTM_FOLLOW_PERSPECTIVE_REQUIRED,
} from "../constants";
import {
  Panel, PANEL_SLUG, PANEL_TITLE, getPanelPath, setPanelOpen,
  TAB_ICON,
} from "../farm_designer/panel_header";
import { getLinks } from "../nav/nav_links";
import { FilePath, Icon, PAGE_SLUGS, Path } from "../internal_urls";
import {
  BooleanSetting, NumericSetting, StringSetting,
} from "../session_keys";
import {
  getWebAppConfigValueFromResources, setWebAppConfigValue,
} from "../config_storage/actions";
import {
  emergencyLock, emergencyUnlock, execSequence, findAxisLength, findHome,
  moveAbsolute, moveRelative, moveToHome, pinToggle, powerOff, readStatus,
  readPin, reboot, restartFirmware, setHome, sync, takePhoto, writePin,
  updateConfig, updateMCU, ConfigKey,
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
import { urlFriendly } from "../util";
import { ToggleButton } from "../ui";
import { VIEW_PRISM_TARGETS } from "../three_d_garden/view_prism";
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

interface BuildCommandProps {
  state: Everything;
  dispatch: Function;
  navigate: NavigateFunction;
}

const localized = (english: string) => ({
  name: t(english),
  englishName: english,
});

const settingLabelOverrides: Record<string, string> = {
  disable_i18n: "Internationalize web app",
  enable_3d_electronics_box_top: "Enable 3D Electronics Box",
  param_e_stop_on_mov_err: "E-Stop on Movement Error",
  param_mov_nr_retry: "Max Retries",
  movement_step_per_mm: "Steps per mm",
  sequence_init_log: "Sequence Initialization Log",
  encoder_use_for_pos: "Encoder Use for Position",
};

const settingLabel = (key: string) => settingLabelOverrides[key]
  || startCase(key.replace(/^param_/, ""))
    .replace(/\b3 D\b/g, "3D")
    .replace(/\bSpd\b/g, "Speed")
    .replace(/\bNr\b/g, "Number")
    .replace(/^Pin Report\b/, "Pin Reporting");

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

const openPanel = (dispatch: Function, navigate: NavigateFunction, panel: Panel) => {
  dispatch(setPanelOpen(true));
  navigate(getPanelPath(panel));
};

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
  const panels = [Panel.Map, ...getLinks()];
  const specificCommands = panels.map(panel => {
    const title = PANEL_TITLE()[panel];
    const isMap = panel == Panel.Map;
    const open = () => {
      if (isMap) {
        props.dispatch(setPanelOpen(false));
        props.navigate(Path.designer());
      } else {
        openPanel(props.dispatch, props.navigate, panel);
      }
    };
    const close = () => {
      props.dispatch(setPanelOpen(false));
      props.navigate(Path.designer());
    };
    const active = isMap
      ? !props.state.resources.consumers.farm_designer.panelOpen
      : Path.getSlug(Path.designer()) == PANEL_SLUG[panel]
        && props.state.resources.consumers.farm_designer.panelOpen;
    return {
      id: `panel:${PANEL_SLUG[panel] || "map"}`,
      ...sectionCommandText(panel, title,
        ["show", "hide", "navigation", "sidebar"]),
      group: "navigation" as const,
      imageIcon: TAB_ICON[panel],
      themeAwareImageIcon: true,
      execute: active ? close : open,
    };
  });
  return [genericCommand, ...specificCommands];
};

const shopCommand = (): Command => ({
  id: "shop",
  ...localized("Shop"),
  aliases: ["store", "farm.bot", "website", "buy"],
  group: "navigation",
  imageIcon: TAB_ICON[Panel.Shop],
  themeAwareImageIcon: true,
  execute: () => window.open(
    ExternalUrl.Store.home, "_blank", "noopener,noreferrer"),
});

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
  const names: Record<PopupCommandKey, string> = {
    controls: "Controls",
    connectivity: "Connectivity",
    jobs: "Jobs and Logs",
  };
  const icons: Partial<Record<PopupCommandKey, string>> = {
    connectivity: "wifi",
    jobs: "history",
  };
  return (Object.keys(names) as PopupCommandKey[]).map(key => ({
    id: `popup:${key}`,
    ...sectionCommandText(names[key], t(names[key]),
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
  return (Object.keys(names) as (keyof ControlsState)[]).map(key => ({
    id: `controls:${key}`,
    ...sectionCommandText(`Controls > ${names[key]}`,
      `${t("Controls")} > ${t(names[key])}`,
      ["control", "popup", "tab", "show", "hide"]),
    group: "controls",
    imageIcon: TAB_ICON[Panel.Controls],
    themeAwareImageIcon: true,
    execute: () => {
      const selected = props.state.app.controls[key];
      if (props.state.app.popups.controls && selected) {
        props.dispatch({ type: Actions.TOGGLE_POPUP, payload: "controls" });
      } else {
        props.dispatch({ type: Actions.OPEN_POPUP, payload: "controls" });
        props.dispatch({ type: Actions.SET_CONTROLS_PANEL_OPTION, payload: key });
      }
    },
  }));
};

const inventorySectionCommands = (props: BuildCommandProps): Command[] => {
  const groups = [
    {
      id: "plants", panel: Panel.Plants,
      state: props.state.app.plantsPanelState,
      action: Actions.TOGGLE_PLANTS_PANEL_OPTION,
    },
    {
      id: "weeds", panel: Panel.Weeds,
      state: props.state.app.weedsPanelState,
      action: Actions.TOGGLE_WEEDS_PANEL_OPTION,
    },
    {
      id: "points", panel: Panel.Points,
      state: props.state.app.pointsPanelState,
      action: Actions.TOGGLE_POINTS_PANEL_OPTION,
    },
    {
      id: "curves", panel: Panel.Curves,
      state: props.state.app.curvesPanelState,
      action: Actions.TOGGLE_CURVES_PANEL_OPTION,
    },
    {
      id: "sequences", panel: Panel.Sequences,
      state: props.state.app.sequencesPanelState,
      action: Actions.TOGGLE_SEQUENCES_PANEL_OPTION,
    },
  ];
  return groups.flatMap(group => Object.keys(group.state).map(section => {
    const groupName = startCase(group.id);
    const sectionName = startCase(section);
    return {
      id: `section:${group.id}:${section}`,
      ...sectionCommandText(`${groupName} > ${sectionName}`,
        `${t(groupName)} > ${t(sectionName)}`,
        ["accordion", "expand", "collapse", "show", "hide"]),
      group: "navigation" as const,
      imageIcon: TAB_ICON[group.panel],
      themeAwareImageIcon: true,
      execute: () => {
        props.dispatch({ type: group.action, payload: section });
        openPanel(props.dispatch, props.navigate, group.panel);
      },
    };
  }));
};

type PhotoTopLevelSection = Exclude<keyof PhotosPanelState,
  "calibrationPP" | "detectionPP">;

const photoSectionCommands = (props: BuildCommandProps): Command[] => {
  const sections: [PhotoTopLevelSection, string][] = [
    ["filter", "Filter map photos"],
    ["camera", "Camera settings"],
    ["calibration", "Camera calibration"],
    ["detection", "Weed detection"],
    ["measure", "Measure soil height"],
    ["manage", "Manage data"],
  ];
  return sections
    .filter(([section]) => section != "manage"
      || DevSettings.futureFeaturesEnabled())
    .map(([section, title]) => ({
      id: `section:photos:${section}`,
      ...sectionCommandText(`Photos > ${title}`,
        `${t("Photos")} > ${t(title)}`,
        ["photos", "accordion", "expand", "show"]),
      group: "navigation" as const,
      imageIcon: TAB_ICON[Panel.Photos],
      themeAwareImageIcon: true,
      execute: () => {
        props.dispatch({
          type: Actions.BULK_TOGGLE_PHOTOS_PANEL,
          payload: false,
        });
        props.dispatch({
          type: Actions.TOGGLE_PHOTOS_PANEL_OPTION,
          payload: section,
        });
        openPanel(props.dispatch, props.navigate, Panel.Photos);
      },
    }));
};

const metricSectionCommands = (props: BuildCommandProps): Command[] =>
  (["realtime", "network", "history"] as const).map(section => ({
    id: `section:connectivity:${section}`,
    ...sectionCommandText(`Connectivity > ${startCase(section)}`,
      `${t("Connectivity")} > ${t(startCase(section))}`,
      ["network", "metrics", "quality", "history"]),
    group: "navigation",
    icon: "wifi",
    execute: () => {
      if (props.state.app.popups.connectivity
        && props.state.app.metricPanelState[section]) {
        props.dispatch({ type: Actions.TOGGLE_POPUP, payload: "connectivity" });
      } else {
        props.dispatch({ type: Actions.OPEN_POPUP, payload: "connectivity" });
        props.dispatch({ type: Actions.SET_METRIC_PANEL_OPTION, payload: section });
      }
    },
  }));

const profileCommands = (props: BuildCommandProps): Command[] => ([{
  id: "profile", name: "Map profile",
  open: props.state.resources.consumers.farm_designer.profileOpen,
  action: Actions.SET_PROFILE_OPEN,
}] as const).map(profile => ({
  id: `profile:${profile.id}`,
  ...sectionCommandText(profile.name, t(profile.name),
    ["section", "panel", "show", "hide"]),
  group: "map" as const,
  execute: () => props.dispatch({
    type: profile.action,
    payload: !profile.open,
  }),
}));

const sectionViewCommand = (props: BuildCommandProps): Command => {
  const designer = props.state.resources.consumers.farm_designer;
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
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
    actions,
    execute: actions[0].execute,
  };
};

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
  const sections: Record<keyof SettingsPanelState, string> = {
    farmbot_settings: "FarmBot",
    firmware: "Firmware",
    power_and_reset: "Power and Reset",
    axis_settings: "Axes",
    motors: "Motors",
    encoders_or_stall_detection: "Encoders or Stall Detection",
    limit_switches: "Limit Switches",
    error_handling: "Error Handling",
    pin_bindings: "Pin Bindings",
    pin_guard: "Pin Guard",
    pin_reporting: "Pin Reporting",
    parameter_management: "Parameter Management",
    custom_settings: "Custom Settings",
    farm_designer: "Farm Designer",
    three_d: "3D Garden",
    account: "Account",
    other_settings: "Other Settings",
  };
  const highlights: Record<keyof SettingsPanelState, DeviceSetting> = {
    farmbot_settings: DeviceSetting.farmbotSettings,
    firmware: DeviceSetting.firmware,
    power_and_reset: DeviceSetting.powerAndReset,
    axis_settings: DeviceSetting.axisSettings,
    motors: DeviceSetting.motors,
    encoders_or_stall_detection: DeviceSetting.encoders,
    limit_switches: DeviceSetting.limitSwitchSettings,
    error_handling: DeviceSetting.errorHandling,
    pin_bindings: DeviceSetting.pinBindings,
    pin_guard: DeviceSetting.pinGuard,
    pin_reporting: DeviceSetting.pinReporting,
    parameter_management: DeviceSetting.parameterManagement,
    custom_settings: DeviceSetting.customSettings,
    farm_designer: DeviceSetting.farmDesigner,
    three_d: DeviceSetting.threeDGarden,
    account: DeviceSetting.accountSettings,
    other_settings: DeviceSetting.otherSettings,
  };
  return (Object.keys(sections) as (keyof SettingsPanelState)[]).map(key => ({
    id: `settings-section:${key}`,
    ...sectionCommandText(`Settings > ${sections[key]}`,
      `${t("Settings")} > ${t(sections[key])}`,
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
      props.navigate(Path.settings(urlFriendly(highlights[key]).toLowerCase()));
    },
  }));
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
  const pages: {
    id: string;
    title: string;
    path: string;
    icon?: string;
    imageIcon?: string;
  }[] = [
    {
      id: "software", title: "Software Documentation", path: Path.help(),
      imageIcon: FilePath.icon(Icon.documentation),
    },
    {
      id: "developer", title: "Developer Documentation",
      path: Path.developer(), imageIcon: FilePath.icon(Icon.developer),
    },
    {
      id: "genesis", title: "Genesis Documentation",
      path: Path.designer("genesis"),
      imageIcon: FilePath.image("favicon", "png"),
    },
    {
      id: "express", title: "Express Documentation",
      path: Path.designer("express"),
      imageIcon: FilePath.image("favicon", "png"),
    },
    {
      id: "business", title: "Business Documentation",
      path: Path.designer("business"), imageIcon: FilePath.icon(Icon.shop),
    },
    {
      id: "education", title: "Education Documentation",
      path: Path.designer("education"), icon: "graduation-cap",
    },
    {
      id: "tours", title: "Take a Tour", path: Path.tours(), icon: "share",
    },
    {
      id: "support", title: "Get Help", path: Path.support(),
      imageIcon: FilePath.icon(Icon.support),
    },
  ];
  const commands: Command[] = pages.map(page => {
    const { id, title, path, icon, imageIcon } = page;
    const englishName = `Help > ${title}`;
    const name = `${t("Help")} > ${t(title)}`;
    return {
      id: `help:${id}`,
      name,
      englishName,
      aliases: [
        `Open ${englishName}`,
        `${t("Open")} ${name}`,
        `Navigate to ${englishName}`,
        `${t("Navigate to")} ${name}`,
        `Go to ${englishName}`,
        `${t("Go to")} ${name}`,
        "docs",
        "documentation",
        "support",
      ],
      group: "navigation",
      icon,
      imageIcon,
      imageIconClass: imageIcon ? "help-header-icon" : undefined,
      execute: () => {
        props.dispatch(setPanelOpen(true));
        props.navigate(path);
      },
    };
  });
  if (!isMobile()) {
    commands.push({
      id: "help:hotkeys",
      name: `${t("Help")} > ${t("Hotkeys")}`,
      englishName: "Help > Hotkeys",
      aliases: ["keyboard shortcuts", "shortcut help", "key bindings"],
      group: "navigation",
      icon: "keyboard-o",
      execute: toggleHotkeyHelpOverlay,
    });
  }
  return commands;
};

const boolSettingLabels: Partial<Record<string, string>> = {
  [BooleanSetting.legend_menu_open]: "Map Legend",
  [BooleanSetting.show_plants]: DeviceSetting.showPlantsMapLayer,
  [BooleanSetting.show_points]: DeviceSetting.showPointsMapLayer,
  [BooleanSetting.show_weeds]: DeviceSetting.showWeedsMapLayer,
  [BooleanSetting.show_historic_points]: DeviceSetting.showRemovedWeedsMapLayer,
  [BooleanSetting.show_soil_interpolation_map]:
    DeviceSetting.showSoilInterpolationMapLayer,
  [BooleanSetting.show_spread]: DeviceSetting.showSpreadMapLayer,
  [BooleanSetting.show_farmbot]: DeviceSetting.showFarmbotMapLayer,
  [BooleanSetting.show_images]: DeviceSetting.showPhotosMapLayer,
  [BooleanSetting.show_zones]: DeviceSetting.showAreasMapLayer,
  [BooleanSetting.show_sensor_readings]: DeviceSetting.showReadingsMapLayer,
  [BooleanSetting.show_moisture_interpolation_map]:
    DeviceSetting.showMoistureInterpolationMapLayer,
  [BooleanSetting.dark_mode]: DeviceSetting.darkMode,
  [BooleanSetting.three_d_garden]: DeviceSetting.threeDGarden,
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

const MAP_LAYER_SETTINGS = new Set<string>([
  BooleanSetting.show_plants,
  BooleanSetting.show_points,
  BooleanSetting.show_soil_interpolation_map,
  BooleanSetting.show_weeds,
  BooleanSetting.show_spread,
  BooleanSetting.show_farmbot,
  BooleanSetting.show_images,
  BooleanSetting.show_zones,
  BooleanSetting.show_sensor_readings,
  BooleanSetting.show_moisture_interpolation_map,
  BooleanSetting.three_d_garden,
]);

const booleanSettingCommands = (props: BuildCommandProps): Command[] => {
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  return Object.values(BooleanSetting)
    .filter(setting => ![
      BooleanSetting.home_button_homing,
      BooleanSetting.show_first_party_farmware,
      BooleanSetting.stub_config,
    ].includes(setting))
    .map(setting => {
      const englishLabel = boolSettingLabels[setting] || settingLabel(setting);
      const current = !!getValue(setting);
      const inverted = setting == BooleanSetting.disable_i18n;
      const enabled = inverted ? !current : current;
      const set = (value: boolean) => {
        const confirmation = boolSettingConfirmations[setting];
        if (!current && value && confirmation && !confirm(t(confirmation))) {
          return false;
        }
        props.dispatch(setWebAppConfigValue(setting, inverted ? !value : value));
        return true;
      };
      const execute = () => set(!enabled);
      return {
        id: `setting:${setting}:toggle`,
        ...localized(englishLabel),
        aliases: [
          `Toggle ${englishLabel}`,
          `${t("Toggle")} ${t(englishLabel)}`,
          "enable", "disable", "show", "hide", "open", "close", setting,
        ],
        group: MAP_LAYER_SETTINGS.has(setting)
          ? "map" as const
          : "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        execute,
        toggleValue: enabled,
        accessory: toggleAccessory(enabled),
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
): SettingValueMetadata => {
  if (setting.endsWith("_log") || setting == NumericSetting.beep_verbosity) {
    return { min: 0, max: 3, step: 1, options: verbosityOptions };
  }
  switch (setting) {
    case NumericSetting.bot_origin_quadrant:
      return {
        min: 1, max: 4, step: 1,
        options: [1, 2, 3, 4].map(value => ({
          label: String(value), value: String(value),
        })),
      };
    case NumericSetting.zoom_level:
      return { min: -8, max: 4, step: 1 };
    case NumericSetting.map_size_x:
    case NumericSetting.map_size_y:
    case NumericSetting.default_plant_depth:
      return { min: 0, step: 1 };
    case NumericSetting.viewpoint_heading:
      return {
        min: 0, max: 315, step: 45,
        options: [0, 45, 90, 135, 180, 225, 270, 315]
          .map(value => ({ label: `${value}°`, value: String(value) })),
      };
    default:
      return {};
  }
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

const stringSettingMetadata = (
  setting: string,
  current: string,
): SettingValueMetadata => {
  const options = setting == StringSetting.go_button_axes
    ? ["X", "Y", "Z", "XY", "XYZ"]
      .map(value => ({ label: value, value }))
    : Object.entries(PAGE_SLUGS())
      .map(([value, label]) => ({ value, label }));
  if (current && !options.some(option => option.value == current)) {
    options.push({ value: current, label: `${current} (${t("Current")})` });
  }
  return { options };
};

const webAppValueSettingCommands = (props: BuildCommandProps): Command[] => {
  const getValue = getWebAppConfigValueFromResources(
    props.state.resources.index);
  const numbers = Object.values(NumericSetting)
    .filter(setting => !["id", "device_id"].includes(setting))
    .map(setting => ({ setting, type: "number" as const }));
  const strings = [StringSetting.landing_page, StringSetting.go_button_axes]
    .map(setting => ({ setting, type: "text" as const }));
  return [...numbers, ...strings].map(({ setting, type }) => {
    const baseLabel = settingLabel(setting);
    const label = setting.endsWith("_log")
      ? `${baseLabel} Verbosity`
      : baseLabel;
    const current = String(getValue(setting) ?? "");
    const metadata = type == "number"
      ? numericSettingMetadata(setting)
      : stringSettingMetadata(setting, current);
    const validate = (values: Record<string, string>) =>
      validSettingValue(values, type, metadata);
    const execute = (values?: Record<string, string>) => {
      if (!values || validate(values)) { return false; }
      return props.dispatch(setWebAppConfigValue(setting,
        type == "number" ? Number(values.value) : values.value));
    };
    const action: CommandAction = {
      id: "set",
      ...localized("Set"),
      input: {
        fields: [{
          key: "value", label: t(label), type,
          initialValue: current,
          min: metadata.min,
          max: metadata.max,
          step: metadata.step,
          options: metadata.options,
        }],
        validate,
      },
      execute,
    };
    return {
      id: `setting:${setting}:set`,
      ...localized(label),
      aliases: [
        "change", "update", setting, `Set ${label}`, t(`Set ${label}`),
      ],
      group: "settings",
      imageIcon: TAB_ICON[Panel.Settings],
      themeAwareImageIcon: true,
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

const configValueSettingCommands = (props: BuildCommandProps): Command[] => {
  const ignored = [
    "id", "device_id", "created_at", "updated_at",
    "arduino_debug_messages", "disable_factory_reset", "os_auto_update",
  ];
  const supportedFbosValues = new Set([
    "safe_height", "soil_height", "gantry_height",
    "default_axis_order", "update_channel",
  ]);
  const fbosConfig = getFbosConfig(props.state.resources.index);
  const firmwareConfig = getFirmwareConfig(props.state.resources.index);
  const fbosCommands = Object.entries(fbosConfig?.body || {})
    .filter(([key, value]) => !ignored.includes(key)
      && (typeof value == "boolean" || supportedFbosValues.has(key)))
    .map(([key, value]) => {
      const label = settingLabel(key);
      if (typeof value == "boolean") {
        return {
          id: `fbos-setting:${key}:toggle`,
          ...localized(label),
          aliases: [
            `FarmBot setting ${label}`,
            t(`FarmBot setting ${label}`),
            `Toggle FarmBot setting ${label}`,
            "fbos", "device", "enable", "disable", key,
          ],
          group: "settings" as const,
          imageIcon: TAB_ICON[Panel.Settings],
          themeAwareImageIcon: true,
          execute: () => props.dispatch(updateConfig({
            [key]: !value,
          })),
          toggleValue: value,
          accessory: key.endsWith("_log")
            ? toggleAccessory(value)
            : undefined,
        };
      }
      const metadata = fbosValueMetadata(key);
      const type = typeof value == "number" ? "number" as const : "text" as const;
      const validate = (values: Record<string, string>) =>
        validSettingValue(values, type, metadata);
      const execute = (values?: Record<string, string>) => {
        if (!values || validate(values)) { return false; }
        if (key == "update_channel" && values.value != "stable"
          && !confirm(Content.UNSTABLE_RELEASE_CHANNEL_WARNING)) {
          return false;
        }
        return props.dispatch(updateConfig({
          [key]: typeof value == "number"
            ? Number(values.value)
            : values.value,
        }));
      };
      const action: CommandAction = {
        id: "set",
        ...localized("Set"),
        input: {
          fields: [{
            key: "value", label: t(label),
            type,
            initialValue: String(value),
            options: metadata.options,
          }],
          validate,
        },
        execute,
      };
      return {
        id: `fbos-setting:${key}:set`,
        ...localized(label),
        aliases: [
          "fbos", "device", "change", key,
          `Set FarmBot setting ${label}`,
          t(`Set FarmBot setting ${label}`),
        ],
        group: "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        actions: [action],
        execute,
      };
    });
  const firmwareEntries = Object.entries(firmwareConfig?.body || {})
    .filter(([key, value]) => !ignored.includes(key)
      && !["param_test", "param_use_eeprom", "param_version"].includes(key)
      && typeof value == "number") as [string, number][];
  const firmwareValues = new Map(firmwareEntries);
  const axes: Xyz[] = ["x", "y", "z"];
  const axisGroupBases = new Set(firmwareEntries.flatMap(([key]) => {
    const match = key.match(/^(.*)_[xyz]$/);
    const base = match?.[1];
    return base && axes.every(axis => firmwareValues.has(`${base}_${axis}`))
      ? [base]
      : [];
  }));
  const handledAxisGroups = new Set<string>();
  const firmwareSettingLabel = settingLabel;
  const firmwareCommands = firmwareEntries.flatMap<Command>(([key, value]) => {
    const match = key.match(/^(.*)_[xyz]$/);
    const base = match?.[1];
    if (base && axisGroupBases.has(base)) {
      if (handledAxisGroups.has(base)) { return []; }
      handledAxisGroups.add(base);
      const keys = axes.map(axis => `${base}_${axis}`);
      const label = firmwareSettingLabel(base);
      const encoderSetting = base.startsWith("encoder_");
      const englishName = encoderSetting
        ? `Settings > Encoders > ${label}`
        : label;
      const booleanSetting = keys.every(isBooleanMcuParam);
      const actions: CommandAction[] = axes.map((axis, index) => {
        const axisLabel = firmwareSettingLabel(keys[index]);
        return {
          id: axis,
          ...localized(axis.toUpperCase()),
          aliases: [
            keys[index],
            `Set firmware setting ${axisLabel}`,
            t(`Set firmware setting ${axisLabel}`),
          ],
          input: {
            fields: [{
              key: axis,
              label: axis.toUpperCase(),
              type: booleanSetting ? "boolean" : "number",
              initialValue: String(firmwareValues.get(keys[index]) ?? ""),
            }],
            validate: booleanSetting
              ? undefined
              : values => validNumberInput({ value: values[axis] }),
          },
          execute: values => props.dispatch(updateMCU(
            keys[index] as ConfigKey, values?.[axis] || "")),
        };
      });
      return [{
        id: `firmware-setting:${base}:set`,
        name: encoderSetting
          ? `${t("Settings")} > ${t("Encoders")} > ${t(label)}`
          : t(englishName),
        englishName,
        aliases: [
          "mcu", "hardware", "change", base,
          `Set firmware setting ${label}`,
        ],
        group: "settings" as const,
        imageIcon: TAB_ICON[Panel.Settings],
        themeAwareImageIcon: true,
        actions,
        actionTable: true,
        execute: actions[0].execute,
      }];
    }
    const label = firmwareSettingLabel(key);
    const encoderSetting = key.startsWith("encoder_");
    const englishName = encoderSetting
      ? `Settings > Encoders > ${label}`
      : label;
    const command = {
      id: `firmware-setting:${key}:set`,
      name: encoderSetting
        ? `${t("Settings")} > ${t("Encoders")} > ${t(label)}`
        : t(englishName),
      englishName,
      aliases: [
        "mcu", "hardware", "change", key,
        `Set firmware setting ${label}`,
        t(`Set firmware setting ${label}`),
      ],
      group: "settings" as const,
      imageIcon: TAB_ICON[Panel.Settings],
      themeAwareImageIcon: true,
    };
    if (isBooleanMcuParam(key)) {
      const execute = () => props.dispatch(updateMCU(
        key as ConfigKey, value === 0 ? "1" : "0"));
      return [{
        ...command,
        execute,
        toggleValue: value !== 0,
        accessory: toggleAccessory(value !== 0),
      }];
    }
    const execute = (values?: Record<string, string>) =>
      props.dispatch(updateMCU(key as ConfigKey, values?.value || ""));
    const action: CommandAction = {
      id: "set",
      ...localized("Set"),
      input: {
        fields: [{
          key: "value", label: t(label), type: "number",
          initialValue: String(value),
        }],
        validate: validNumberInput,
      },
      execute,
    };
    return [{
      ...command,
      actions: [action],
      execute,
    }];
  });
  return [...fbosCommands, ...firmwareCommands];
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
  const setActions = axisActions(cartesianAxes, setHome);
  const grouped: Command[] = [
    {
      id: "farmbot:find-home",
      ...localized("Find home"),
      aliases: ["home", "zero", "calibrate", "axis"],
      group: "farmbot",
      icon: "home",
      unavailable,
      actions: findActions,
      execute: findActions[0].execute,
    },
    {
      id: "farmbot:move-home",
      ...localized("Move home"),
      aliases: ["move to home", "home", "zero", "axis"],
      group: "farmbot",
      icon: "home",
      unavailable,
      actions: moveActions,
      execute: moveActions[0].execute,
    },
    {
      id: "farmbot:find-length",
      ...localized("Find axis length"),
      aliases: ["zero", "calibrate", "axis"],
      group: "farmbot",
      icon: "search",
      unavailable,
      actions: lengthActions,
      execute: lengthActions[0].execute,
    },
    {
      id: "farmbot:set-home",
      ...localized("Set home"),
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

const directDeviceCommands = (props: BuildCommandProps): Command[] => {
  const unavailable = commandUnavailable(props);
  const unlock = () => {
    if (!confirm(t("Are you sure you want to unlock the device?"))) {
      return false;
    }
    return emergencyUnlock(true);
  };
  const verifyTool = () => {
    const sensors = selectAllSensors(props.state.resources.index);
    const pin = getToolVerificationPin(sensors);
    return readPin(pin, `pin${pin}`, 0);
  };
  const commands: [string, string, () => unknown, string?][] = [
    ["estop", "E-Stop", emergencyLock],
    ["unlock", "Unlock", unlock],
    ["sync", "Sync FarmBot", () => props.dispatch(sync())],
    ["status", "Read FarmBot status", readStatus],
    ["verify-tool", "Verify tool", verifyTool],
    ["photo", "Take photo", takePhoto],
    ["calibrate-camera", "Calibrate Camera", calibrateCamera],
    ["detect-weeds", "Detect Weeds", detectWeeds],
    ["measure-soil-height", "Measure Soil Height", measureSoilHeight],
    ["reboot", "Reboot FarmBot", reboot],
    ["shutdown", "Shutdown FarmBot", powerOff],
    ["firmware-restart", "Restart firmware", restartFirmware],
  ];
  const icons: Record<string, string> = {
    estop: "pause",
    unlock: "unlock",
    sync: "refresh",
    reboot: "power-off",
    shutdown: "power-off",
    "firmware-restart": "power-off",
  };
  const imageIcons: Record<string, string> = {
    photo: TAB_ICON[Panel.Photos],
    "calibrate-camera": TAB_ICON[Panel.Photos],
    "detect-weeds": TAB_ICON[Panel.Photos],
    "measure-soil-height": TAB_ICON[Panel.Photos],
    "verify-tool": TAB_ICON[Panel.Tools],
  };
  const priorities: Record<string, number> = {
    estop: 2,
    unlock: 1,
  };
  return commands.map(([id, name, execute, reason]) => ({
    id: `farmbot:${id}`,
    priority: priorities[id],
    ...localized(name),
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
  const botXYZ = isNumber(botPosition.x)
    && isNumber(botPosition.y)
    && isNumber(botPosition.z)
    ? { x: botPosition.x, y: botPosition.y, z: botPosition.z }
    : undefined;
  const locationUnavailable = t("FarmBot position unknown.");
  const openAddPage = (path: string) => {
    props.dispatch(setPanelOpen(true));
    props.navigate(path);
  };
  const routes: [string, Panel, string, string, string, string][] = [
    ["plant", Panel.Plants, "Plants", "plant", "Add new", Path.cropSearch()],
    ["weed", Panel.Weeds, "Weeds", "weed", "Add new", Path.weeds("add")],
    ["event", Panel.FarmEvents, "Events", "farm event", "Add new",
      Path.farmEvents("add")],
    ["group", Panel.Groups, "Groups", "group", "Add new", Path.groups()],
    ["garden", Panel.SavedGardens, "Gardens", "garden", "Add new",
      Path.savedGardens("add")],
    ["zone", Panel.Zones, "Zones", "zone", "Add new", Path.zones("add")],
    ["scene-object", Panel.SceneObjects, "Scene Objects", "scene object",
      "Add new", Path.sceneObjects("add")],
    ["sensor", Panel.Sensors, "Sensors", "sensor", "Add new", Path.sensors()],
    ["tool", Panel.Tools, "Tools", "tool", "Add new tool", Path.tools("add")],
    ["tool-slot", Panel.Tools, "Tools", "tool slot", "Add new tool slot",
      Path.toolSlots("add")],
    ["farmware", Panel.Farmware, "Farmware", "Farmware", "Add new",
      Path.farmware("add")],
  ];
  const addCommandText = (
    panel: Panel, englishPanel: string, resource: string, action: string,
  ) => ({
    name: `${PANEL_TITLE()[panel]} > ${t(action)}`,
    englishName: `${englishPanel} > ${action}`,
    aliases: [
      `Add new ${resource}`,
      `${t("Add new")} ${t(resource)}`,
      `New ${resource}`,
      `${t("New")} ${t(resource)}`,
      "create",
      "plus",
    ],
  });
  const staticCommands: Command[] = routes.map(([
    id, panel, englishPanel, resource, action, path,
  ]) => ({
    id: `add:${id}`,
    ...addCommandText(panel, englishPanel, resource, action),
    group: "resources",
    imageIcon: TAB_ICON[panel],
    themeAwareImageIcon: true,
    execute: () => openAddPage(path),
  }));
  const point = designer.drawnPoint || {
    name: t("Created Point"),
    cx: undefined,
    cy: undefined,
    z: 0,
    r: 0,
    color: "green",
    at_soil_level: false,
  };
  const pointActions: CommandAction[] = [
    {
      id: "add-new",
      ...localized("Add new"),
      aliases: ["new point", "create point"],
      execute: () => openAddPage(Path.points("add")),
    },
    {
      id: "add-grid",
      ...localized("Add grid"),
      aliases: ["point grid", "grid of points", "point row"],
      execute: () => {
        openAddPage(Path.points("add"));
        if (!threeDGrid) {
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
      },
    },
    {
      id: "add-current",
      ...localized("Add at current location"),
      aliases: ["point here", "point at FarmBot", "current position"],
      unavailable: botXYZ ? undefined : locationUnavailable,
      execute: () => {
        if (!botXYZ) { return; }
        props.dispatch(crud.initSave<TaggedGenericPointer>("Point", {
          pointer_type: "GenericPointer",
          name: point.name || t("Created Point"),
          meta: {
            color: point.color,
            created_by: "farm-designer",
            type: "point",
            ...(point.at_soil_level
              ? { at_soil_level: "true" }
              : {}),
          },
          x: botXYZ.x,
          y: botXYZ.y,
          z: botXYZ.z,
          radius: point.r,
        }));
        props.dispatch({
          type: Actions.SET_DRAWN_POINT_DATA,
          payload: undefined,
        });
      },
    },
  ];
  staticCommands.push({
    id: "add:point",
    ...localized("Points"),
    aliases: ["add point", "new point", "create point"],
    group: "resources",
    imageIcon: TAB_ICON[Panel.Points],
    themeAwareImageIcon: true,
    actions: pointActions,
    execute: pointActions[0].execute,
  });
  ([CurveType.water, CurveType.spread, CurveType.height] as const)
    .map(type => staticCommands.push({
      id: `add:curve:${type}`,
      name: `${PANEL_TITLE()[Panel.Curves]} > ${t(startCase(type))}`
        + ` > ${t("Add new")}`,
      englishName: `Curves > ${startCase(type)} > Add new`,
      aliases: [
        `Add new ${type} curve`,
        `${t("Add new")} ${t(type)} ${t("curve")}`,
        `New ${type} curve`,
        "create",
        "plus",
      ],
      group: "resources",
      imageIcon: TAB_ICON[Panel.Curves],
      themeAwareImageIcon: true,
      execute: () => {
        props.dispatch(setPanelOpen(true));
        return props.dispatch(createCurve(type, props.navigate));
      },
    }));
  staticCommands.push({
    id: "add:sequence",
    ...addCommandText(Panel.Sequences, "Sequences", "sequence", "Add new"),
    group: "resources",
    imageIcon: TAB_ICON[Panel.Sequences],
    themeAwareImageIcon: true,
    execute: () => addNewSequenceToFolder(props.navigate),
  }, {
    id: "add:regimen",
    ...addCommandText(Panel.Regimens, "Regimens", "regimen", "Add new"),
    group: "resources",
    imageIcon: TAB_ICON[Panel.Regimens],
    themeAwareImageIcon: true,
    execute: () => props.dispatch(addRegimen(
      selectAllRegimens(index).length, props.navigate)),
  });
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
    openAddPage(Path.cropSearch(slug));
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
  return [...staticCommands, ...cropCommands, ...apiCrops];
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
  const getValue = getWebAppConfigValueFromResources(props.state.resources.index);
  const is3D = !!getValue(BooleanSetting.three_d_garden);
  const unavailable = is3D ? undefined : t("Enable the 3D Garden setting first.");
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
  const result: Command[] = [{
    id: "camera:perspective-view",
    ...localized("Perspective View"),
    aliases: [
      "3d", "camera", "projection",
      "Orthographic View", "Toggle perspective",
    ],
    group: "map",
    icon: "cube",
    unavailable,
    execute,
    toggleValue: perspective,
    accessory: toggleAccessory(perspective, !!unavailable),
  }];
  const targetName = (target: typeof VIEW_PRISM_TARGETS[number]) => {
    let surface = "Side";
    if (target.kind == "corner") {
      surface = "Corner";
    } else if (target.id == "face-top"
      || target.id.startsWith("edge-top-")) {
      surface = "Top";
    }
    const axes = target.direction.slice(0, 2).flatMap((value, index) =>
      value == 0
        ? []
        : `${value > 0 ? "+" : "-"}${index == 0 ? "X" : "Y"}`);
    return ["Orbit to", surface, ...axes].join(" ");
  };
  VIEW_PRISM_TARGETS.map((target, index) => {
    const direction = target.direction;
    result.push({
      id: `camera:orbit:${target.id}`,
      ...localized(targetName(target)),
      aliases: ["camera", "view", "cube", target.kind,
        direction.join(" "), String(index)],
      group: "map",
      icon: "cube",
      unavailable,
      execute: () => props.dispatch({
        type: Actions.SET_3D_VIEW,
        payload: { direction, nonce: Date.now() },
      }),
    });
  });
  return result;
};

const lowerSettingsPriority = (command: Command): Command =>
  command.group == "settings"
    ? { ...command, priority: (command.priority || 0) - 1 }
    : command;

export const buildCommands = (props: BuildCommandProps): Command[] => [
  ...panelCommands(props),
  shopCommand(),
  logoutCommand(),
  ...popupCommands(props),
  timeTravelCommand(props),
  deleteAllLogsCommand(),
  clearRecentsCommand(),
  ...controlsCommands(props),
  ...inventorySectionCommands(props),
  ...photoSectionCommands(props),
  ...metricSectionCommands(props),
  ...profileCommands(props),
  sectionViewCommand(props),
  selectionCommand(props),
  laserCommand(props),
  ...settingsSectionCommands(props),
  setupWizardCommand(props),
  ...helpCommands(props),
  ...booleanSettingCommands(props),
  ...webAppValueSettingCommands(props),
  ...configValueSettingCommands(props),
  ...cameraCommands(props),
  ...relativeMoveCommands(props),
  ...homeCommands(props),
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
