import { UserEnv, BotState } from "../devices/interfaces";
import {
  selectAllFarmwareEnvs, selectAllFarmwareInstallations,
} from "../resources/selectors_by_kind";
import { ResourceIndex } from "../resources/interfaces";
import { FarmwareManifest, TaggedFarmwareEnv } from "farmbot";
import { save, edit, initSave } from "../api/crud";
import { FarmwareManifestInfo, Farmwares, SaveFarmwareEnv } from "./interfaces";
import { manifestInfo, manifestInfoPending } from "./generate_manifest_info";
import { t } from "../i18next_wrapper";
import { updateConfig } from "../devices/actions";

/** Edit an existing Farmware env variable or add a new one. */
export const saveOrEditFarmwareEnv =
  (ri: ResourceIndex, copyDistance = false): SaveFarmwareEnv =>
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
      if (copyDistance && key == "measure_soil_height_measured_distance") {
        dispatch(updateConfig({ soil_height: -parseInt(value) }));
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
