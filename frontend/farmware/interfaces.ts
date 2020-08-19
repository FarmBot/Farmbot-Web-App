import { Dictionary, FarmwareConfig } from "farmbot";

export interface FarmwareState {
  currentFarmware: string | undefined;
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

/** Function to save a Farmware env variable to the API. */
export type SaveFarmwareEnv =
  (key: string, value: string) => (dispatch: Function) => void;
