import axios from "axios";
import { Log, Point, SensorReading, Sensor, DeviceConfig, PinBinding } from "../interfaces";
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
import { WebcamFeed } from "../controls/interfaces";
import { WebAppConfig } from "../config_storage/web_app_configs";
import { Session } from "../session";
import { FbosConfig } from "../config_storage/fbos_configs";
import { FarmwareInstallation } from "../farmware/interfaces";
import { FirmwareConfig } from "../config_storage/firmware_configs";

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
      .get<T>(url)
      .then((r): SyncResponse => dispatch({
        type, payload: { name, data: r.data }
      }),
        /** NOTE: If a key resource fails to load, the app is guaranteed to be
         * broke. Don't try to recover- just log the user out. It's probably a
         * malformed token in SessionStorage */
        Session.clear);

  fetch<User>("User", API.current.usersPath);
  fetch<DeviceAccountSettings>("Device", API.current.devicePath);
  fetch<WebcamFeed>("WebcamFeed", API.current.webcamFeedPath);
  fetch<FbosConfig>("FbosConfig", API.current.fbosConfigPath);
  fetch<WebAppConfig>("WebAppConfig", API.current.webAppConfigPath);
  fetch<FirmwareConfig>("FirmwareConfig", API.current.firmwareConfigPath);
  fetch<FarmEvent[]>("FarmEvent", API.current.farmEventsPath);
  fetch<Image[]>("Image", API.current.imagesPath);
  fetch<Log[]>("Log", API.current.logsPath);
  fetch<Peripheral[]>("Peripheral", API.current.peripheralsPath);
  fetch<Point[]>("Point", API.current.pointsPath);
  fetch<Regimen[]>("Regimen", API.current.regimensPath);
  fetch<Sequence[]>("Sequence", API.current.sequencesPath);
  fetch<Tool[]>("Tool", API.current.toolsPath);
  fetch<SensorReading[]>("SensorReading", API.current.sensorReadingPath);
  fetch<Sensor[]>("Sensor", API.current.sensorPath);
  fetch<FarmwareInstallation[]>("FarmwareInstallation",
    API.current.farmwareInstallationPath);
  fetch<DeviceConfig[]>("DeviceConfig", API.current.deviceConfigPath);
  fetch<PinBinding[]>("PinBinding", API.current.pinBindingPath);
}
