import React from "react";
import { getLinks } from "./nav/nav_links";
import { sync } from "./devices/actions";
import { push } from "./history";
import { HotkeyConfig, useHotkeys, HotkeysDialog2 } from "@blueprintjs/core";
import { unselectPlant } from "./farm_designer/map/actions";
import { getPanelPath, PANEL_BY_SLUG } from "./farm_designer/panel_header";
import { t } from "./i18next_wrapper";
import { store } from "./redux/store";
import { save } from "./api/crud";
import { Path } from "./internal_urls";
import { Actions } from "./constants";

type HotkeyConfigs = Record<HotKey, HotkeyConfig>;

export interface HotKeysProps {
  dispatch: Function;
  hotkeyGuide: boolean;
}

export enum HotKey {
  save = "save",
  sync = "sync",
  navigateRight = "navigateRight",
  navigateLeft = "navigateLeft",
  addPlant = "addPlant",
  addEvent = "addEvent",
  backToPlantOverview = "backToPlantOverview",
  openGuide = "openGuide",
}

const HOTKEY_BASE_MAP = (): HotkeyConfigs => ({
  [HotKey.save]: {
    combo: "ctrl + s",
    label: t("Save"),
  },
  [HotKey.sync]: {
    combo: "ctrl + shift + s",
    label: t("Sync"),
  },
  [HotKey.navigateRight]: {
    combo: "ctrl + shift + right",
    label: t("Navigate Right"),
  },
  [HotKey.navigateLeft]: {
    combo: "ctrl + shift + left",
    label: t("Navigate Left"),
  },
  [HotKey.addPlant]: {
    combo: "ctrl + shift + p",
    label: t("Add Plant"),
  },
  [HotKey.addEvent]: {
    combo: "ctrl + shift + e",
    label: t("Add Event"),
  },
  [HotKey.backToPlantOverview]: {
    combo: "escape",
    label: t("Back to plant overview"),
  },
  [HotKey.openGuide]: {
    combo: "shift + ?",
    label: t("Open Guide"),
  },
});

export const hotkeysWithActions = (dispatch: Function, slug: string) => {
  const links = getLinks();
  const idx = links.indexOf(PANEL_BY_SLUG[slug]);
  const panelPlus = links[idx + 1] || links[0];
  const panelMinus = links[idx - 1] || links[links.length - 1];
  const hotkeysBase = HOTKEY_BASE_MAP();
  const list: HotkeyConfigs = {
    [HotKey.save]: {
      ...hotkeysBase[HotKey.save],
      onKeyDown: () => {
        const sequence = store.getState().resources.consumers.sequences.current;
        if (sequence && slug == "sequences") {
          dispatch(save(sequence));
        }
      },
      allowInInput: true,
      preventDefault: true,
    },
    [HotKey.sync]: {
      ...hotkeysBase[HotKey.sync],
      onKeyDown: () => dispatch(sync()),
    },
    [HotKey.navigateRight]: {
      ...hotkeysBase[HotKey.navigateRight],
      onKeyDown: () => push(getPanelPath(panelPlus)),
    },
    [HotKey.navigateLeft]: {
      ...hotkeysBase[HotKey.navigateLeft],
      onKeyDown: () => push(getPanelPath(panelMinus)),
    },
    [HotKey.addPlant]: {
      ...hotkeysBase[HotKey.addPlant],
      onKeyDown: () => push(Path.cropSearch()),
    },
    [HotKey.addEvent]: {
      ...hotkeysBase[HotKey.addEvent],
      onKeyDown: () => push(Path.farmEvents("add")),
    },
    [HotKey.backToPlantOverview]: {
      ...hotkeysBase[HotKey.backToPlantOverview],
      onKeyDown: () => {
        if (slug != "photos") {
          push(Path.plants());
          dispatch(unselectPlant(dispatch));
        }
      },
    },
    [HotKey.openGuide]: hotkeysBase[HotKey.openGuide],
  };
  return list;
};

export const toggleHotkeyHelpOverlay = (dispatch: Function) => () =>
  dispatch({ type: Actions.TOGGLE_HOTKEY_GUIDE, payload: undefined });

export const HotKeys = (props: HotKeysProps) => {
  const slug = Path.getSlug(Path.designer()) || "plants";
  const hotkeys = React.useMemo(() =>
    Object.values(hotkeysWithActions(props.dispatch, slug))
      .map(hotkey => ({ ...hotkey, global: true })), [props.dispatch, slug]);
  const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys,
    { showDialogKeyCombo: undefined });
  return <div className={"hotkeys"}
    onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
    <HotkeysDialog2 globalGroupName={""}
      onClose={props.dispatch(toggleHotkeyHelpOverlay)}
      hotkeys={hotkeys} isOpen={props.hotkeyGuide} />
  </div>;
};
