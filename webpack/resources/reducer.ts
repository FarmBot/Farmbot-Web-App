import {
  findByUuid,
  initResourceReducer,
  mutateSpecialStatus,
  afterEach,
} from "./reducer_support";
import {
  defensiveClone,
  equals
} from "../util";
import {
  removeFromIndex,
  addAllToIndex,
  reindexResource,
  maybeRecalculateLocalSequenceVariables
} from "./reducer_indexing";
import { generateReducer } from "../redux/generate_reducer";
import { RestResources } from "./interfaces";
import { initialState } from "../resources/reducer_support";
import { TaggedResource, SpecialStatus } from "farmbot";
import { Actions } from "../constants";
import { GeneralizedError } from "./actions";
import { merge } from "lodash";
import { EditResourceParams } from "../api/interfaces";
import { ResourceReadyPayl } from "../sync/actions";
import { arrayWrap } from "./util";
import { maybeTagSteps as dontTouchThis } from "./sequence_tagging";

/** Responsible for all RESTful resources. */
export let resourceReducer =
  generateReducer<RestResources>(initialState, afterEach)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
      s.index.references[payload.uuid] = payload;
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVED);
      reindexResource(s.index, payload);
      dontTouchThis(payload);
      return s;
    })
    .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
      const { update } = payload;
      const target = findByUuid(s.index, payload.uuid);
      const before = defensiveClone(target.body);
      merge(target, { body: update });
      const didChange = !equals(before, target.body);
      didChange && mutateSpecialStatus(target.uuid, s.index, SpecialStatus.DIRTY);
      dontTouchThis(target);
      maybeRecalculateLocalSequenceVariables(target);
      return s;
    })
    .add<EditResourceParams>(Actions.OVERWRITE_RESOURCE, (s, { payload }) => {
      const original = findByUuid(s.index, payload.uuid);
      original.body = payload.update;
      mutateSpecialStatus(payload.uuid, s.index, payload.specialStatus);
      maybeRecalculateLocalSequenceVariables(original);
      dontTouchThis(original);
      return s;
    })
    .add<ResourceReadyPayl<TaggedResource>>(Actions.RESOURCE_READY, (s, { payload }) => {
      !s.loaded.includes(payload.name) && s.loaded.push(payload.name);
      addAllToIndex(s.index, payload.name, arrayWrap(payload.data));
      return s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, (s, { payload }) => {
      const { uuid, body, kind } = payload;
      addAllToIndex(s.index, kind, [body]);
      mutateSpecialStatus(uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
      removeFromIndex(s.index, payload);
      return s;
    })
    .add<GeneralizedError>(Actions._RESOURCE_NO, (s, { payload }) => {
      merge(findByUuid(s.index, payload.uuid), payload);
      mutateSpecialStatus(payload.uuid, s.index, payload.statusBeforeError);
      return s;
    })
    .add<TaggedResource>(Actions.INIT_RESOURCE, initResourceReducer)
    .add<string>(Actions.REFRESH_RESOURCE_START, (s, a) => {
      mutateSpecialStatus(a.payload, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<GeneralizedError>(Actions.REFRESH_RESOURCE_NO, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.SAVE_RESOURCE_START, (s, { payload }) => {
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVING);
      return s;
    })
    .add<TaggedResource[]>(Actions.BATCH_INIT, (s, { payload }) => {
      return payload.reduce((state, resource) => {
        return initResourceReducer(state, {
          type: Actions.INIT_RESOURCE,
          payload: resource
        });
      }, s);
    });
