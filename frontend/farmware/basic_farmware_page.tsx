import * as React from "react";
import { isPendingInstallation } from "./state_to_props";
import { FarmwareManifestInfo } from "./interfaces";
import { commandErr } from "../devices/actions";
import { getDevice } from "../device";
import { t } from "../i18next_wrapper";

/** Execute a Farmware. */
const run = (farmwareName: string) => () => {
  getDevice().execScript(farmwareName)
    .then(() => { }, commandErr("Farmware execution"));
};

export interface BasicFarmwarePageProps {
  farmwareName: string;
  farmware: FarmwareManifestInfo | undefined;
  botOnline: boolean;
}

export const BasicFarmwarePage = ({ farmwareName, farmware, botOnline }:
  BasicFarmwarePageProps) =>
  <div className={"basic-farmware-page"}>
    <button
      className="fb-button green farmware-button"
      disabled={isPendingInstallation(farmware) || !botOnline}
      title={t("Run Farmware")}
      onClick={run(farmwareName)}>
      {t("Run")}
    </button>
    <p>
      {isPendingInstallation(farmware)
        ? t("Pending installation.")
        : t("No inputs provided.")}
    </p>
  </div>;
