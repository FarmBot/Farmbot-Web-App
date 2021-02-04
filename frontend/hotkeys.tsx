import React from "react";
import { getLinks } from "./nav/nav_links";
import { sync } from "./devices/actions";
import { push, getPathArray } from "./history";
import {
  Hotkey, Hotkeys, HotkeysTarget, IHotkeyProps,
} from "@blueprintjs/core";
import { unselectPlant } from "./farm_designer/map/actions";
import { getPanelPath, PANEL_BY_SLUG } from "./farm_designer/panel_header";
import {
  showHotkeysDialog,
} from "@blueprintjs/core/lib/esm/components/hotkeys/hotkeysDialog";
import { t } from "./i18next_wrapper";
import { store } from "./redux/store";
import { save } from "./api/crud";

export interface HotKeysProps {
  dispatch: Function;
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
  toggleGuide = "toggleGuide",
}

const HOTKEY_BASE_MAP = (): Record<HotKey, IHotkeyProps> => ({
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
    combo: "esc",
    label: t("Back to plant overview"),
  },
  [HotKey.openGuide]: {
    combo: "ctrl + shift + /",
    label: t("Open Guide"),
  },
  [HotKey.toggleGuide]: {
    combo: "shift + ?",
    label: t("Toggle Guide"),
  },
});

export const hotkeysWithActions = (dispatch: Function) => {
  const links = getLinks();
  const slug = getPathArray()[3];
  const idx = links.indexOf(PANEL_BY_SLUG[slug]);
  const panelPlus = links[idx + 1] || links[0];
  const panelMinus = links[idx - 1] || links[links.length - 1];
  const hotkeysBase = HOTKEY_BASE_MAP();
  const list: Record<HotKey, IHotkeyProps> = {
    [HotKey.save]: {
      ...hotkeysBase[HotKey.save],
      onKeyDown: () => {
        const sequence = store.getState().resources.consumers.sequences.current;
        if (sequence && getPathArray()[3] == "sequences") {
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
      onKeyDown: () => push("/app/designer/plants/crop_search"),
    },
    [HotKey.addEvent]: {
      ...hotkeysBase[HotKey.addEvent],
      onKeyDown: () => push("/app/designer/events/add"),
    },
    [HotKey.backToPlantOverview]: {
      ...hotkeysBase[HotKey.backToPlantOverview],
      onKeyDown: () => {
        push("/app/designer/plants");
        dispatch(unselectPlant(dispatch));
      },
    },
    [HotKey.openGuide]: {
      ...hotkeysBase[HotKey.openGuide],
      onKeyDown: openHotkeyHelpOverlay
    },
    [HotKey.toggleGuide]: hotkeysBase[HotKey.toggleGuide],
  };
  return list;
};

export const openHotkeyHelpOverlay = () =>
  showHotkeysDialog(Object.values(HOTKEY_BASE_MAP())
    .filter(hotkey => hotkey.combo != "ctrl + shift + /")
    .map(hotkey => ({ ...hotkey, global: true })));

@HotkeysTarget
export class HotKeys extends React.Component<HotKeysProps> {
  render() { return <div className={"hotkeys"} />; }

  public renderHotkeys() {
    return <Hotkeys>
      {Object.values(hotkeysWithActions(this.props.dispatch))
        .map((hotkeyProps: IHotkeyProps, index: number) =>
          <Hotkey key={index} global={true} {...hotkeyProps} />)}
    </Hotkeys>;
  }
}
