import axios from "axios";
import { Actions } from "../constants";
import { urlFor } from "../api/crud";
import { API } from "../api";
import { FarmwareManifest } from "farmbot";

export const getFirstPartyFarmwareList = () => {
  return (dispatch: Function) => {
    axios.get<FarmwareManifest[]>(API.current.firstPartyFarmwarePath)
      .then(r => {
        const names = r.data.map(fw => fw.package);
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
