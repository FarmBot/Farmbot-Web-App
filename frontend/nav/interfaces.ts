import {
  BotState, SourceFbosConfig, SourceFwConfig, UserEnv,
} from "../devices/interfaces";
import {
  TaggedUser, TaggedLog, TaggedDevice, FirmwareHardware,
  TaggedWizardStepResult,
  TaggedPeripheral,
  TaggedSequence,
  TaggedWebcamFeed,
} from "farmbot";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { TimeSettings } from "../interfaces";
import { HelpState } from "../help/reducer";
import { AppState } from "../reducer";
import { ResourceIndex } from "../resources/interfaces";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { RunButtonMenuOpen } from "../sequences/interfaces";
import { DesignerState } from "../farm_designer/interfaces";

export interface NavBarProps {
  logs: TaggedLog[];
  bot: BotState;
  user: TaggedUser | undefined;
  dispatch: Function;
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  sourceFwConfig: SourceFwConfig;
  sourceFbosConfig: SourceFbosConfig;
  firmwareConfig: FirmwareConfig | undefined;
  resources: ResourceIndex;
  device: TaggedDevice;
  alertCount: number;
  apiFirmwareValue: FirmwareHardware | undefined;
  authAud: string | undefined;
  wizardStepResults: TaggedWizardStepResult[];
  helpState: HelpState;
  appState: AppState;
  menuOpen: RunButtonMenuOpen;
  env: UserEnv;
  feeds: TaggedWebcamFeed[];
  peripherals: TaggedPeripheral[];
  sequences: TaggedSequence[];
  designer: DesignerState;
}

export interface NavBarState {
  mobileMenuOpen: boolean;
  documentTitle: string;
}

export interface MobileMenuProps {
  close(): void;
  mobileMenuOpen: boolean;
  alertCount: number;
  helpState: HelpState;
  dispatch: Function;
  designer: DesignerState;
}

export interface TickerListProps {
  logs: TaggedLog[]
  timeSettings: TimeSettings;
  getConfigValue: GetWebAppConfigValue;
  botOnline: boolean;
  lastSeen: number;
  dispatch: Function;
}

export interface NavLinksProps {
  close(): void;
  alertCount: number;
  helpState: HelpState;
  dispatch: Function;
  designer: DesignerState;
}

export interface EStopButtonProps {
  bot: BotState;
  forceUnlock: boolean;
}
