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

const download = (dispatch: Function) =>
  <T extends TR>(kind: T["kind"], url: string) => axios
    .get<T["body"] | T["body"][]>(url)
    .then(({ data }) => {
      dispatch(resourceReady(kind, newTaggedResource(kind, data)));
    }, Session.clear);

export async function fetchSyncData(dispatch: Function) {
  const get = download(dispatch);

  /** Resources are placed into groups based on their dependencies. */
  const group = {
    0: () => [
      get("Device", API.current.devicePath),
      get("FbosConfig", API.current.fbosConfigPath),
      get("FirmwareConfig", API.current.firmwareConfigPath),
      get("FarmwareEnv", API.current.farmwareEnvPath),
      get("FarmwareInstallation", API.current.farmwareInstallationPath),
    ],
    1: () => [
      get("Peripheral", API.current.peripheralsPath),
      get("Point", API.current.pointsPath),
      get("SensorReading", API.current.sensorReadingPath),
      get("Sensor", API.current.sensorPath),
      get("Tool", API.current.toolsPath)
    ],
    2: () => [
      get("Sequence", API.current.sequencesPath)
    ],
    3: () => [
      get("Regimen", API.current.regimensPath),
      get("PinBinding", API.current.pinBindingPath)
    ],
    4: () => [
      get("FarmEvent", API.current.farmEventsPath),
      get("DiagnosticDump", API.current.diagnosticDumpsPath),
      get("Image", API.current.imagesPath),
      get("Log", API.current.filteredLogsPath),
      get("PlantTemplate", API.current.plantTemplatePath),
      get("SavedGarden", API.current.savedGardensPath),
      get("Peripheral", API.current.peripheralsPath),
      get("User", API.current.usersPath),
      get("WebAppConfig", API.current.webAppConfigPath),
      get("WebcamFeed", API.current.webcamFeedPath)
    ],
  };
  const mapper = async (num: keyof typeof group) => await group[num]();
  [0, 1, 2, 3, 4].map(mapper);
}
