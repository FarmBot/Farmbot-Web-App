import { ResourceIndex } from "./interfaces";
import {
  TaggedResource,
  SpecialStatus,
  TaggedWebcamFeed,
  TaggedCrop,
  TaggedRegimen,
  TaggedImage,
  TaggedLog,
  TaggedTool,
  TaggedFarmEvent,
  TaggedSequence,
  TaggedPoint,
  TaggedSensor,
  TaggedPeripheral,
  TaggedPinBinding,
  TaggedDiagnosticDump,
  TaggedSensorReading,
  TaggedSavedGarden,
  TaggedPlantTemplate,
  TaggedFarmwareEnv,
  TaggedFarmwareInstallation,
  TaggedAlert,
  TaggedPointGroup,
  TaggedFolder,
} from "farmbot";
import {
  isTaggedResource,
  sanityCheck,
} from "./tagged_resources";
import { bail } from "../util";
import { error } from "../toast/toast";
import { assertUuid } from "./util";
import { joinKindAndId } from "./reducer_support";
import { findAll } from "./find_all";

const isSaved = <T extends TaggedResource>(t: T) =>
  t.specialStatus === SpecialStatus.SAVED;

/** Generalized way to stamp out "finder" functions.
 * Pass in a `ResourceName` and it will add all the relevant checks.
 * WARNING: WILL THROW ERRORS IF RESOURCE NOT FOUND!
 */
const uuidFinder = <T extends TaggedResource>(r: T["kind"]) =>
  function findResource(i: ResourceIndex, u: string): T {
    assertUuid(r, u);
    const result = i.references[u];
    if (result && isTaggedResource(result) && sanityCheck(result)) {
      return result as T;
    } else {
      error("Resource error");
      throw new Error(`Tagged resource ${r} was not found or malformed: ` +
        JSON.stringify(result));
    }
  };

export const findTool = uuidFinder<TaggedTool>("Tool");
export const findSequence = uuidFinder<TaggedSequence>("Sequence");
export const findRegimen = uuidFinder<TaggedRegimen>("Regimen");
export const findFarmEvent = uuidFinder<TaggedFarmEvent>("FarmEvent");
export const findPoints = uuidFinder<TaggedPoint>("Point");
export const findPointGroup = uuidFinder<TaggedPoint>("Point");
export const findSavedGarden = uuidFinder<TaggedSavedGarden>("SavedGarden");

export const selectAllCrops =
  (i: ResourceIndex) => findAll<TaggedCrop>(i, "Crop");
export const selectAllSavedGardens = (i: ResourceIndex) =>
  findAll<TaggedSavedGarden>(i, "SavedGarden");
export const selectAllPlantTemplates = (i: ResourceIndex) =>
  findAll<TaggedPlantTemplate>(i, "PlantTemplate");
export const selectAllFarmEvents = (i: ResourceIndex) =>
  findAll<TaggedFarmEvent>(i, "FarmEvent");
export const selectAllImages =
  (i: ResourceIndex) => findAll<TaggedImage>(i, "Image");
export const selectAllLogs = (i: ResourceIndex) => findAll<TaggedLog>(i, "Log");
export const selectAllPeripherals =
  (i: ResourceIndex) => findAll<TaggedPeripheral>(i, "Peripheral");
export const selectAllPoints =
  (i: ResourceIndex) => findAll<TaggedPoint>(i, "Point");
export const selectAllPointGroups =
  (i: ResourceIndex) => findAll<TaggedPointGroup>(i, "PointGroup");
export const selectAllActivePoints = (input: ResourceIndex) =>
  selectAllPoints(input).filter(x => !x.body.discarded_at);

export const selectAllDiagnosticDumps =
  (i: ResourceIndex) => findAll<TaggedDiagnosticDump>(i, "DiagnosticDump");
export const selectAllFarmwareEnvs =
  (i: ResourceIndex) => findAll<TaggedFarmwareEnv>(i, "FarmwareEnv");
export const selectAllFarmwareInstallations = (i: ResourceIndex) =>
  findAll<TaggedFarmwareInstallation>(i, "FarmwareInstallation");
export const selectAllRegimens = (i: ResourceIndex) =>
  findAll<TaggedRegimen>(i, "Regimen");
export const selectAllSensors =
  (i: ResourceIndex) => findAll<TaggedSensor>(i, "Sensor");
export const selectAllPinBindings =
  (i: ResourceIndex) => findAll<TaggedPinBinding>(i, "PinBinding");
export const selectAllSequences = (i: ResourceIndex) =>
  findAll<TaggedSequence>(i, "Sequence");
export const selectAllSensorReadings = (i: ResourceIndex) =>
  findAll<TaggedSensorReading>(i, "SensorReading");
export const selectAllTools =
  (i: ResourceIndex) => findAll<TaggedTool>(i, "Tool");
export const selectAllSavedSensors =
  (input: ResourceIndex) => selectAllSensors(input).filter(isSaved);
export const selectAllWebcamFeeds =
  (i: ResourceIndex) => findAll<TaggedWebcamFeed>(i, "WebcamFeed");
export const selectAllSavedPeripherals =
  (input: ResourceIndex) => selectAllPeripherals(input).filter(isSaved);
export const selectAllAlerts =
  (i: ResourceIndex) => findAll<TaggedAlert>(i, "Alert");
export const selectAllFolders =
  (i: ResourceIndex) => findAll<TaggedFolder>(i, "Folder");

export const findByKindAndId = <T extends TaggedResource>(
  i: ResourceIndex, kind: T["kind"], id: number | undefined): T => {
  const kni = joinKindAndId(kind, id);
  const uuid = i.byKindAndId[kni] || bail("Not found: " + kni);
  const resource = i.references[uuid] || bail("Not found uuid: " + uuid);
  if (resource.kind === kind) {
    return resource as T; // Why `as T`?
  } else {
    return bail("Impossible! " + uuid);
  }
};
