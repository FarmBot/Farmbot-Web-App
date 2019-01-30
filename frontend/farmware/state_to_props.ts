import { Everything } from "../interfaces";
import {
  selectAllImages, maybeGetTimeOffset, maybeGetDevice
} from "../resources/selectors";
import {
  FarmwareProps, Feature, SaveFarmwareEnv, UserEnv
} from "../devices/interfaces";
import { prepopulateEnv } from "./weed_detector/remote_env/selectors";
import * as _ from "lodash";
import {
  selectAllFarmwareEnvs, selectAllFarmwareInstallations
} from "../resources/selectors_by_kind";
import {
  determineInstalledOsVersion,
  shouldDisplay as shouldDisplayFunc,
  betterCompact
} from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedFarmwareEnv, FarmwareManifest, JobProgress } from "farmbot";
import { save, edit, initSave } from "../api/crud";
import { t } from "i18next";
import { getWebAppConfig } from "../resources/getters";

/** Edit an existing Farmware env variable or add a new one. */
export const saveOrEditFarmwareEnv = (ri: ResourceIndex): SaveFarmwareEnv =>
  (key: string, value: string) => (dispatch: Function) => {
    const fwEnvLookup: Record<string, TaggedFarmwareEnv> = {};
    selectAllFarmwareEnvs(ri)
      .map(x => { fwEnvLookup[x.body.key] = x; });
    if (Object.keys(fwEnvLookup).includes(key)) {
      const fwEnv = fwEnvLookup[key];
      dispatch(edit(fwEnv, { value }));
      dispatch(save(fwEnv.uuid));
    } else {
      dispatch(initSave("FarmwareEnv", { key, value }));
    }
  };

export const isPendingInstallation = (farmware: FarmwareManifest | undefined) =>
  !farmware || farmware.uuid == "pending installation";

export const reduceFarmwareEnv =
  (ri: ResourceIndex): UserEnv => {
    const farmwareEnv: UserEnv = {};
    selectAllFarmwareEnvs(ri)
      .map(x => { farmwareEnv[x.body.key] = "" + x.body.value; });
    return farmwareEnv;
  };

export function mapStateToProps(props: Everything): FarmwareProps {
  const images = _.chain(selectAllImages(props.resources.index))
    .sortBy(x => x.body.id)
    .reverse()
    .value();
  const firstImage = images[0];
  const currentImage = images
    .filter(i => i.uuid === props.resources.consumers.farmware.currentImage)[0]
    || firstImage;
  const { farmwares } = _.cloneDeep(props.bot.hardware.process_info);
  const conf = getWebAppConfig(props.resources.index);
  const { currentFarmware, firstPartyFarmwareNames } =
    props.resources.consumers.farmware;

  const installedOsVersion = determineInstalledOsVersion(
    props.bot, maybeGetDevice(props.resources.index));
  const shouldDisplay =
    shouldDisplayFunc(installedOsVersion, props.bot.minOsFeatureData);
  const env = shouldDisplay(Feature.api_farmware_env)
    ? reduceFarmwareEnv(props.resources.index)
    : props.bot.hardware.user_env;

  const taggedFarmwareInstallations =
    selectAllFarmwareInstallations(props.resources.index);

  const namePendingInstall =
    (packageName: string | undefined, id: number | undefined): string => {
      const nameBase = packageName || `${t("Unknown Farmware")} ${id}`;
      const pendingInstall = ` (${t("pending install")}...)`;
      return nameBase + pendingInstall;
    };

  shouldDisplay(Feature.api_farmware_installations) &&
    taggedFarmwareInstallations.map(x => {
      const name = namePendingInstall(x.body.package, x.body.id);
      if (x.body.id && !Object.keys(farmwares).includes(name) &&
        !Object.values(farmwares).map(fw => fw.url).includes(x.body.url)) {
        farmwares[name] = {
          name,
          uuid: "pending installation",
          executable: "",
          args: [],
          url: x.body.url,
          path: "",
          config: [],
          meta: {
            min_os_version_major: "",
            description: t("installation pending"),
            language: "",
            version: "",
            author: "",
            zip: ""
          }
        };
      }
    });

  const jobs = props.bot.hardware.jobs || {};
  const imageJobNames = Object.keys(jobs).filter(x => x != "FBOS_OTA");
  const imageJobs: JobProgress[] =
    _.chain(betterCompact(imageJobNames.map(x => jobs[x])))
      .sortBy("time")
      .reverse()
      .value();

  return {
    timeOffset: maybeGetTimeOffset(props.resources.index),
    currentFarmware,
    farmwares,
    botToMqttStatus: "up",
    env: prepopulateEnv(env),
    user_env: env,
    dispatch: props.dispatch,
    currentImage,
    images,
    syncStatus: "synced",
    webAppConfig: conf ? conf.body : {},
    firstPartyFarmwareNames,
    shouldDisplay,
    saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
    taggedFarmwareInstallations,
    imageJobs,
  };
}
