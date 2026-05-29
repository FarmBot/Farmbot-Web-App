import { GetWebAppConfigValue } from "../config_storage/actions";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import {
  SourceFwConfig, SourceFbosConfig, BotState,
} from "../devices/interfaces";
import { ResourceIndex } from "../resources/interfaces";
import {
  TaggedDevice, Alert, TaggedUser, TaggedFarmwareEnv, TaggedWizardStepResult,
  McuParams,
} from "farmbot";
import { SettingsPanelState, TimeSettings } from "../interfaces";
import { DeviceSetting } from "../constants";
import {
  BooleanConfigKey as WebAppBooleanConfigKey,
  NumberConfigKey as WebAppNumberConfigKey,
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
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
  bot: BotState;
  searchTerm: string;
  user: TaggedUser;
  farmwareEnvs: TaggedFarmwareEnv[];
  wizardStepResults: TaggedWizardStepResult[];
  settingsPanelState: SettingsPanelState;
  distanceIndicator: string;
}

export interface DesignerSettingsSectionProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  getConfigValue: GetWebAppConfigValue;
  firmwareConfig: McuParams | undefined;
}

export interface SettingDescriptionProps {
  setting?: WebAppBooleanConfigKey;
  numberSetting?: WebAppNumberConfigKey;
  title: DeviceSetting;
  description: string;
  invert?: boolean;
  callback?: () => void;
  children?: React.ReactNode;
  defaultOn?: boolean;
  disabled?: boolean;
  confirm?: string;
  useToolTip?: boolean;
}

export interface SettingProps
  extends DesignerSettingsPropsBase, SettingDescriptionProps { }

export interface WebAppNumberSettingProps extends DesignerSettingsPropsBase {
  numberSetting: WebAppNumberConfigKey;
}

export interface CustomSettingsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  farmwareEnvs: TaggedFarmwareEnv[];
}

export interface ThreeDSettingsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  farmwareEnvs: TaggedFarmwareEnv[];
  distanceIndicator: string;
}

export interface OtherSettingsProps {
  dispatch: Function;
  settingsPanelState: SettingsPanelState;
  getConfigValue: GetWebAppConfigValue;
  sourceFbosConfig: SourceFbosConfig;
  searchTerm: string;
}
