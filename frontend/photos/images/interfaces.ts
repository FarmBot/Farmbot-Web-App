import { TaggedImage, JobProgress, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { TimeSettings } from "../../interfaces";
import { UserEnv } from "../../devices/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";

export interface ImageFlipperProps {
  onFlip(uuid: string | undefined): void;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  imageLoadCallback: (img: HTMLImageElement) => void;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  crop: boolean;
  transformImage: boolean;
}

export interface ImageFlipperState {
  isLoaded: boolean;
  width: number;
  height: number;
  disablePrev: boolean;
  disableNext: boolean;
}

export interface PhotosProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  timeSettings: TimeSettings;
  imageJobs: JobProgress[];
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  env: UserEnv;
  hiddenImages: number[];
  shownImages: number[];
  hideUnShownImages: boolean;
  alwaysHighlightImage: boolean;
  getConfigValue: GetWebAppConfigValue;
}

export interface PhotoButtonsProps {
  takePhoto(): void;
  deletePhoto(): void;
  toggleCrop(): void;
  toggleRotation(): void;
  canCrop: boolean;
  canTransform: boolean;
  imageUrl: string | undefined;
  imageJobs: JobProgress[];
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  env: UserEnv;
}
