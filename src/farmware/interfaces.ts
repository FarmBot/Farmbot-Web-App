import { BotState } from "../devices/interfaces";
import { TaggedImage } from "../resources/tagged_resources";
import { SyncStatus, Dictionary, FarmwareManifest } from "farmbot/dist";
import { WD_ENV } from "../images/weed_detector/remote_env/interfaces";

export interface FWState {
  selectedFarmware: string | undefined;
  packageUrl: string | undefined;
}

export interface FWProps {
  syncStatus: SyncStatus;
  farmwares: Dictionary<FarmwareManifest | undefined>;
}

export interface Props {
  bot: BotState;
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
}

export interface PhotosProps {
  dispatch: Function;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
}

export interface CameraCalibrationState {
  settingsMenuOpen: boolean;
}

export interface CameraCalibrationProps {
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  onProcessPhoto(id: number): void;
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
}

export interface FarmwareState {
  currentImage: string | undefined;
}
