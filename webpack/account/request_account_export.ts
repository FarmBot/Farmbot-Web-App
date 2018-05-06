import { API } from "../api";
import { Content } from "../constants";
import { success } from "farmbot-toastr";
import { t } from "i18next";
import axios, { AxiosResponse } from "axios";

// Thanks, @KOL - https://stackoverflow.com/a/19328891/1064917
function handleNow(data: object) {
  // When email is not available on the API (self hosted).
  // Will synchronously load backup over the wire (slow)
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  const json = JSON.stringify(data),
    blob = new Blob([json], { type: "octet/stream" }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = "farmbot_export.json";
  a.click();
  window.URL.revokeObjectURL(url);
  return a;
}

const ok = (resp: AxiosResponse<{} | undefined>) => {
  const { data } = resp;
  return data ? handleNow(data) : success(t(Content.EXPORT_SENT));
};

export const requestAccountExport =
  () => axios
    .post(API.current.exportDataPath)
    .then(ok);
