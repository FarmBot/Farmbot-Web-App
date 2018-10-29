import axios from "axios";
import { API } from "../api";
import { Actions } from "../constants";
import { TaggedResource } from "farmbot";
import { Session } from "../session";

export interface SyncResponse<T extends TaggedResource> {
  type: Actions.RESOURCE_READY;
  kind: T["kind"];
  data: T["body"];
}

export function fetchSyncData(dispatch: Function) {
  const type = Actions.RESOURCE_READY;
  const fetch =
    <T extends TaggedResource>(kind: T["kind"], url: string) => axios
      .get<T["body"]>(url)
      .then(({ data }) => {
        const action: SyncResponse<T> = { type, kind, data };
        dispatch(action);
      }, Session.clear);

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
