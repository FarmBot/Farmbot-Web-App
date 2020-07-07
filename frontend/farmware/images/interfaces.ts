import { TaggedImage, JobProgress, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { TimeSettings } from "../../interfaces";
import { UserEnv } from "../../devices/interfaces";

export interface ImageFlipperProps {
  onFlip(uuid: string | undefined): void;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  imageLoadCallback?: (img: HTMLImageElement) => void;
}

export interface ImageFlipperState {
  isLoaded: boolean;
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
  imageFilterBegin: string | undefined;
  imageFilterEnd: string | undefined;
  hiddenImages: number[];
}

export interface PhotoButtonsProps {
  takePhoto: () => void,
  deletePhoto: () => void,
  imageJobs: JobProgress[],
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  env: UserEnv;
}
