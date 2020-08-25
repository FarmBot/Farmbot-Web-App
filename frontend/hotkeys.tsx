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

export interface HotKeysProps {
  dispatch: Function;
}

enum HotKey {
  sync = "sync",
  navigateRight = "navigateRight",
  navigateLeft = "navigateLeft",
  addPlant = "addPlant",
  addEvent = "addEvent",
  backToPlantOverview = "backToPlantOverview",
  toggleGuide = "toggleGuide",
}

const HOTKEY_BASE_MAP = (): Record<HotKey, IHotkeyProps> => ({
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
  const list: IHotkeyProps[] = [
    {
      ...hotkeysBase[HotKey.sync],
      onKeyDown: () => dispatch(sync()),
    },
    {
      ...hotkeysBase[HotKey.navigateRight],
      onKeyDown: () => push(getPanelPath(panelPlus)),
    },
    {
      ...hotkeysBase[HotKey.navigateLeft],
      onKeyDown: () => push(getPanelPath(panelMinus)),
    },
    {
      ...hotkeysBase[HotKey.addPlant],
      onKeyDown: () => push("/app/designer/plants/crop_search"),
    },
    {
      ...hotkeysBase[HotKey.addEvent],
      onKeyDown: () => push("/app/designer/events/add"),
    },
    {
      ...hotkeysBase[HotKey.backToPlantOverview],
      onKeyDown: () => {
        push("/app/designer/plants");
        dispatch(unselectPlant(dispatch));
      },
    },
    {
      combo: "ctrl + shift + /",
      label: t("Open Guide"),
      onKeyDown: openHotkeyHelpOverlay
    },
    hotkeysBase[HotKey.toggleGuide],
  ];
  return list;
};

export const openHotkeyHelpOverlay = () =>
  showHotkeysDialog(Object.values(HOTKEY_BASE_MAP())
    .map(hotkey => ({ ...hotkey, global: true })));

@HotkeysTarget
export class HotKeys extends React.Component<HotKeysProps> {
  render() { return <div className={"hotkeys"} />; }

  public renderHotkeys() {
    return <Hotkeys>
      {hotkeysWithActions(this.props.dispatch)
        .map((hotkeyProps: IHotkeyProps, index: number) =>
          <Hotkey
            key={index}
            global={true}
            combo={hotkeyProps.combo}
            label={hotkeyProps.label}
            onKeyDown={hotkeyProps.onKeyDown} />)}
    </Hotkeys>;
  }
}
