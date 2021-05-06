import { FarmwareManifestInfo } from "./interfaces";
import { FarmwareManifest as FarmwareManifestV2 } from "farmbot";
import { t } from "../i18next_wrapper";

/** Generate FarmwareManifestInfo from Farmware manifest. */
export const manifestInfo =
  (manifest: FarmwareManifestV2): FarmwareManifestInfo => ({
    name: manifest.package,
    installation_pending: false,
    url: manifest.url,
    config: Object.values(manifest.config),
    meta: {
      fbos_version: manifest.farmbot_os_version_requirement,
      farmware_tools_version: manifest.farmware_tools_version_requirement,
      description: manifest.description,
      language: manifest.language,
      version: manifest.package_version,
      author: manifest.author,
    }
  });

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
