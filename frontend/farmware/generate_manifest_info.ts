import { FarmwareManifestInfo } from "./interfaces";
import {
  LegacyFarmwareManifest as FarmwareManifestV1,
  FarmwareManifest as FarmwareManifestV2,
} from "farmbot";
import { t } from "../i18next_wrapper";


const addMinorAndPatchZeros = (version: string | undefined): string =>
  version ? ">=" + version + ".0.0" : "";

/** Generate FarmwareManifestInfo for any version of Farmware manifest. */
// tslint:disable-next-line:no-any
export const manifestInfo = (manifest: any): FarmwareManifestInfo => {
  if (manifest.farmware_manifest_version) {
    const fw: FarmwareManifestV2 = manifest;
    return {
      name: fw.package,
      installation_pending: false,
      url: fw.url,
      config: Object.values(fw.config),
      meta: {
        fbos_version: fw.farmbot_os_version_requirement,
        farmware_tools_version: fw.farmware_tools_version_requirement,
        description: fw.description,
        language: fw.language,
        version: fw.package_version,
        author: fw.author,
      }
    };
  } else {
    const fw: FarmwareManifestV1 = manifest;
    return {
      name: fw.name,
      installation_pending: false,
      url: fw.url,
      config: fw.config,
      meta: {
        fbos_version: addMinorAndPatchZeros(fw.meta.min_os_version_major),
        farmware_tools_version: fw.farmware_tools_version || ">=0.0.0",
        description: fw.meta.description,
        language: fw.meta.language,
        version: fw.meta.version,
        author: fw.meta.author,
      }
    };
  }
};

export const manifestInfoPending = (name: string, url: string) => ({
  name,
  installation_pending: true,
  url,
  config: [],
  meta: {
    fbos_version: "",
    farmware_tools_version: "",
    description: t("installation pending"),
    language: "",
    version: "",
    author: "",
  }
});
