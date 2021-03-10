import { GetWebAppConfigValue } from "../config_storage/actions";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import {
  SourceFwConfig, SourceFbosConfig, ShouldDisplay,
  BotState, ControlPanelState,
} from "../devices/interfaces";
import { ResourceIndex } from "../resources/interfaces";
import {
  TaggedDevice, Alert, TaggedUser, TaggedFarmwareEnv, TaggedWizardStepResult,
} from "farmbot";
import { TimeSettings } from "../interfaces";
import { DeviceSetting } from "../constants";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
} from "farmbot/dist/resources/configs/web_app";
import { SaveFarmwareEnv } from "../farmware/interfaces";

export interface DesignerSettingsPropsBase {
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export interface DesignerSettingsProps extends DesignerSettingsPropsBase {
  firmwareConfig: FirmwareConfig | undefined;
  sourceFwConfig: SourceFwConfig;
  sourceFbosConfig: SourceFbosConfig;
  resources: ResourceIndex;
  deviceAccount: TaggedDevice;
  alerts: Alert[];
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
  bot: BotState;
  searchTerm: string;
  user: TaggedUser;
  farmwareEnvs: TaggedFarmwareEnv[];
  wizardStepResults: TaggedWizardStepResult[];
}

export interface DesignerSettingsSectionProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  getConfigValue: GetWebAppConfigValue;
}

export interface SettingDescriptionProps {
  setting?: WebAppBooleanConfigKey;
  title: DeviceSetting;
  description: string;
  invert?: boolean;
  callback?: () => void;
  children?: React.ReactChild;
  defaultOn?: boolean;
  disabled?: boolean;
  confirm?: string;
  useToolTip?: boolean;
}

export interface SettingProps
  extends DesignerSettingsPropsBase, SettingDescriptionProps { }

export interface OtherSettingsProps {
  dispatch: Function;
  controlPanelState: ControlPanelState;
  getConfigValue: GetWebAppConfigValue;
  sourceFbosConfig: SourceFbosConfig;
  searchTerm: string;
}
