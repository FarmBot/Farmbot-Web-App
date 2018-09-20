import axios from "axios";
import { SensorReading, Sensor, FarmwareEnv } from "../interfaces";
import { API } from "../api";
import { Sequence } from "../sequences/interfaces";
import { Tool } from "../tools/interfaces";
import { Regimen } from "../regimens/interfaces";
import { SavedGarden } from "../farm_designer/interfaces";
import { DeviceAccountSettings } from "../devices/interfaces";
import { ResourceName, DiagnosticDump } from "farmbot";
import { User } from "../auth/interfaces";
import { WebcamFeed } from "../controls/interfaces";
import { WebAppConfig } from "../config_storage/web_app_configs";
import { Session } from "../session";
import { FbosConfig } from "../config_storage/fbos_configs";
import { FirmwareConfig } from "../config_storage/firmware_configs";
import {
  FarmEvent,
  Image,
  Log,
  Point,
  Peripheral,
  FarmwareInstallation,
  PinBinding,
  PlantTemplate
} from "farmbot/dist/resources/api_resources";
import { Actions } from "../constants";

export interface ResourceReadyPayl {
  name: ResourceName;
  data: object[];
}

export interface SyncResponse {
  type: Actions.RESOURCE_READY;
  payload: ResourceReadyPayl;
}

export function fetchSyncData(dispatch: Function) {
  const fetch =
    <T>(name: ResourceName, url: string, type = Actions.RESOURCE_READY) => axios
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
  fetch<Log[]>("Log", API.current.filteredLogsPath);
  fetch<Peripheral[]>("Peripheral", API.current.peripheralsPath);
  fetch<Point[]>("Point", API.current.allPointsPath);
  fetch<Regimen[]>("Regimen", API.current.regimensPath);
  fetch<Sequence[]>("Sequence", API.current.sequencesPath);
  fetch<Tool[]>("Tool", API.current.toolsPath);
  fetch<SensorReading[]>("SensorReading", API.current.sensorReadingPath);
  fetch<Sensor[]>("Sensor", API.current.sensorPath);
  fetch<FarmwareInstallation[]>("FarmwareInstallation",
    API.current.farmwareInstallationPath);
  fetch<FarmwareEnv[]>("FarmwareEnv", API.current.farmwareEnvPath);
  fetch<PinBinding[]>("PinBinding", API.current.pinBindingPath);
  fetch<SavedGarden[]>("SavedGarden", API.current.savedGardensPath);
  fetch<PlantTemplate[]>("PlantTemplate", API.current.plantTemplatePath);
  fetch<DiagnosticDump[]>("DiagnosticDump", API.current.diagnosticDumpsPath);
}
