import axios from "axios";
import { warning } from "farmbot-toastr";
import { Log, AnyPointer } from "../interfaces";
import { API } from "../api";
import { Sequence } from "../sequences/interfaces";
import { Tool } from "../tools/interfaces";
import { Regimen } from "../regimens/interfaces";
import { Peripheral } from "../controls/peripherals/interfaces";
import { FarmEvent } from "../farm_designer/interfaces";
import { Image } from "../farmware/images/interfaces";
import { DeviceAccountSettings } from "../devices/interfaces";
import { ResourceName } from "../resources/tagged_resources";
import { User } from "../auth/interfaces";
import { HttpData } from "../util";
import { WebcamFeed } from "../controls/interfaces";

export interface ResourceReadyPayl {
  name: ResourceName;
  data: object[];
}

export interface SyncResponse {
  type: "RESOURCE_READY";
  payload: ResourceReadyPayl;
}

export function fetchSyncData(dispatch: Function) {
  const fetch = <T>(name: ResourceName, url: string, type = "RESOURCE_READY") =>
    axios
      .get(url)
      .then((r: HttpData<T>): SyncResponse => dispatch({
        type, payload: { name, data: r.data }
      }), fail);

  const fail = () => warning("Please try refreshing the page or logging in again.",
    "Error downloading data");

  fetch<User>("users", API.current.usersPath);
  fetch<DeviceAccountSettings>("device", API.current.devicePath);
  fetch<WebcamFeed>("webcam_feed", API.current.webcamFeedPath);
  fetch<FarmEvent[]>("farm_events", API.current.farmEventsPath);
  fetch<Image[]>("images", API.current.imagesPath);
  fetch<Log[]>("logs", API.current.logsPath);
  fetch<Peripheral[]>("peripherals", API.current.peripheralsPath);
  fetch<AnyPointer[]>("points", API.current.pointsPath);
  fetch<Regimen[]>("regimens", API.current.regimensPath);
  fetch<Sequence[]>("sequences", API.current.sequencesPath);
  fetch<Tool[]>("tools", API.current.toolsPath);
}
