import * as React from "react";
import { t } from "i18next";
import { FarmwareManifest } from "farmbot";
import { getDevice } from "../device";
import { commandErr } from "../devices/actions";
import { Content } from "../constants";

export interface FarmwareInfoProps {
  farmware: FarmwareManifest | undefined;
  showFirstParty: boolean;
  firstPartyFarmwareNames: string[];
}

export function FarmwareInfo(props: FarmwareInfoProps) {

  /** Update a Farmware to the latest version. */
  const update = (farmwareName: string | undefined) => () => {
    if (farmwareName) {
      getDevice()
        .updateFarmware(farmwareName)
        .then(() => { })
        .catch(commandErr("Update"));
    }
  };

  /** Uninstall a Farmware. */
  const remove = (farmwareName: string | undefined) => () => {
    if (farmwareName) {
      const isFirstParty = firstPartyFarmwareNames &&
        firstPartyFarmwareNames.includes(farmwareName);
      if (!isFirstParty || confirm(Content.FIRST_PARTY_WARNING)) {
        getDevice()
          .removeFarmware(farmwareName)
          .catch(commandErr("Farmware Removal"));
      }
    }
  };

  const { farmware, firstPartyFarmwareNames } = props;

  return farmware ? <div>
    <label>{t("Description")}</label>
    <p>{farmware.meta.description}</p>
    <label>{t("Version")}</label>
    <p>{farmware.meta.version}</p>
    <label>{t("Min OS version required")}</label>
    <p>{farmware.meta.min_os_version_major + ".0.0"}</p>
    {farmware.farmware_tools_version &&
      <div>
        <label>{t("Farmware Tools version")}</label>
        <p>{farmware.farmware_tools_version}</p>
      </div>}
    <label>{t("Language")}</label>
    <p>{farmware.meta.language}</p>
    <label>{t("Author")}</label>
    <p>{farmware.meta.author === "Farmbot.io"
      ? "FarmBot, Inc."
      : farmware.meta.author}</p>
    <label>{t("Manage")}</label>
    <div>
      <button
        className="fb-button yellow no-float"
        onClick={update(farmware.name)}>
        {t("Update")}
      </button>
      <button
        className="fb-button red no-float"
        onClick={remove(farmware.name)}>
        {t("Remove")}
      </button>
    </div>
  </div> : <div><p>{t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}</p></div>;
}
