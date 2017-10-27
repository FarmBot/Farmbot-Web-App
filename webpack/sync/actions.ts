import axios from "axios";
import { warning } from "farmbot-toastr";
import { Log, Point } from "../interfaces";
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

  fetch<User>("User", API.current.usersPath);
  fetch<DeviceAccountSettings>("Device", API.current.devicePath);
  fetch<WebcamFeed>("WebcamFeed", API.current.webcamFeedPath);
  fetch<FarmEvent[]>("FarmEvent", API.current.farmEventsPath);
  fetch<Image[]>("Image", API.current.imagesPath);
  fetch<Log[]>("Log", API.current.logsPath);
  fetch<Peripheral[]>("Peripheral", API.current.peripheralsPath);
  fetch<Point[]>("Point", API.current.pointsPath);
  fetch<Regimen[]>("Regimen", API.current.regimensPath);
  fetch<Sequence[]>("Sequence", API.current.sequencesPath);
  fetch<Tool[]>("Tool", API.current.toolsPath);
}
