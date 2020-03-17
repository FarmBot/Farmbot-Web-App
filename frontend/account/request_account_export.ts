import { API } from "../api";
import { Content } from "../constants";
import { success } from "../toast/toast";
import axios, { AxiosResponse } from "axios";
import { DeviceAccountSettings } from "farmbot/dist/resources/api_resources";
import { t } from "../i18next_wrapper";

interface DataDumpExport { device?: DeviceAccountSettings; }
type Response = AxiosResponse<DataDumpExport | undefined>;

export function generateFilename({ device }: DataDumpExport): string {
  const nameAndId = device ? (device.name + "_" + device.id) : "farmbot";
  return `export_${nameAndId}.json`.toLowerCase();
}

// Thanks, @KOL - https://stackoverflow.com/a/19328891/1064917
export function jsonDownload(data: object, fname = generateFilename(data)) {
  // When email is not available on the API (self hosted).
  // Will synchronously load backup over the wire (slow)
  const a = document.createElement("a");
  document.body.appendChild(a);
  a.style.display = "none";
  const json = JSON.stringify(data),
    blob = new Blob([json], { type: "octet/stream" }),
    url = window.URL.createObjectURL(blob);
  a.href = url;
  a.download = fname;
  a.click();
  window.URL.revokeObjectURL(url);
  return a;
}

const ok = (resp: Response) => {
  const { data } = resp;
  return data ? jsonDownload(data) : success(t(Content.EXPORT_SENT));
};

export const requestAccountExport =
  () => axios
    .post(API.current.exportDataPath)
    .then(ok);
