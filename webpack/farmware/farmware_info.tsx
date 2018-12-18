import * as React from "react";
import { t } from "i18next";
import { FarmwareManifest, TaggedFarmwareInstallation } from "farmbot";
import { getDevice } from "../device";
import { commandErr } from "../devices/actions";
import { Content } from "../constants";
import { ShouldDisplay, Feature } from "../devices/interfaces";
import { destroy } from "../api/crud";
import { error } from "farmbot-toastr";
import { isPendingInstallation } from "./state_to_props";
import { Popover } from "@blueprintjs/core";

export interface FarmwareInfoProps {
  dispatch: Function;
  farmware: FarmwareManifest | undefined;
  showFirstParty: boolean;
  firstPartyFarmwareNames: string[];
  installations: TaggedFarmwareInstallation[];
  shouldDisplay: ShouldDisplay;
}

const findUUIDByUrl = (installations: TaggedFarmwareInstallation[],
  url: string): string | undefined => {
  const taggedInstallation = installations.filter(x => x.body.url === url)[0];
  return taggedInstallation ? taggedInstallation.uuid : undefined;
};

const removeFromAPI = (props: {
  url: string | undefined,
  installations: TaggedFarmwareInstallation[],
  dispatch: Function
}) => {
  const notFound = () => error(t("Farmware not found."));
  if (!props.url) { notFound(); return; }
  const uuid = findUUIDByUrl(props.installations, props.url);
  if (!uuid) { notFound(); return; }
  props.dispatch(destroy(uuid)).catch(() => notFound());
};

export function FarmwareInfo(props: FarmwareInfoProps) {
  const { installations, dispatch } = props;

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
  const remove =
    (farmwareName: string | undefined, url: string | undefined) => () => {
      if (farmwareName) {
        const isFirstParty = firstPartyFarmwareNames &&
          firstPartyFarmwareNames.includes(farmwareName);
        if (!isFirstParty || confirm(Content.FIRST_PARTY_WARNING)) {
          props.shouldDisplay(Feature.api_farmware_installations)
            ? removeFromAPI({ url, installations, dispatch })
            : getDevice()
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
      farmware.farmware_tools_version != "latest" &&
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
    <Popover usePortal={false}>
      <label>{t("Manage")}</label>
      <div className="farmware-url">{farmware.url}</div>
    </Popover>
    <div>
      <button
        className="fb-button yellow no-float"
        disabled={isPendingInstallation(farmware)}
        onClick={update(farmware.name)}>
        {t("Update")}
      </button>
      <button
        className="fb-button red no-float"
        onClick={remove(farmware.name, farmware.url)}>
        {t("Remove")}
      </button>
    </div>
  </div> : <div><p>{t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}</p></div>;
}
