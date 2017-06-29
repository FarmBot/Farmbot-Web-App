import { TaggedImage } from "../resources/tagged_resources";
import { WD_ENV } from "./weed_detector/remote_env/interfaces";

export interface Image {
  id: number;
  device_id: number;
  attachment_processed_at: string | undefined;
  updated_at: string;
  created_at: string;
  attachment_url: string;
  meta: {
    x: number | undefined;
    y: number | undefined;
    z: number | undefined;
  };
}

/** Hue, Saturation, Value */
export type HSV = "H" | "S" | "V";

/** A simple range object. */
export interface HiLo {
  hi: number;
  lo: number;
}

export interface DetectorState {
  isEditing: boolean;
  deletionProgress: string;
  settingsMenuOpen: boolean;
  /** Defined only if the bot is online AND its been setup */
  remoteFarmwareSettings: Partial<WD_ENV>;
}

export interface FarmbotPickerProps {
  h: [number, number];
  s: [number, number];
  v: [number, number];
}

export interface EnvSliderProps {
  name: HSV;
  env: Partial<WD_ENV>;
  onChange?: (key: HSV, val: [number, number]) => void;
}

export interface EnvSliderState extends Partial<HiLo> {
  sliding: boolean;
}

export interface ImageFlipperProps {
  onFlip(uuid: string | undefined): void;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
}

export interface ImageFlipperState {
  isLoaded: boolean;
}
