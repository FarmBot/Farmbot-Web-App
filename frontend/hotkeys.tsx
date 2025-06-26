import React from "react";
import { getLinks } from "./nav/nav_links";
import { sync } from "./devices/actions";
import { HotkeyConfig, useHotkeys } from "@blueprintjs/core";
import {
  getPanelPath, PANEL_BY_SLUG, setPanelOpen,
} from "./farm_designer/panel_header";
import { t } from "./i18next_wrapper";
import { store } from "./redux/store";
import { save } from "./api/crud";
import { Path } from "./internal_urls";
import { NavigateFunction, useNavigate } from "react-router";
import { DesignerState } from "./farm_designer/interfaces";
import { isUndefined } from "lodash";
import { resetDrawnPointDataAction } from "./points/create_points";

type HotkeyConfigs = Record<HotKey, HotkeyConfig>;

export interface HotKeysProps {
  dispatch: Function;
  designer: DesignerState;
}

export enum HotKey {
  save = "save",
  sync = "sync",
  navigateRight = "navigateRight",
  navigateLeft = "navigateLeft",
  addPlant = "addPlant",
  addEvent = "addEvent",
  closePanel = "closePanel",
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
  [HotKey.closePanel]: {
    combo: "escape",
    label: t("Close panel"),
  },
  [HotKey.openGuide]: {
    combo: "shift + ?",
    label: t("Open Guide"),
  },
});

export interface HotkeysWithActionsProps {
  navigate: NavigateFunction;
  dispatch: Function;
  slug: string;
  designer: DesignerState;
}

export const hotkeysWithActions = (props: HotkeysWithActionsProps) => {
  const { navigate, dispatch, slug, designer } = props;
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
      onKeyDown: () => { navigate(getPanelPath(panelPlus)); },
    },
    [HotKey.navigateLeft]: {
      ...hotkeysBase[HotKey.navigateLeft],
      onKeyDown: () => { navigate(getPanelPath(panelMinus)); },
    },
    [HotKey.addPlant]: {
      ...hotkeysBase[HotKey.addPlant],
      onKeyDown: () => { navigate(Path.cropSearch()); },
    },
    [HotKey.addEvent]: {
      ...hotkeysBase[HotKey.addEvent],
      onKeyDown: () => { navigate(Path.farmEvents("add")); },
    },
    [HotKey.closePanel]: {
      ...hotkeysBase[HotKey.closePanel],
      onKeyDown: () => {
        if (!isUndefined(designer.drawnPoint?.cx)) {
          dispatch(resetDrawnPointDataAction());
        } else {
          dispatch(setPanelOpen(false));
        }
      },
    },
    [HotKey.openGuide]: hotkeysBase[HotKey.openGuide],
  };
  return list;
};

export const toggleHotkeyHelpOverlay = () =>
  document.dispatchEvent(new KeyboardEvent("keydown",
    { key: "?", shiftKey: true, bubbles: true }));

export const HotKeys = (props: HotKeysProps) => {
  const navigate = useNavigate();
  const slug = Path.getSlug(Path.designer()) || "plants";
  const { dispatch, designer } = props;
  const hotkeys = React.useMemo(
    () => Object.values(hotkeysWithActions({
      navigate, dispatch, slug, designer,
    }))
      .map(hotkey => ({ ...hotkey, global: true })),
    [navigate, dispatch, slug, designer]);
  const { handleKeyDown, handleKeyUp } = useHotkeys(hotkeys,
    { showDialogKeyCombo: undefined });
  return <div className={"hotkeys"}
    onKeyDown={handleKeyDown} onKeyUp={handleKeyUp}>
  </div>;
};
