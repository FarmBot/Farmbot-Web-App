import {
  TaggedResource,
  SpecialStatus,
  ResourceName,
  TaggedSequence,
} from "farmbot";
import {
  isTaggedResource,
} from "../resources/tagged_resources";
import { GetState, ReduxAction } from "../redux/interfaces";
import { API } from "./index";
import axios from "axios";
import {
  updateNO,
  destroyOK,
  destroyNO,
  GeneralizedError,
  saveOK,
} from "../resources/actions";
import { UnsafeError } from "../interfaces";
import { defensiveClone, unpackUUID } from "../util";
import { EditResourceParams } from "./interfaces";
import { ResourceIndex } from "../resources/interfaces";
import { SequenceBodyItem } from "farmbot/dist";
import { Actions } from "../constants";
import { maybeStartTracking } from "./maybe_start_tracking";
import { newTaggedResource } from "../sync/actions";
import { arrayUnwrap } from "../resources/util";
import { findByUuid } from "../resources/reducer_support";
import { assign, noop } from "lodash";
import { t } from "../i18next_wrapper";
import { appIsReadonly } from "../read_only_mode/app_is_read_only";

export function edit(tr: TaggedResource, changes: Partial<typeof tr.body>):
  ReduxAction<EditResourceParams> {
  return {
    type: Actions.EDIT_RESOURCE,
    payload: {
      uuid: tr.uuid,
      update: changes,
      specialStatus: SpecialStatus.DIRTY
    }
  };
}

/** Rather than update (patch) a TaggedResource, this method will overwrite
 * everything within the `.body` property. */
export function overwrite<T extends TaggedResource>(tr: T,
  changeset: T["body"],
  specialStatus = SpecialStatus.DIRTY):
  ReduxAction<EditResourceParams> {
  return {
    type: Actions.OVERWRITE_RESOURCE,
    payload: { uuid: tr.uuid, update: changeset, specialStatus }
  };
}

export interface EditStepProps {
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
  const nextStep = defensiveClone(step);
  const nextSeq = defensiveClone(sequence);
  // Let the developer safely perform mutations here:
  executor(nextStep);
  nextSeq.body.body = nextSeq.body.body || [];
  nextSeq.body.body[index] = nextStep;
  return overwrite(sequence, nextSeq.body);
}

/** Initialize (but don't save) an indexed / tagged resource. */
export function init<T extends TaggedResource>(kind: T["kind"],
  body: T["body"],
  /** Set to "true" when you want an `undefined` SpecialStatus. */
  clean = false): ReduxAction<TaggedResource> {
  const resource = arrayUnwrap(newTaggedResource(kind, body));
  resource.specialStatus = SpecialStatus[clean ? "SAVED" : "DIRTY"];
  return { type: Actions.INIT_RESOURCE, payload: resource };
}

/** Initialize and save a new resource, returning the `id`.
 * If you don't need the `id` returned, use `initSave` instead.
 */
export const initSaveGetId =
  <T extends TaggedResource>(kind: T["kind"], body: T["body"]) =>
    (dispatch: Function) => {
      const resource = arrayUnwrap(newTaggedResource(kind, body));
      resource.specialStatus = SpecialStatus.DIRTY;
      dispatch({ type: Actions.INIT_RESOURCE, payload: resource });
      dispatch({ type: Actions.SAVE_RESOURCE_START, payload: resource });
      maybeStartTracking(resource.uuid);
      return axios.post<typeof resource.body>(
        urlFor(resource.kind), resource.body)
        .then(resp => {
          dispatch(saveOK(resource));
          return resp.data.id;
        })
        .catch((err: UnsafeError) => {
          dispatch(updateNO({
            err,
            uuid: resource.uuid,
            statusBeforeError: resource.specialStatus
          }));
          return Promise.reject(err);
        });
    };

