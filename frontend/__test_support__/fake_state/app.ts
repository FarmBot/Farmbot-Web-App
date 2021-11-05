import { AppState } from "../../reducer";
import {
  plantsPanelState, pointsPanelState, settingsPanelState, weedsPanelState,
} from "../panel_state";

export const app: AppState = {
  settingsSearchTerm: "",
  settingsPanelState: settingsPanelState(),
  plantsPanelState: plantsPanelState(),
  weedsPanelState: weedsPanelState(),
  pointsPanelState: pointsPanelState(),
  controlsPopupOpen: false,
  toasts: {},
};
