import { WD_ENV } from "./remote_env/interfaces";
import { UserEnv, ShouldDisplay } from "../../devices/interfaces";
import { TaggedImage, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { TimeSettings } from "../../interfaces";
import { SaveFarmwareEnv } from "../interfaces";

/** Hue, Saturation, Value */
export type HSV = "H" | "S" | "V";

/** A simple range object. */
export interface HiLo {
  hi: number;
  lo: number;
}

export interface DetectorState {
  isEditing: boolean;
  deletionProgress: string;
  settingsMenuOpen: boolean;
  /** Defined only if the bot is online AND its been setup */
  remoteFarmwareSettings: Partial<WD_ENV>;
}

export interface FarmbotPickerProps {
  h: [number, number];
  s: [number, number];
  v: [number, number];
  invertHue?: boolean;
}

export interface EnvSliderProps {
  name: HSV;
  env: Partial<WD_ENV>;
  onChange?: (key: HSV, val: [number, number]) => void;
}

export interface EnvSliderState extends Partial<HiLo> {
  sliding: boolean;
}

export interface WeedDetectorProps {
  dispatch: Function;
  wDEnv: Partial<WD_ENV>;
  env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
}
