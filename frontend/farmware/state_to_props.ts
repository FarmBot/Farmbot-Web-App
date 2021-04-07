import { maybeGetDevice } from "../resources/selectors";
import { UserEnv, BotState, Feature } from "../devices/interfaces";
import {
  selectAllFarmwareEnvs, selectAllFarmwareInstallations,
} from "../resources/selectors_by_kind";
import { determineInstalledOsVersion, createShouldDisplayFn } from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { FarmwareManifest, TaggedFarmwareEnv } from "farmbot";
import { save, edit, initSave } from "../api/crud";
import { FarmwareManifestInfo, Farmwares, SaveFarmwareEnv } from "./interfaces";
import { manifestInfo, manifestInfoPending } from "./generate_manifest_info";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../settings/dev/dev_support";
import { store } from "../redux/store";

/** Edit an existing Farmware env variable or add a new one. */
export const saveOrEditFarmwareEnv = (ri: ResourceIndex): SaveFarmwareEnv =>
  (key: string, value: string) => (dispatch: Function) => {
    const fwEnvLookup: Record<string, TaggedFarmwareEnv> = {};
    selectAllFarmwareEnvs(ri)
      .map(x => { fwEnvLookup[x.body.key] = x; });
    if (Object.keys(fwEnvLookup).includes(key)) {
      const fwEnv = fwEnvLookup[key];
      if (value != fwEnv.body.value) {
        dispatch(edit(fwEnv, { value }));
        dispatch(save(fwEnv.uuid));
      }
    } else {
      dispatch(initSave("FarmwareEnv", { key, value }));
    }
  };

export const isPendingInstallation = (farmware: FarmwareManifestInfo | undefined) =>
  !farmware || farmware.installation_pending;

export const reduceFarmwareEnv =
  (ri: ResourceIndex): UserEnv => {
    const farmwareEnv: UserEnv = {};
    selectAllFarmwareEnvs(ri)
      .map(x => { farmwareEnv[x.body.key] = "" + x.body.value; });
    return farmwareEnv;
  };

export const getEnv = (ri: ResourceIndex) => reduceFarmwareEnv(ri);

export const getShouldDisplayFn = (ri: ResourceIndex, bot: BotState) => {
  const lookupData = bot.minOsFeatureData;
  const installed = determineInstalledOsVersion(bot, maybeGetDevice(ri));
  const override = DevSettings.overriddenFbosVersion();
  const shouldDisplay = createShouldDisplayFn(installed, lookupData, override);
  return shouldDisplay;
};

export const shouldDisplayFeature = (feature: Feature) => {
  const { resources, bot } = store.getState();
  const shouldDisplay = getShouldDisplayFn(resources.index, bot);
  return shouldDisplay(feature);
};

export const generateFarmwareDictionary = (
  bot: BotState,
  ri: ResourceIndex,
  includePending = false,
): Farmwares => {
  const botStateFarmwares = bot.hardware.process_info.farmwares;

  const taggedFarmwareInstallations = selectAllFarmwareInstallations(ri);

  const namePendingInstall =
    (packageName: string | undefined, id: number | undefined): string => {
      const nameBase = packageName || `${t("Unknown Farmware")} ${id}`;
      const pendingInstall = ` (${t("pending install")}...)`;
      return includePending ? nameBase : nameBase + pendingInstall;
    };

  const farmwares: Farmwares = {};
  Object.values(botStateFarmwares).map((fm: FarmwareManifest) => {
    const info = manifestInfo(fm);
    farmwares[info.name] = info;
  });
  taggedFarmwareInstallations.map(x => {
    const n = namePendingInstall(x.body.package, x.body.id);
    const alreadyAdded = Object.keys(farmwares).includes(x.body.package || n);
    const alreadyInstalled = Object.values(farmwares)
      .map(fw => fw.url).includes(x.body.url);
    if (x.body.id && !alreadyAdded && !alreadyInstalled) {
      farmwares[n] = manifestInfoPending(n, x.body.url);
    }
  });
  return farmwares;
};
