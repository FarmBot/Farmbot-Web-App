import { WD_ENV } from "../remote_env/interfaces";
import { UserEnv } from "../../devices/interfaces";
import { TaggedImage, SyncStatus } from "farmbot";
import { NetworkState } from "../../connectivity/interfaces";
import { TimeSettings } from "../../interfaces";
import { SaveFarmwareEnv } from "../../farmware/interfaces";
import { PhotosPanelState } from "../interfaces";

export interface WeedDetectorProps {
  dispatch: Function;
  wDEnv: Partial<WD_ENV>;
  env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  saveFarmwareEnv: SaveFarmwareEnv;
  showAdvanced: boolean;
  photosPanelState: PhotosPanelState;
}
