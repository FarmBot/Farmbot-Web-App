import { SyncStatus, Dictionary, FarmwareManifest } from "farmbot/dist";

export interface FWState {
  selectedFarmware: string | undefined;
  packageUrl: string | undefined;
  firstPartyList: string[];
  showFirstParty: boolean;
}

export interface FWProps {
  syncStatus: SyncStatus;
  farmwares: Dictionary<FarmwareManifest | undefined>;
}

export interface FarmwareState {
  currentImage: string | undefined;
}

export type FarmwareManifestEntry = Record<"name" | "manifest", string>;

export interface FarmwareConfigMenuProps {
  show: boolean | undefined;
  toggle(): void;
  firstPartyFwsInstalled: boolean;
}
