import { TaggedImage, SyncStatus, JobProgress } from "farmbot";
import { TimeSettings } from "../interfaces";
import { UserEnv, ShouldDisplay } from "../devices/interfaces";
import { NetworkState } from "../connectivity/interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { SaveFarmwareEnv } from "../farmware/interfaces";
import { WD_ENV } from "./remote_env/interfaces";

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
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  imageJobs: JobProgress[];
  versions: Record<string, string>;
  hiddenImages: number[];
  shownImages: number[];
  hideUnShownImages: boolean;
  alwaysHighlightImage: boolean;
  getConfigValue: GetWebAppConfigValue;
}

export interface DesignerPhotosState {
  filter: boolean;
  camera: boolean;
  calibration: boolean;
  detection: boolean;
  manage: boolean;
}
