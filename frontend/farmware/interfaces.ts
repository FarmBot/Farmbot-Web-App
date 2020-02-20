import { Dictionary, SyncStatus, FarmwareConfig } from "farmbot";
import { NetworkState } from "../connectivity/interfaces";
import { BooleanConfigKey } from "farmbot/dist/resources/configs/web_app";
import { ShouldDisplay } from "../devices/interfaces";

export interface FWState {
  selectedFarmware: string | undefined;
  packageUrl: string | undefined;
}

export interface FWProps {
  botToMqttStatus: NetworkState;
  syncStatus: SyncStatus | undefined;
  farmwares: Farmwares;
  showFirstParty: boolean;
  onToggle(key: BooleanConfigKey): void;
  firstPartyFarmwareNames: string[];
}

export interface FarmwareState {
  currentFarmware: string | undefined;
  currentImage: string | undefined;
  firstPartyFarmwareNames: string[];
  infoOpen: boolean;
}

export interface FarmwareConfigMenuProps {
  show: boolean | undefined;
  dispatch: Function;
  firstPartyFwsInstalled: boolean;
  shouldDisplay: ShouldDisplay;
}

export type Farmwares = Dictionary<FarmwareManifestInfo>;

export interface FarmwareEnv {
  id?: number;
  key: string;
  value: string | number | boolean;
}

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
