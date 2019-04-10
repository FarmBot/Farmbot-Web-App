import { TaggedImage, SyncStatus } from "farmbot";
import { WD_ENV } from "../weed_detector/remote_env/interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { ShouldDisplay, SaveFarmwareEnv } from "../../devices/interfaces";
import { TimeSettings } from "../../interfaces";

export interface CameraCalibrationProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  env: Partial<WD_ENV>;
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
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  timeSettings: TimeSettings;
}
