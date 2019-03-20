import axios from "axios";
import { FarmwareManifestEntry } from "./interfaces";
import { Actions } from "../constants";
import { urlFor } from "../api/crud";

const farmwareManifestUrl =
  "https://raw.githubusercontent.com/FarmBot-Labs/farmware_manifests" +
  "/master/manifest.json";

export const getFirstPartyFarmwareList = () => {
  return (dispatch: Function) => {
    axios.get<FarmwareManifestEntry[]>(farmwareManifestUrl)
      .then(r => {
        const names = r.data.map((fw: FarmwareManifestEntry) => fw.name);
        dispatch({
          type: Actions.FETCH_FIRST_PARTY_FARMWARE_NAMES_OK,
          payload: names
        });
      });
  };
};

export const retryFetchPackageName = (id: number | undefined) =>
  id &&
  axios.post(`${urlFor("FarmwareInstallation")}${id}/refresh`).then(() => { });
