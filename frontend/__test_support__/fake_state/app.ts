import { AppState } from "../../reducer";
import { panelState } from "../control_panel_state";

export const app: AppState = {
  settingsSearchTerm: "",
  controlPanelState: panelState(),
  controlsPopupOpen: false,
  toasts: {},
};
