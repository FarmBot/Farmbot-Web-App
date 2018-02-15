import axios from "axios";
import { HttpData } from "../util";
import { FarmwareManifestEntry } from "./interfaces";
import { Actions } from "../constants";

const farmwareManifestUrl =
  "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests" +
  "/master/manifest.json";

export const getFirstPartyFarmwareList = () => {
  return (dispatch: Function) => {
    axios.get(farmwareManifestUrl)
      .then((r: HttpData<FarmwareManifestEntry[]>) => {
        const names = r.data.map((fw: FarmwareManifestEntry) => {
          return fw.name;
        });
        dispatch({
          type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
          payload: names
        });
      });
  };
};
