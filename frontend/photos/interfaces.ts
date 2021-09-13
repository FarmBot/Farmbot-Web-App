import { TaggedImage, SyncStatus, JobProgress, TaggedFarmwareEnv } from "farmbot";
import { TimeSettings } from "../interfaces";
import { UserEnv } from "../devices/interfaces";
import { NetworkState } from "../connectivity/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { Farmwares, SaveFarmwareEnv } from "../farmware/interfaces";
import { WD_ENV } from "./remote_env/interfaces";
import { DesignerState } from "../farm_designer/interfaces";

export interface DesignerPhotosProps {
  dispatch: Function;
  wDEnv: Partial<WD_ENV>;
  env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  currentImageSize: Record<"height" | "width", number | undefined>;
  botToMqttStatus: NetworkState;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  saveFarmwareEnv: SaveFarmwareEnv;
  imageJobs: JobProgress[];
  versions: Record<string, string>;
  designer: DesignerState;
  getConfigValue: GetWebAppConfigValue;
  farmwares: Farmwares;
  userEnv: UserEnv;
  farmwareEnvs: TaggedFarmwareEnv[];
}

export interface DesignerPhotosState {
  filter: boolean;
  camera: boolean;
  calibration: boolean;
  detection: boolean;
  measure: boolean;
  manage: boolean;
}
