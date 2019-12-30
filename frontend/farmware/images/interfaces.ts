import { TaggedImage, JobProgress, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { TimeSettings } from "../../interfaces";
import { UserEnv } from "../../devices/interfaces";

export interface ImageFlipperProps {
  onFlip(uuid: string | undefined): void;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
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
}

export interface PhotoButtonsProps {
  takePhoto: () => void,
  deletePhoto: () => void,
  imageJobs: JobProgress[],
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  env: UserEnv;
}
