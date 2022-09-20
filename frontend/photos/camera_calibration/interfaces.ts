import { TaggedImage, SyncStatus } from "farmbot";
import { WD_ENV } from "../remote_env/interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { UserEnv } from "../../devices/interfaces";
import { TimeSettings } from "../../interfaces";
import { SaveFarmwareEnv } from "../../farmware/interfaces";
import { PhotosPanelState } from "../interfaces";

export interface CameraCalibrationProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  wDEnv: Partial<WD_ENV>;
  env: UserEnv;
  iteration: number;
  morph: number;
  blur: number;
  H_LO: number;
  S_LO: number;
  V_LO: number;
  H_HI: number;
  S_HI: number;
  V_HI: number;
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
  versions: Record<string, string>;
  showAdvanced: boolean;
  photosPanelState: PhotosPanelState;
}

export interface CameraCalibrationConfigProps {
  values: Partial<WD_ENV>;
  onChange(key: keyof WD_ENV, value: number): void;
  calibrationZ: string | undefined;
  calibrationImageCenter: Record<"x" | "y", string | undefined>;
}
