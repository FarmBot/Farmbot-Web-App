import { TaggedImage, JobProgress, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { MovementState, TimeSettings } from "../../interfaces";
import { BotPosition, UserEnv } from "../../devices/interfaces";
import { GetWebAppConfigValue } from "../../config_storage/actions";
import { DesignerState } from "../../farm_designer/interfaces";

export interface ImageFlipperProps {
  id: string;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  currentImageSize: Record<"height" | "width", number | undefined>;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  crop: boolean;
  transformImage: boolean;
  hover?(hovered: string | undefined): void;
  target?: Record<"x" | "y", number> | undefined;
  flipActionOverride?(nextIndex: number): void;
}

export interface ImageFlipperState {
  disablePrev: boolean;
  disableNext: boolean;
}

export interface FlipperImageProps {
  image: TaggedImage;
  crop: boolean;
  transformImage: boolean;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
  flipperId: string;
  env: UserEnv;
  onImageLoad(img: HTMLImageElement): void;
  hover?(hovered: string | undefined): void;
  target?: Record<"x" | "y", number> | undefined;
  dark?: boolean;
}

export interface FlipperImageState {
  isLoaded: boolean;
  width: number | undefined;
  height: number | undefined;
}

export interface PlaceholderImgProps {
  textOverlay: string;
  width?: number;
  height?: number;
  dark?: boolean;
}

export interface PhotosProps {
  dispatch: Function;
  images: TaggedImage[];
  flags: ImageShowFlags;
  currentImage: TaggedImage | undefined;
  currentImageSize: Record<"height" | "width", number | undefined>;
  timeSettings: TimeSettings;
  imageJobs: JobProgress[];
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  env: UserEnv;
  designer: DesignerState;
  getConfigValue: GetWebAppConfigValue;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  movementState: MovementState;
}

export interface PhotoButtonsProps {
  deletePhoto(): void;
  toggleCrop(): void;
  toggleRotation(): void;
  toggleFullscreen(): void;
  canCrop: boolean;
  canTransform: boolean;
  imageUrl: string | undefined;
  image: TaggedImage | undefined;
  size: Record<"width" | "height", number | undefined>;
  dispatch: Function;
  flags: ImageShowFlags | undefined;
}

export interface NewPhotoButtonsProps {
  takePhoto(): void;
  imageJobs: JobProgress[];
  env: UserEnv;
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
}

export interface ImageFilterProps {
  image: TaggedImage | undefined;
  dispatch: Function;
  flags: ImageShowFlags;
}

export interface ImageShowProps extends ImageFilterProps {
  size: Record<"height" | "width", number | undefined>;
}

export interface FlagDisplayRowProps {
  flag: boolean;
  labelOk: string;
  labelNo: string;
  title?: string;
}

type FlagKey = "layerOn" | "inRange" | "notHidden" | "zMatch" | "sizeMatch"
  | "typeShown";
export type ImageShowFlags = Record<FlagKey, boolean>;

export interface GetImageShownStatusFlagsProps {
  image: TaggedImage | undefined;
  designer: DesignerState;
  getConfigValue: GetWebAppConfigValue;
  env: UserEnv;
  size: Record<"width" | "height", number | undefined>;
}

export interface PhotoFooterProps {
  image: TaggedImage | undefined;
  timeSettings: TimeSettings;
  botOnline: boolean;
  distance?: number;
  children?: React.ReactNode;
  defaultAxes: string;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  dispatch: Function;
  movementState: MovementState;
}

export interface MoveToLocationProps {
  botOnline: boolean;
  imageLocation: BotPosition;
  defaultAxes: string;
  arduinoBusy: boolean;
  currentBotLocation: BotPosition;
  dispatch: Function;
  movementState: MovementState;
}

export interface PhotosComponentState {
  crop: boolean;
  rotate: boolean;
  fullscreen: boolean;
}
