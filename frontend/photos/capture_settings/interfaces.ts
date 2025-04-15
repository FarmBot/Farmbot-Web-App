import { UserEnv } from "../../devices/interfaces";
import { SaveFarmwareEnv } from "../../farmware/interfaces";

export interface CaptureSettingsProps {
  env: UserEnv;
  saveFarmwareEnv: SaveFarmwareEnv;
  botOnline: boolean;
  dispatch: Function;
  version: string;
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
