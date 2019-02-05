import { WD_ENV } from "./remote_env/interfaces";

export interface SettingsMenuProps {
  values: Partial<WD_ENV>;
  onChange(key: keyof WD_ENV, value: number): void;
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
  invertHue?: boolean;
}

export interface EnvSliderProps {
  name: HSV;
  env: Partial<WD_ENV>;
  onChange?: (key: HSV, val: [number, number]) => void;
}

export interface EnvSliderState extends Partial<HiLo> {
  sliding: boolean;
}
