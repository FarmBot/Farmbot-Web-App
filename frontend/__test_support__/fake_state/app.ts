import { AppState } from "../../reducer";
import {
  plantsPanelState,
  pointsPanelState,
  sequencesPanelState,
  settingsPanelState,
  weedsPanelState,
} from "../panel_state";

export const app: AppState = {
  settingsSearchTerm: "",
  settingsPanelState: settingsPanelState(),
  plantsPanelState: plantsPanelState(),
  weedsPanelState: weedsPanelState(),
  pointsPanelState: pointsPanelState(),
  sequencesPanelState: sequencesPanelState(),
  controlsPopupOpen: false,
  toasts: {},
};