export function initSave<T extends TaggedResource>(kind: T["kind"],
  body: T["body"]) {
  return function (dispatch: Function) {
    const action = init(kind, body);
    dispatch(action);
    return dispatch(save(action.payload.uuid));
  };
}

export function save(uuid: string) {
  return function (dispatch: Function, getState: GetState) {
    const resource = findByUuid(getState().resources.index, uuid);
    const oldStatus = resource.specialStatus;
    dispatch({ type: Actions.SAVE_RESOURCE_START, payload: resource });
    return dispatch(update(uuid, oldStatus));
  };
}

export function refresh(resource: TaggedResource, urlNeedsId = false) {
  return function (dispatch: Function) {
    dispatch(refreshStart(resource.uuid));
    const endPart = "" + urlNeedsId ? resource.body.id : "";
    const statusBeforeError = resource.specialStatus;
    axios
      .get<typeof resource.body>(urlFor(resource.kind) + endPart)
      .then(resp => {
        const r1 = defensiveClone(resource);
        const r2 = { body: defensiveClone(resp.data) };
        const newTR = assign({}, r1, r2);
        if (isTaggedResource(newTR)) {
          dispatch(refreshOK(newTR));
        } else {
          const action = refreshNO({
            err: { message: "Unable to refresh" },
            uuid: resource.uuid,
            statusBeforeError
          });
          dispatch(action);
        }
      });
  };
}

export function refreshStart(uuid: string): ReduxAction<string> {
  return { type: Actions.REFRESH_RESOURCE_START, payload: uuid };
}

export function refreshOK(payload: TaggedResource): ReduxAction<TaggedResource> {
  return { type: Actions.REFRESH_RESOURCE_OK, payload };
}

export function refreshNO(payload: GeneralizedError): ReduxAction<GeneralizedError> {
  return { type: Actions.REFRESH_RESOURCE_NO, payload };
}

interface AjaxUpdatePayload {
  index: ResourceIndex;
  uuid: string;
  dispatch: Function;
  statusBeforeError: SpecialStatus;
}

function update(uuid: string, statusBeforeError: SpecialStatus) {
  return function (dispatch: Function, getState: GetState) {
    const { index } = getState().resources;
    const payl: AjaxUpdatePayload = { index, uuid, dispatch, statusBeforeError };
    return updateViaAjax(payl);
  };
}

interface DestroyNoProps {
  uuid: string;
  statusBeforeError: SpecialStatus;
  dispatch: Function;
}

export const destroyCatch = (p: DestroyNoProps) => (err: UnsafeError) => {
  p.dispatch(destroyNO({
    err,
    uuid: p.uuid,
    statusBeforeError: p.statusBeforeError
  }));
  return Promise.reject(err);
};

/** We need this to detect read-only deletion attempts */
function destroyStart() {
  return { type: Actions.DESTROY_RESOURCE_START, payload: {} };
}

export function destroy(uuid: string, force = false) {
  return function (dispatch: Function, getState: GetState) {
    dispatch(destroyStart());
    /** Stop user from deleting resources if app is read only. */
    if (appIsReadonly(getState().resources.index)) {
      return Promise.reject("Application is in read-only mode.");
    }

    const resource = findByUuid(getState().resources.index, uuid);
    const maybeProceed = confirmationChecker(resource.kind, force);
    return maybeProceed(() => {
      const statusBeforeError = resource.specialStatus;
      if (resource.body.id) {
        maybeStartTracking(uuid);
        return axios
          .delete(urlFor(resource.kind) + resource.body.id)
          .then(function () {
            dispatch(destroyOK(resource));
          })
          .catch(destroyCatch({ dispatch, uuid, statusBeforeError }));
      } else {
        dispatch(destroyOK(resource));
        return Promise.resolve("");
      }
    }) || Promise.reject("User pressed cancel");
  };
}

