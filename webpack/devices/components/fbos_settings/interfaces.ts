import {
  SourceFbosConfig, BotState, ControlPanelState, ShouldDisplay
} from "../../interfaces";
import { Dictionary, InformationalSettings } from "farmbot";

export interface AutoSyncRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface AutoUpdateRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface CameraSelectionProps {
  env: Dictionary<string | undefined>;
  botOnline: boolean;
}

export interface CameraSelectionState {
  cameraStatus: "" | "sending" | "done" | "error";
}

export interface BoardTypeProps {
  firmwareVersion: string | undefined;
  dispatch: Function;
  shouldDisplay: ShouldDisplay;
  sourceFbosConfig: SourceFbosConfig;
}

export interface PowerAndResetProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
  botOnline: boolean;
}

export interface FactoryResetRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
}

export interface FarmbotOsRowProps {
  bot: BotState;
  osReleaseNotes: string;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
}

export interface FbosDetailsProps {
  botInfoSettings: InformationalSettings;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OsUpdateButtonProps {
  bot: BotState;
  sourceFbosConfig: SourceFbosConfig;
  botOnline: boolean;
}
