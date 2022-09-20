import { TaggedImage, SyncStatus, JobProgress, TaggedFarmwareEnv } from "farmbot";
import { MovementState, TimeSettings } from "../interfaces";
import { BotPosition, UserEnv } from "../devices/interfaces";
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
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
  photosPanelState: PhotosPanelState;
}

export interface PhotosPanelState {
  filter: boolean;
  camera: boolean;
  calibration: boolean;
  calibrationPP: boolean;
  detection: boolean;
  detectionPP: boolean;
  measure: boolean;
  manage: boolean;
}
