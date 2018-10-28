import { RestResources, ResourceIndex } from "./interfaces";
import {
  TaggedResource,
  ResourceName,
  SpecialStatus,
} from "farmbot";
import {
  sanityCheck,
  isTaggedResource,
} from "./tagged_resources";
import {
  initialState as sequenceState,
  sequenceReducer as sequences,
} from "../sequences/reducer";
import {
  initialState as regimenState,
  regimensReducer as regimens
} from "../regimens/reducer";
import { combineReducers } from "redux";
import { ReduxAction } from "../redux/interfaces";
import {
  designer as farm_designer,
  initialState as designerState
} from "../farm_designer/reducer";
import {
  farmwareReducer as farmware,
  farmwareState
} from "../farmware/reducer";
import {
  helpReducer as help,
  initialState as helpState
} from "../help/reducer";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";
import { reindexResource } from "./reducer_indexing";

export function emptyState(): RestResources {
  return {
    consumers: {
      sequences: sequenceState,
      regimens: regimenState,
      farm_designer: designerState,
      farmware: farmwareState,
      help: helpState,
    },
    loaded: [],
    index: {
      all: [],
      byKind: {
        WebcamFeed: [],
        Device: [],
        FarmEvent: [],
        Image: [],
        Plant: [],
        Log: [],
        Peripheral: [],
        Crop: [],
        Point: [],
        Regimen: [],
        Sequence: [],
        Tool: [],
        User: [],
        FbosConfig: [],
        FirmwareConfig: [],
        WebAppConfig: [],
        SensorReading: [],
        Sensor: [],
        FarmwareInstallation: [],
        FarmwareEnv: [],
        PinBinding: [],
        PlantTemplate: [],
        SavedGarden: [],
        DiagnosticDump: []
      },
      byKindAndId: {},
      references: {}
    }
  };
}

export const initialState: RestResources = emptyState();

export function joinKindAndId(kind: ResourceName, id: number | undefined) {
  return `${kind}.${id || 0}`;
}

/** Any reducer that uses TaggedResources (or UUIDs) must live within the
 * resource reducer. Failure to do so can result in stale UUIDs, referential
 * integrity issues and other bad stuff. The variable below contains all
 * resource consuming reducers. */
const consumerReducer = combineReducers<RestResources["consumers"]>({
  regimens,
  sequences,
  farm_designer,
  farmware,
  help
} as any); // tslint:disable-line

/** The resource reducer must have the first say when a resource-related action
 * fires off. Afterwards, sub-reducers are allowed to make sense of data
 * changes. A common use case for sub-reducers is to listen for
 * `DESTROY_RESOURCE_OK` and clean up stale UUIDs. */
export const afterEach = (state: RestResources, a: ReduxAction<object>) => {
  state.consumers = consumerReducer({
    sequences: state.consumers.sequences,
    regimens: state.consumers.regimens,
    farm_designer: state.consumers.farm_designer,
    farmware: state.consumers.farmware,
    help: state.consumers.help,
  }, a);
  return state;
};

/** Helper method to change the `specialStatus` of a resource in the index */
export const mutateSpecialStatus =
  (uuid: string, index: ResourceIndex, status = SpecialStatus.SAVED) => {
    findByUuid(index, uuid).specialStatus = status;
  };

export function initResourceReducer(s: RestResources,
  { payload }: ReduxAction<TaggedResource>): RestResources {
  const tr = payload;
  reindexResource(s.index, tr);
  s.index.references[tr.uuid] = tr;
  sanityCheck(tr);
  dontTouchThis(tr);
  return s;
}

export function findByUuid(index: ResourceIndex, uuid: string): TaggedResource {
  const x = index.references[uuid];
  if (x && isTaggedResource(x)) {
    return x;
  } else {
    throw new Error("BAD UUID- CANT FIND RESOURCE: " + uuid);
  }
}

export function whoops(origin: string, kind: string): never {
  const msg = `${origin}/${kind}: No handler written for this one yet.`;
  throw new Error(msg);
}
