import { UserEnv } from "../../devices/interfaces";
import { SaveFarmwareEnv } from "../../farmware/interfaces";

export interface CaptureSettingsProps {
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  botOnline: boolean;
  dispatch: Function;
  version: string;
}

export interface CaptureSettingsState {
  open: boolean;
}

export interface RotationSettingProps {
  version: string;
  env: UserEnv;
  dispatch: Function;
  saveFarmwareEnv(key: string, value: string): void;
}

export interface CaptureSizeSelectionProps {
  env: UserEnv;
  dispatch: Function;
  saveFarmwareEnv(key: string, value: string): void;
}

export interface CaptureSizeSelectionState {
  custom: boolean;
}

export interface UpdateRowProps {
  version: string;
  botOnline: boolean;
}

export interface CameraSelectionProps {
  env: UserEnv;
  botOnline: boolean;
  saveFarmwareEnv: SaveFarmwareEnv;
  dispatch: Function;
}

export interface CameraSelectionState {
  cameraStatus: "" | "sending" | "done" | "error";
}
