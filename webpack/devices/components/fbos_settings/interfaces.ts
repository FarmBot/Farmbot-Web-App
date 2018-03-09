import { SourceFbosConfig, BotState, ControlPanelState } from "../../interfaces";
import { ShouldDisplay } from "../../../sequences/interfaces";

export interface AutoSyncRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface AutoUpdateRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface BoardTypeProps {
  firmwareVersion: string | undefined;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface PowerAndResetProps {
  controlPanelState: ControlPanelState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
  shouldDisplay: ShouldDisplay;
}

export interface FactoryResetRowProps {
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface FarmbotOsRowProps {
  bot: BotState;
  osReleaseNotes: string;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface FbosDetailsProps {
  bot: BotState;
  dispatch: Function;
  sourceFbosConfig: SourceFbosConfig;
}

export interface OsUpdateButtonProps {
  bot: BotState;
  sourceFbosConfig: SourceFbosConfig;
}
