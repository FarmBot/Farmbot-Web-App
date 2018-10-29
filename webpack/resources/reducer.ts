import {
  findByUuid,
  initResourceReducer,
  mutateSpecialStatus,
  afterEach,
  emptyState,
} from "./reducer_support";
import {
  defensiveClone,
  equals
} from "../util";
import { generateReducer } from "../redux/generate_reducer";
import { RestResources, ResourceIndex } from "./interfaces";
import { TaggedResource, SpecialStatus } from "farmbot";
import { Actions } from "../constants";
import { GeneralizedError } from "./actions";
import { merge } from "lodash";
import { EditResourceParams } from "../api/interfaces";
import { SyncResponse } from "../sync/actions";
import { arrayWrap, generateUuid } from "./util";
import { isTaggedResource } from "./tagged_resources";
import { INDEXES } from "./resource_index_chain";

const ups = INDEXES.map(x => x.up);

export function indexUpsert(db: ResourceIndex, resources: TaggedResource | TaggedResource[]) {
  ups.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db));
  });
}

const downs = INDEXES.map(x => x.down).reverse();

export function indexRemove(db: ResourceIndex, resources: TaggedResource | TaggedResource[]) {
  downs.map(callback => {
    arrayWrap(resources).map(resource => callback(resource, db));
  });
}

/** Responsible for all RESTful resources. */
export let resourceReducer =
  generateReducer<RestResources>(emptyState(), afterEach)
    .add<TaggedResource>(Actions.SAVE_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, payload);
      mutateSpecialStatus(payload.uuid, s.index, SpecialStatus.SAVED);
      return s;
    })
    .add<EditResourceParams>(Actions.EDIT_RESOURCE, (s, { payload }) => {
      const { update } = payload;
      const target = findByUuid(s.index, payload.uuid);
      const before = defensiveClone(target.body);
      merge(target, { body: update });
      const didChange = !equals(before, target.body);
      didChange && mutateSpecialStatus(target.uuid, s.index, SpecialStatus.DIRTY);
      return s;
    })
    .add<EditResourceParams>(Actions.OVERWRITE_RESOURCE, (s, { payload }) => {
      const original = findByUuid(s.index, payload.uuid);
      original.body = payload.update;
      mutateSpecialStatus(payload.uuid, s.index, payload.specialStatus);
      return s;
    })
    .add<SyncResponse<TaggedResource>["payload"]>(Actions.RESOURCE_READY, (s, { payload }) => {
      !s.loaded.includes(payload.kind) && s.loaded.push(payload.kind);

      arrayWrap(payload.body).map(body => {
        try {
          const x = {
            kind: payload.kind,
            uuid: generateUuid(body.id, payload.kind),
            specialStatus: SpecialStatus.SAVED,
            body
          };
          if (isTaggedResource(x)) {
            indexUpsert(s.index, x);
          }
        } catch (error) {
          debugger;
        }
      });
      return s;
    })
    .add<TaggedResource>(Actions.REFRESH_RESOURCE_OK, (s, { payload }) => {
      indexUpsert(s.index, payload);
      mutateSpecialStatus(payload.uuid, s.index);
      return s;
    })
    .add<TaggedResource>(Actions.DESTROY_RESOURCE_OK, (s, { payload }) => {
      indexRemove(s.index, payload);
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
