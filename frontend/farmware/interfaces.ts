import {
  Dictionary, FarmwareConfig, TaggedImage, SyncStatus,
  TaggedFarmwareInstallation, JobProgress,
} from "farmbot";
import { UserEnv, ShouldDisplay } from "../devices/interfaces";
import { NetworkState } from "../connectivity/interfaces";
import { TimeSettings } from "../interfaces";
import { GetWebAppConfigValue } from "../config_storage/actions";

export interface FarmwareState {
  currentFarmware: string | undefined;
  currentImage: string | undefined;
  firstPartyFarmwareNames: string[];
  infoOpen: boolean;
}

export type Farmwares = Dictionary<FarmwareManifestInfo>;

export interface FarmwareManifestInfo {
  name: string;
  installation_pending: boolean;
  url: string;
  config: FarmwareConfig[];
  meta: {
    fbos_version: string;
    farmware_tools_version: string;
    description: string;
    language: string;
    version: string;
    author: string;
  }
}

export interface FarmwareProps {
  dispatch: Function;
  env: UserEnv;
  images: TaggedImage[];
  currentImage: TaggedImage | undefined;
  botToMqttStatus: NetworkState;
  farmwares: Farmwares;
  timeSettings: TimeSettings;
  syncStatus: SyncStatus | undefined;
  getConfigValue: GetWebAppConfigValue;
  firstPartyFarmwareNames: string[];
  currentFarmware: string | undefined;
  shouldDisplay: ShouldDisplay;
  saveFarmwareEnv: SaveFarmwareEnv;
  taggedFarmwareInstallations: TaggedFarmwareInstallation[];
  imageJobs: JobProgress[];
  infoOpen: boolean;
}

/** Function to save a Farmware env variable to the API. */
export type SaveFarmwareEnv =
  (key: string, value: string) => (dispatch: Function) => void;
