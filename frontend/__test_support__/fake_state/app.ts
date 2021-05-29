import { AppState } from "../../reducer";
import { panelState } from "../control_panel_state";

export const app: AppState = {
  controlPanelState: panelState(),
  controlsPopupOpen: false,
  toasts: {},
};
