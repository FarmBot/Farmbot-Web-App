import axios from "axios";
import { API } from "../api";
import { Actions } from "../constants";
import { TaggedResource as TR, SpecialStatus, TaggedResource } from "farmbot";
import { Session } from "../session";
import { arrayWrap, generateUuid } from "../resources/util";

export interface SyncBodyContents<T extends TR> {
  kind: T["kind"];
  body: T[];
}
export interface SyncResponse<T extends TR> {
  type: Actions.RESOURCE_READY;
  payload: SyncBodyContents<T>
}

export const resourceReady =
  <T extends TR>(kind: T["kind"], body: T | T[]): SyncResponse<T> => {
    return {
      type: Actions.RESOURCE_READY,
      payload: { kind, body: arrayWrap(body) }
    };
  };

export const newTaggedResource = <T extends TR>(kind: T["kind"],
  bodies: T["body"] | T["body"][],
  specialStatus = SpecialStatus.SAVED): T[] => {
  const arr = arrayWrap(bodies);
  return arr.map((body: T["body"]): T => {
    return {
      kind: kind as TaggedResource["kind"],
      body: body as TaggedResource["body"],
      uuid: generateUuid(body && body.id ? body.id : undefined, kind),
      specialStatus
    } as T;
  });
};

export function fetchSyncData(dispatch: Function) {
  const fetch =
    <T extends TR>(kind: T["kind"], url: string) => axios
      .get<T["body"] | T["body"][]>(url)
      .then(({ data }) => {
        dispatch(resourceReady(kind, newTaggedResource(kind, data)));
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
