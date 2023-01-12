import { ResourceIndex, TaggedPointGroup } from "./interfaces";
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
  TaggedSensorReading,
  TaggedSavedGarden,
  TaggedPlantTemplate,
  TaggedFarmwareEnv,
  TaggedFarmwareInstallation,
  TaggedAlert,
  TaggedFolder,
  TaggedWizardStepResult,
  TaggedTelemetry,
  TaggedCurve,
} from "farmbot";
import {
  isTaggedResource,
  sanityCheck,
} from "./tagged_resources";
import { error } from "../toast/toast";
import { assertUuid } from "./util";
import { findAll } from "./find_all";

const isSaved = <T extends TaggedResource>(t: T) =>
  t.specialStatus === SpecialStatus.SAVED;

/** Generalized way to stamp out "finder" functions.
 * Pass in a `ResourceName` and it will add all the relevant checks.
 * WARNING: WILL THROW ERRORS IF RESOURCE NOT FOUND!
 */
const resourceFinder = <T extends TaggedResource>(r: T["kind"]) =>
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

export const findTool = resourceFinder<TaggedTool>("Tool");
export const findSequence = resourceFinder<TaggedSequence>("Sequence");
export const findRegimen = resourceFinder<TaggedRegimen>("Regimen");
export const findFarmEvent = resourceFinder<TaggedFarmEvent>("FarmEvent");
export const findPointGroup = resourceFinder<TaggedPointGroup>("PointGroup");
export const findSavedGarden = resourceFinder<TaggedSavedGarden>("SavedGarden");

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
  selectAllPoints(input).filter(x => x);
export const selectAllCurves =
  (i: ResourceIndex) => findAll<TaggedCurve>(i, "Curve");

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
export const selectAllWizardStepResults =
  (i: ResourceIndex) => findAll<TaggedWizardStepResult>(i, "WizardStepResult");
export const selectAllSavedPeripherals =
  (input: ResourceIndex) => selectAllPeripherals(input).filter(isSaved);
export const selectAllAlerts =
  (i: ResourceIndex) => findAll<TaggedAlert>(i, "Alert");
export const selectAllTelemetry =
  (i: ResourceIndex) => findAll<TaggedTelemetry>(i, "Telemetry");
export const selectAllFolders =
  (i: ResourceIndex) => findAll<TaggedFolder>(i, "Folder");
