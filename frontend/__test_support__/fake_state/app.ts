import { AppState } from "../../reducer";
import { fakeMovementState } from "../fake_bot_data";
import {
  controlsState,
  curvesPanelState,
  metricPanelState,
  plantsPanelState,
  pointsPanelState,
  popUpsState,
  sequencesPanelState,
  settingsPanelState,
  weedsPanelState,
} from "../panel_state";

export const fakeApp = (): AppState => ({
  settingsSearchTerm: "",
  settingsPanelState: settingsPanelState(),
  plantsPanelState: plantsPanelState(),
  weedsPanelState: weedsPanelState(),
  pointsPanelState: pointsPanelState(),
  curvesPanelState: curvesPanelState(),
  sequencesPanelState: sequencesPanelState(),
  metricPanelState: metricPanelState(),
  toasts: {},
  movement: fakeMovementState(),
  controls: controlsState(),
  popups: popUpsState(),
});

export const app: AppState = fakeApp();
