import { StringConfigKey } from "farmbot/dist/resources/configs/web_app";
import { TimeSettings } from "../../interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { TaggedImage } from "farmbot";
import { ImageShowFlags } from "../images/interfaces";
import { DesignerState } from "../../farm_designer/interfaces";

export interface PhotoFilterSettingsProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  timeSettings: TimeSettings;
  flags: ImageShowFlags;
  designer: DesignerState;
  getConfigValue: GetWebAppConfigValue;
}

export interface FiltersEnabledWarningProps {
  designer: DesignerState;
  getConfigValue: GetWebAppConfigValue;
}

interface FullImageFilterMenuState {
  beginDate: string | undefined;
  beginTime: string | undefined;
  endDate: string | undefined;
  endTime: string | undefined;
  slider: number;
}

export type ImageFilterMenuState = Partial<FullImageFilterMenuState>;

export interface ImageFilterMenuProps {
  timeSettings: TimeSettings;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  imageAgeInfo: { newestDate: string, toOldest: number };
  images?: TaggedImage[];
}

export interface FilterNearTimeState {
  seconds: number;
}

export type StringValueUpdate =
  Partial<Record<StringConfigKey, string | undefined>>;
