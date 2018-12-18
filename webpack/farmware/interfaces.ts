import { Dictionary, FarmwareManifest, SyncStatus } from "farmbot/dist";
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
}

export type FarmwareManifestEntry = Record<"name" | "manifest", string>;

export interface FarmwareConfigMenuProps {
  show: boolean | undefined;
  dispatch: Function;
  firstPartyFwsInstalled: boolean;
  shouldDisplay: ShouldDisplay;
}

export type Farmwares = Dictionary<FarmwareManifest | undefined>;
