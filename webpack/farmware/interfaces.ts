import { SyncStatus, Dictionary, FarmwareManifest } from "farmbot/dist";

export interface FWState {
  selectedFarmware: string | undefined;
  packageUrl: string | undefined;
}

export interface FWProps {
  syncStatus: SyncStatus;
  farmwares: Dictionary<FarmwareManifest | undefined>;
}

export interface FarmwareState {
  currentImage: string | undefined;
}