export function destroyAll(resourceName: ResourceName, force = false) {
  if (force || confirm(t("Are you sure you want to delete all items?"))) {
    return axios.delete(urlFor(resourceName) + "all");
  } else {
    return Promise.reject("User pressed cancel");
  }
}

export function saveAll(input: TaggedResource[],
  callback: () => void = noop,
  errBack: (err: UnsafeError) => void = noop) {
  return function (dispatch: Function) {
    const p = input
      .filter(x => x.specialStatus === SpecialStatus.DIRTY)
      .map(tts => tts.uuid)
      .map(uuid => {
        maybeStartTracking(uuid);
        return dispatch(save(uuid));
      });
    return Promise.all(p).then(callback, errBack);
  };
}

export function urlFor(tag: ResourceName) {
  const OPTIONS: Partial<Record<ResourceName, string>> = {
    Alert: API.current.alertPath,
    Device: API.current.devicePath,
    FarmEvent: API.current.farmEventsPath,
    FarmwareEnv: API.current.farmwareEnvPath,
    FarmwareInstallation: API.current.farmwareInstallationPath,
    FbosConfig: API.current.fbosConfigPath,
    FirmwareConfig: API.current.firmwareConfigPath,
    Image: API.current.imagesPath,
    Log: API.current.logsPath,
    Peripheral: API.current.peripheralsPath,
    PinBinding: API.current.pinBindingPath,
    PlantTemplate: API.current.plantTemplatePath,
    Point: API.current.pointsPath,
    PointGroup: API.current.pointGroupsPath,
    Regimen: API.current.regimensPath,
    SavedGarden: API.current.savedGardensPath,
    Sensor: API.current.sensorPath,
    Sequence: API.current.sequencesPath,
    Tool: API.current.toolsPath,
    User: API.current.usersPath,
    WebAppConfig: API.current.webAppConfigPath,
    WebcamFeed: API.current.webcamFeedPath,
    Folder: API.current.foldersPath,
  };
  const url = OPTIONS[tag];
  if (url) {
    return url;
  } else {
    throw new Error(`No resource/URL handler for ${tag} yet.
    Consider adding one to crud.ts`);
  }
}

const SINGULAR_RESOURCE: ResourceName[] =
  ["WebAppConfig", "FbosConfig", "FirmwareConfig"];

/** Shared functionality in create() and update(). */
export function updateViaAjax(payl: AjaxUpdatePayload) {
  const { uuid, statusBeforeError, dispatch, index } = payl;
  const resource = findByUuid(index, uuid);
  const { body, kind } = resource;
  let verb: "post" | "put";
  let url = urlFor(kind);
  if (body.id) {
    verb = "put";
    if (!SINGULAR_RESOURCE.includes(unpackUUID(payl.uuid).kind)) {
      url += body.id;
    }
  } else {
    verb = "post";
  }
  maybeStartTracking(uuid);
  return axios[verb]<typeof resource.body>(url, body)
    .then(function (resp) {
      const r1 = defensiveClone(resource);
      const r2 = { body: defensiveClone(resp.data) };
      const newTR = assign({}, r1, r2);
      if (isTaggedResource(newTR)) {
        dispatch(saveOK(newTR));
      } else {
        throw new Error("Just saved a malformed TR.");
      }
    })
    .catch(function (err: UnsafeError) {
      dispatch(updateNO({ err, uuid, statusBeforeError }));
      return Promise.reject(err);
    });
}

const MUST_CONFIRM_LIST: ResourceName[] = [
  "FarmEvent",
  "Point",
  "Sequence",
  "Regimen",
  "Image",
  "SavedGarden",
  "PointGroup",
];

const confirmationChecker = (resourceName: ResourceName, force = false) =>
  <T>(proceed: () => T): T | undefined => {
    if (MUST_CONFIRM_LIST.includes(resourceName)) {
      if (force || confirm(t("Are you sure you want to delete this item?"))) {
        return proceed();
      } else {
        return undefined;
      }
    }
    return proceed();
  };
