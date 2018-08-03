import { Dictionary, FarmwareManifest, SyncStatus } from "farmbot/dist";
import { NetworkState } from "../connectivity/interfaces";
import { BooleanConfigKey } from "../config_storage/web_app_configs";

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
}

export type FarmwareManifestEntry = Record<"name" | "manifest", string>;

export interface FarmwareConfigMenuProps {
  show: boolean | undefined;
  dispatch: Function;
  firstPartyFwsInstalled: boolean;
}

export type Farmwares = Dictionary<FarmwareManifest | undefined>;
