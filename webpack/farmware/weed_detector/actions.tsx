import * as _ from "lodash";
import axios from "axios";
import { t } from "i18next";
import { success, error } from "farmbot-toastr";
import { Thunk } from "../../redux/interfaces";
import { API } from "../../api";
import { Progress, ProgressCallback, trim } from "../../util";
import { getDevice } from "../../device";
import { noop } from "lodash";
import { GenericPointer } from "farmbot/dist/resources/api_resources";
import { Actions } from "../../constants";

export function deletePoints(
  pointName: string, createdBy: string, cb?: ProgressCallback): Thunk {
  // TODO: Generalize and add to api/crud.ts
  return async function (dispatch) {
    const URL = API.current.pointSearchPath;
    const QUERY = { meta: { created_by: createdBy } };
    try {
      const resp = await axios.post<GenericPointer[]>(URL, QUERY);
      const ids = resp.data.map(x => x.id);
      // If you delete too many points, you will violate the URL length
      // limitation of 2,083. Chunking helps fix that.
      const chunks = _.chunk(ids, 179 /* Prime numbers, why not? */);
      const prog = new Progress(chunks.length, cb || noop);
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
            type: Actions.DELETE_POINT_OK,
            payload: ids
          });
          success(t("Deleted {{num}} {{points}}", {
            num: ids.length, points: pointName
          }), t("Success"));
          prog.finish();
        })
        .catch(function () {
          error(trim(`${t("Some {{points}} failed to delete.",
            { points: pointName })}
            ${t("Are they in use by sequences?")}`));
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
      }])
      .catch(() => { });
  };
}

export function test() {
  return function () {
    getDevice().execScript("plant-detection").catch(() => { });
  };
}
