import * as Axios from "axios";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { Thunk, GetState } from "../redux/interfaces";
import { API } from "../api";
import { Progress, ProgressCallback } from "../util";
import { GenericPointer } from "../interfaces";
import { devices } from "../device";
const QUERY = { meta: { created_by: "plant-detection" } };

export function selectImage(uuid: string | undefined) {
  return { type: "SELECT_IMAGE", payload: uuid };
}

export function resetWeedDetection(cb: ProgressCallback): Thunk {
  return async function (dispatch, getState) {
    const URL = API.current.pointSearchPath;
    try {
      let { data } = await Axios.post<GenericPointer[]>(URL, QUERY);
      let ids = data.map(x => x.id);
      // If you delete too many points, you will violate the URL length
      // limitation of 2,083. Chunking helps fix that.
      let chunks = _.chunk(ids, 179 /* Prime numbers, why not? */);
      let prog = new Progress(chunks.length, cb);
      prog.inc();
      let promises = chunks.map(function (chunk) {
        return Axios
          .delete(API.current.pointsPath + chunk.join(","))
          .then(function (x) {
            prog.inc();
            return x;
          });
      });
      Promise
        .all(promises)
        .then(function () {
          dispatch({
            type: "DELETE_POINT_OK",
            payload: ids
          });
          success(t("Deleted {{num}} weeds", { num: ids.length }));
          prog.finish();
        })
        .catch(function (e) {
          error(t("Some weeds failed to delete. Please try again."));
          prog.finish();
        });
    } catch (e) {
      throw e;
    }
  };
};

const value = "PLANT_DETECTION_selected_image";

export function detectWeeds(imageId: number) {
  return function (dispatch: Function, getState: GetState) {
    let dictionary = getState().bot.hardware.process_info.farmwares;
    let processes = Object
      .keys(dictionary)
      .map(key => dictionary[key])
      .filter(fw => fw.name === "take-photo")
      .map(proc => {
        devices
          .current
          .execScript(proc.uuid, [{
            kind: "pair", args: { value, label: "" + imageId }
          }]);
      })
  }
}
