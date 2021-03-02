import React from "react";
import { isPendingInstallation } from "./state_to_props";
import { FarmwareManifestInfo } from "./interfaces";
import { runFarmware } from "../devices/actions";
import { t } from "../i18next_wrapper";

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
      onClick={() => runFarmware(farmwareName, [], t("Farmware execution"))}>
      {t("Run")}
    </button>
    <p>
      {isPendingInstallation(farmware)
        ? t("Pending installation.")
        : t("No inputs provided.")}
    </p>
  </div>;
