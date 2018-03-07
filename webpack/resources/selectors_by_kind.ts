import { ResourceIndex } from "./interfaces";
import {
  TaggedResource,
  SpecialStatus,
  isTaggedResource,
  ResourceName,
  TaggedSequence,
  sanityCheck,
  TaggedWebcamFeed,
  TaggedFbosConfig,
  TaggedCrop,
  TaggedRegimen,
  TaggedImage,
  TaggedLog,
  TaggedTool,
  TaggedPlantPointer,
  TaggedFarmEvent,
  TaggedGenericPointer,
  TaggedToolSlotPointer
} from "./tagged_resources";
import { sortResourcesById, bail } from "../util";
import { error } from "farmbot-toastr";
import { assertUuid } from "./selectors";

interface Finder<T> {
  (i: ResourceIndex, u: string): T;
}
const isSaved =
  <T extends TaggedResource>(t: T) => t.specialStatus === SpecialStatus.SAVED;

/** Generalized way to stamp out "finder" functions.
 * Pass in a `ResourceName` and it will add all the relevant checks.
 * WARNING: WILL THROW ERRORS IF RESOURCE NOT FOUND!
 */
const find = <T extends TaggedResource>(r: T["kind"]) =>
  function findResource(i: ResourceIndex, u: string) {
    assertUuid(r, u);
    const result = i.references[u];
    if (result && isTaggedResource(result) && sanityCheck(result)) {
      return result as TaggedResource;
    } else {
      error("Resource error");
      throw new Error(`Tagged resource ${r} was not found or malformed: ` +
        JSON.stringify(result));
    }
  };

export let findTool = find("Tool") as Finder<TaggedTool>;
export let findSequence = find("Sequence") as Finder<TaggedSequence>;
export let findRegimen = find("Regimen") as Finder<TaggedRegimen>;
export let findFarmEvent = find("FarmEvent") as Finder<TaggedFarmEvent>;
export let findPoints = find("Point") as Finder<TaggedPlantPointer>;

export function selectAllTools(index: ResourceIndex) {
  return findAll(index, "Tool") as TaggedTool[];
}

export function selectAllLogs(index: ResourceIndex) {
  return findAll(index, "Log") as TaggedLog[];
}

export function selectAllImages(index: ResourceIndex) {
  return findAll(index, "Image") as TaggedImage[];
}

export function selectAllRegimens(index: ResourceIndex) {
  return findAll(index, "Regimen") as TaggedRegimen[];
}

export function selectAllCrops(index: ResourceIndex) {
  return findAll(index, "Crop") as TaggedCrop[];
}

export const selectAllPeripherals = getAllPeripherals;

export function getAllSensors(input: ResourceIndex) {
  return input
    .byKind
    .Sensor
    .map(x => input.references[x])
    .map(x => (x && (x.kind == "Sensor")) ? x : bail("Never"));
}

export const getAllSavedPeripherals =
  (input: ResourceIndex) => getAllPeripherals(input).filter(isSaved);
export const getAllSavedSensors =
  (input: ResourceIndex) => getAllSensors(input).filter(isSaved);
export function findAll(index: ResourceIndex, kind: ResourceName) {
  const results: TaggedResource[] = [];

  index.byKind[kind].map(function (uuid) {
    const item = index.references[uuid];
    (item && isTaggedResource(item) && results.push(item));
  });
  return sortResourcesById(results);
}

export function getAllPeripherals(input: ResourceIndex) {
  return input
    .byKind
    .Peripheral
    .map(x => input.references[x])
    .map(x => (x && (x.kind == "Peripheral")) ? x : bail("Never"));
}

export function getFbosConfig(i: ResourceIndex): TaggedFbosConfig | undefined {
  const conf = i.references[i.byKind.FbosConfig[0] || "NO"];
  if (conf && conf.kind === "FbosConfig") {
    return conf;
  }
}

export function getFeeds(index: ResourceIndex): TaggedWebcamFeed[] {
  const list = index.byKind.WebcamFeed;
  const output: TaggedWebcamFeed[] = [];
  list.forEach(y => {
    const x = index.references[y];
    if (x && x.kind === "WebcamFeed") {
      sanityCheck(x);
      output.push(x);
    }
  });
  return output;
}

export function selectAllSequences(index: ResourceIndex) {
  return findAll(index, "Sequence") as TaggedSequence[];
}

export function selectAllFarmEvents(index: ResourceIndex) {
  return findAll(index, "FarmEvent") as TaggedFarmEvent[];
}

export function selectAllPoints(index: ResourceIndex) {
  return findAll(index, "Point") as
    (TaggedGenericPointer | TaggedPlantPointer | TaggedToolSlotPointer)[];
}
