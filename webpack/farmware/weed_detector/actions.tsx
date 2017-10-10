import * as _ from "lodash";
import axios from "axios";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { Thunk } from "../../redux/interfaces";
import { API } from "../../api";
import { Progress, ProgressCallback, HttpData } from "../../util";
import { GenericPointer } from "../../interfaces";
import { getDevice } from "../../device";
import { WDENVKey } from "./remote_env/interfaces";
import { NumericValues } from "./image_workspace";
import { envSave } from "./remote_env/actions";
type Key = keyof NumericValues;
type Translation = Record<Key, WDENVKey>;
const QUERY = { meta: { created_by: "plant-detection" } };

export let translateImageWorkspaceAndSave = (map: Translation) => {
  return (key: Key, value: number) => {
    envSave(map[key], value);
  };
};

export function resetWeedDetection(cb: ProgressCallback): Thunk {
  // TODO: Generalize and add to api/crud.ts
  return async function (dispatch, getState) {
    const URL = API.current.pointSearchPath;
    try {
      const resp: HttpData<GenericPointer[]> = await axios.post(URL, QUERY);
      const ids = resp.data.map(x => x.id);
      // If you delete too many points, you will violate the URL length
      // limitation of 2,083. Chunking helps fix that.
      const chunks = _.chunk(ids, 179 /* Prime numbers, why not? */);
      const prog = new Progress(chunks.length, cb);
      prog.inc();
      const promises = chunks.map(function (chunk) {
        return axios
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
}

const label = "PLANT_DETECTION_selected_image";

export function scanImage(imageId: number) {
  return function () {
    getDevice()
      .execScript("historical-plant-detection", [{
        kind: "pair", args: { label: label, value: "" + imageId }
      }]);
  };
}

export function test() {
  return function () {
    getDevice().execScript("plant-detection");
  };
}
