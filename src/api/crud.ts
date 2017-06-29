import {
  TaggedResource,
  ResourceName,
  isTaggedResource,
  TaggedSequence,
} from "../resources/tagged_resources";
import { GetState, ReduxAction } from "../redux/interfaces";
import { API } from "./index";
import * as Axios from "axios";
import { updateOK, updateNO, destroyOK, destroyNO } from "../resources/actions";
import { UnsafeError } from "../interfaces";
import { findByUuid } from "../resources/reducer";
import { generateUuid } from "../resources/util";
import { defensiveClone } from "../util";
import { EditResourceParams } from "./interfaces";
import { ResourceIndex } from "../resources/interfaces";
import { SequenceBodyItem } from "farmbot/dist";

export function edit(tr: TaggedResource, update: Partial<typeof tr.body>):
  ReduxAction<EditResourceParams> {
  return {
    type: "EDIT_RESOURCE",
    payload: { uuid: tr.uuid, update: update }
  };
}

/** Rather than update (patch) a TaggedResource, this method will overwrite
 * everything within the `.body` property. */
export function overwrite(tr: TaggedResource, update: typeof tr.body):
  ReduxAction<EditResourceParams> {
  return {
    type: "OVERWRITE_RESOURCE",
    payload: { uuid: tr.uuid, update: update }
  };
}

interface EditStepProps {
  step: Readonly<SequenceBodyItem>;
  sequence: Readonly<TaggedSequence>;
  index: number;
  /** Callback provides a fresh, defensively cloned copy of the
   * original step. Perform modifications to the resource within this
   * callback */
  executor(stepCopy: SequenceBodyItem): void;
}

/** Editing sequence steps is a tedious process. Use this function in place
 * of `edit()` or `overwrite`. */
export function editStep({ step, sequence, index, executor }: EditStepProps) {
  // https://en.wikipedia.org/wiki/NeXTSTEP
  let nextStep = defensiveClone(step);
  let nextSeq = defensiveClone(sequence);
  // Let the developer safely perform mutations here:
  executor(nextStep);
  nextSeq.body.body = nextSeq.body.body || [];
  nextSeq.body.body[index] = nextStep;
  return overwrite(sequence, nextSeq.body);
}

/** Initialize (but don't save) an indexed / tagged resource. */
export function init(resource: TaggedResource): ReduxAction<TaggedResource> {
  resource.body.id = 0;
  resource.dirty = true;
  /** Technically, this happens in the reducer, but I like to be extra safe. */
  resource.uuid = generateUuid(resource.body.id, resource.kind);
  return { type: "INIT_RESOURCE", payload: resource }
}

export function initSave(resource: TaggedResource) {
  return function (dispatch: Function, getState: GetState) {
    let action = init(resource);
    if (resource.body.id === 0) { delete resource.body.id; }
    dispatch(action);
    let nextState = getState().resources.index;
    let tr = findByUuid(nextState, action.payload.uuid);
    return dispatch(save(tr.uuid));
  }
}

export function save(uuid: string) {
  return function (dispatch: Function, getState: GetState) {
    let resource = findByUuid(getState().resources.index, uuid);
    dispatch({ type: "SAVE_RESOURCE_START", payload: resource });
    return dispatch(update(uuid));
  }
}

function update(uuid: string) {
  return function (dispatch: Function, getState: GetState) {
    return updateViaAjax(getState().resources.index, uuid, dispatch);
  }
}

export function destroy(uuid: string) {
  return function (dispatch: Function, getState: GetState) {
    let resource = findByUuid(getState().resources.index, uuid);
    let maybeProceed = confirmationChecker(resource);
    return maybeProceed(() => {
      if (resource.body.id) {
        return Axios
          .delete<typeof resource.body>(urlFor(resource.kind) + resource.body.id)
          .then(function (resp) {
            dispatch(destroyOK(resource));
          })
          .catch(function (err: UnsafeError) {
            dispatch(destroyNO({ err, uuid }));
            return Promise.reject(err);
          });
      } else {
        dispatch(destroyOK(resource))
        return Promise.resolve("");
      }
    }) || Promise.reject("User pressed cancel");
  }
}

export function saveAll(input: TaggedResource[],
  callback: () => void = _.noop,
  errBack: (err: UnsafeError) => void = _.noop) {
  return function (dispatch: Function, getState: GetState) {
    /** Perf issues maybe? RC - Mar 2017 */
    let p = input.filter(x => x.dirty).map(tts => dispatch(save(tts.uuid)));
    Promise.all(p).then(callback, errBack);
  }
}

export function urlFor(tag: ResourceName) {
  const OPTIONS: Partial<Record<ResourceName, string>> = {
    sequences: API.current.sequencesPath,
    tools: API.current.toolsPath,
    farm_events: API.current.farmEventsPath,
    regimens: API.current.regimensPath,
    peripherals: API.current.peripheralsPath,
    points: API.current.pointsPath,
    users: API.current.usersPath,
    device: API.current.devicePath,
    images: API.current.imagesPath,
    logs: API.current.logsPath
  }
  let url = OPTIONS[tag];
  if (url) {
    return url;
  } else {
    throw new Error(`No resource/URL handler for ${tag} yet.
    Consider adding one to crud.ts`);
  }
}

/** Shared functionality in create() and update(). */
function updateViaAjax(index: ResourceIndex,
  uuid: string,
  dispatch: Function) {
  let resource = findByUuid(index, uuid);
  let { body, kind } = resource;
  let verb: "post" | "put";
  let url = urlFor(kind);
  if (body.id) {
    verb = "put";
    url += body.id;
  } else {
    verb = "post";
  }
  return Axios[verb]<typeof resource.body>(url, body)
    .then(function (resp) {
      let r1 = defensiveClone(resource);
      let r2 = { body: defensiveClone(resp.data) };
      let newTR = _.assign({}, r1, r2);
      if (isTaggedResource(newTR)) {
        dispatch(updateOK(newTR));
      } else {
        throw new Error("Just saved a malformed TR.");
      }
    })
    .catch(function (err: UnsafeError) {
      dispatch(updateNO({ err, uuid }));
      return Promise.reject(err);
    });
}


let MUST_CONFIRM_LIST: ResourceName[] = ["farm_events", "points"];
let confirmationChecker = (resource: TaggedResource) =>
  <T>(proceed: () => T): T | undefined => {
    if (MUST_CONFIRM_LIST.includes(resource.kind)) {
      if (confirm("Are you sure you want to delete this item?")) {
        return proceed();
      } else {
        return undefined;
      }
    }
    return proceed();
  }
