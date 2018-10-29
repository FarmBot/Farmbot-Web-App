import axios from "axios";
import { API } from "../api";
import { Actions } from "../constants";
import { TaggedResource } from "farmbot";
import { Session } from "../session";

export interface SyncResponse<T extends TaggedResource> {
  type: Actions.RESOURCE_READY;
  payload: { kind: T["kind"]; body: T["body"] | T["body"][]; }
}

export const resourceReady =
  <T extends TaggedResource>(kind: T["kind"], body: T["body"] | T["body"][]) => {
    return { type: Actions.RESOURCE_READY, payload: { kind, body, } };
  };

export function fetchSyncData(dispatch: Function) {
  const fetch =
    <T extends TaggedResource>(kind: T["kind"], url: string) => axios
      .get<T["body"] | T["body"][]>(url)
      .then(({ data }) => dispatch(resourceReady(kind, data)), Session.clear);

  fetch("User", API.current.usersPath);
  fetch("Device", API.current.devicePath);
  fetch("WebcamFeed", API.current.webcamFeedPath);
  fetch("FbosConfig", API.current.fbosConfigPath);
  fetch("WebAppConfig", API.current.webAppConfigPath);
  fetch("FirmwareConfig", API.current.firmwareConfigPath);
  fetch("FarmEvent", API.current.farmEventsPath);
  fetch("Image", API.current.imagesPath);
  fetch("Log", API.current.filteredLogsPath);
  fetch("Peripheral", API.current.peripheralsPath);
  fetch("Point", API.current.allPointsPath);
  fetch("Regimen", API.current.regimensPath);
  fetch("Sequence", API.current.sequencesPath);
  fetch("Tool", API.current.toolsPath);
  fetch("SensorReading", API.current.sensorReadingPath);
  fetch("Sensor", API.current.sensorPath);
  fetch("FarmwareInstallation", API.current.farmwareInstallationPath);
  fetch("FarmwareEnv", API.current.farmwareEnvPath);
  fetch("PinBinding", API.current.pinBindingPath);
  fetch("SavedGarden", API.current.savedGardensPath);
  fetch("PlantTemplate", API.current.plantTemplatePath);
  fetch("DiagnosticDump", API.current.diagnosticDumpsPath);
}
