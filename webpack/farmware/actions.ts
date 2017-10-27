import axios from "axios";
import { HttpData } from "../util";
import { FarmwareManifestEntry } from "./interfaces";

const farmwareManifestUrl =
  "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests" +
  "/master/manifest.json";

export function getFirstPartyFarmwareList(setList: (x: string[]) => void) {
  axios.get(farmwareManifestUrl)
    .then((r: HttpData<FarmwareManifestEntry[]>) => {
      const names = r.data.map((fw: FarmwareManifestEntry) => {
        return fw.name;
      });
      setList(names);
    });
}
