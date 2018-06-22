import { TaggedImage } from "../../resources/tagged_resources";
import { WD_ENV } from "../weed_detector/remote_env/interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { SyncStatus } from "farmbot";

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
}
