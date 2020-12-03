import { maybeGetDevice } from "../resources/selectors";
import { Feature, UserEnv, ShouldDisplay, BotState } from "../devices/interfaces";
import {
  selectAllFarmwareEnvs, selectAllFarmwareInstallations,
} from "../resources/selectors_by_kind";
import { determineInstalledOsVersion, createShouldDisplayFn } from "../util";
import { ResourceIndex } from "../resources/interfaces";
import { TaggedFarmwareEnv } from "farmbot";
import { save, edit, initSave } from "../api/crud";
import { FarmwareManifestInfo, Farmwares, SaveFarmwareEnv } from "./interfaces";
import { manifestInfo, manifestInfoPending } from "./generate_manifest_info";
import { t } from "../i18next_wrapper";
import { DevSettings } from "../settings/dev/dev_support";

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

const reduceFarmwareEnv =
  (ri: ResourceIndex): UserEnv => {
    const farmwareEnv: UserEnv = {};
    selectAllFarmwareEnvs(ri)
      .map(x => { farmwareEnv[x.body.key] = "" + x.body.value; });
    return farmwareEnv;
  };

export const getEnv =
  (ri: ResourceIndex, shouldDisplay: ShouldDisplay, bot: BotState) =>
    shouldDisplay(Feature.api_farmware_env)
      ? reduceFarmwareEnv(ri)
      : bot.hardware.user_env;

export const getShouldDisplayFn = (ri: ResourceIndex, bot: BotState) => {
  const lookupData = bot.minOsFeatureData;
  const installed = determineInstalledOsVersion(bot, maybeGetDevice(ri));
  const override = DevSettings.overriddenFbosVersion();
  const shouldDisplay = createShouldDisplayFn(installed, lookupData, override);
  return shouldDisplay;
};

export const generateFarmwareDictionary = (
  bot: BotState,
  ri: ResourceIndex,
): Farmwares => {
  const botStateFarmwares = bot.hardware.process_info.farmwares;

  const taggedFarmwareInstallations = selectAllFarmwareInstallations(ri);

  const namePendingInstall =
    (packageName: string | undefined, id: number | undefined): string => {
      const nameBase = packageName || `${t("Unknown Farmware")} ${id}`;
      const pendingInstall = ` (${t("pending install")}...)`;
      return nameBase + pendingInstall;
    };

  const farmwares: Farmwares = {};
  Object.values(botStateFarmwares).map((fm: unknown) => {
    const info = manifestInfo(fm);
    farmwares[info.name] = manifestInfo(fm);
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
