import React from "react";
import { TaggedFarmwareInstallation } from "farmbot";
import { updateFarmware } from "../devices/actions";
import { Content } from "../constants";
import { destroy } from "../api/crud";
import { error } from "../toast/toast";
import { isPendingInstallation } from "./state_to_props";
import { retryFetchPackageName } from "./actions";
import { NavigateFunction, useNavigate } from "react-router";
import { FarmwareManifestInfo } from "./interfaces";
import { t } from "../i18next_wrapper";
import { Popover } from "../ui";
import { Path } from "../internal_urls";

export interface FarmwareInfoProps {
  dispatch: Function;
  farmware: FarmwareManifestInfo | undefined;
  showFirstParty: boolean;
  firstPartyFarmwareNames: string[];
  installations: TaggedFarmwareInstallation[];
  botOnline: boolean;
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

const FarmwareToolsVersionField =
  ({ version }: { version: string | undefined }) =>
    (version && version != "latest")
      ? <div className={"farmware-tools-version"}>
        <label>{t("Farmware Tools version")}</label>
        <p>{version}</p>
      </div>
      : <div className={"farmware-tools-version"} />;

const PendingInstallNameError =
  ({ url, installations }: {
    url: string | undefined,
    installations: TaggedFarmwareInstallation[],
  }): React.ReactNode => {
    const installation: TaggedFarmwareInstallation | undefined =
      installations.filter(x => x.body.url === url)[0];
    const packageError = installation?.body.package_error;
    return (url && installation && packageError)
      ? <div className="error-with-button">
        <label>{t("Could not fetch package name")}</label>
        <p>{packageError}</p>
        <button
          className="fb-button red no-float"
          title={t("retry fetch package name")}
          onClick={() => { retryFetchPackageName(installation.body.id); }}>
          {t("Retry")}
        </button>
      </div>
      : <div className={"no-install-error"} />;
  };

type RemoveFarmwareFunction = (
  farmwareName: string | undefined,
  url: string | undefined,
  navigate: NavigateFunction,
) => () => void;

interface FarmwareManagementSectionProps {
  farmware: FarmwareManifestInfo;
  remove: RemoveFarmwareFunction;
  botOnline: boolean;
  navigate: NavigateFunction;
}

const FarmwareManagementSection =
  ({ farmware, remove, botOnline, navigate }: FarmwareManagementSectionProps) =>
    <div className={"farmware-management-section"}>
      <Popover usePortal={false}
        target={<label>{t("Manage")}</label>}
        content={<div className="farmware-url">{farmware.url}</div>} />
      <div className={"farmware-management-buttons"}>
        <button
          className="fb-button yellow no-float"
          disabled={isPendingInstallation(farmware)}
          title={t("update Farmware")}
          onClick={requestFarmwareUpdate(farmware.name, botOnline)}>
          {t("Update")}
        </button>
        <button
          className="fb-button red no-float"
          title={t("remove Farmware")}
          onClick={remove(farmware.name, farmware.url, navigate)}>
          {t("Remove")}
        </button>
      </div>
    </div>;

/** Update a Farmware to the latest version. */
export const requestFarmwareUpdate =
  (farmwareName: string | undefined, botOnline: boolean) => () => {
    if (farmwareName && botOnline) {
      updateFarmware(farmwareName);
    }
  };

interface RemoveFarmwareProps {
  dispatch: Function;
  firstPartyFarmwareNames: string[];
  installations: TaggedFarmwareInstallation[];
}

/** Uninstall a Farmware. */
const uninstallFarmware = (props: RemoveFarmwareProps): RemoveFarmwareFunction =>
  (farmwareName, url, navigate) => () => {
    const { installations, dispatch, firstPartyFarmwareNames } = props;
    const isFirstParty = firstPartyFarmwareNames && farmwareName &&
      firstPartyFarmwareNames.includes(farmwareName);
    if (!isFirstParty || confirm(Content.FIRST_PARTY_WARNING)) {
      removeFromAPI({ url, installations, dispatch });
      navigate(Path.farmware());
    }
  };

export function FarmwareInfo(props: FarmwareInfoProps) {
  const navigate = useNavigate();
  const { farmware } = props;
  return farmware
    ? <div className="farmware-info">
      <label>{t("Description")}</label>
      <p>{farmware.meta.description}</p>
      <label>{t("Version")}</label>
      <p>{farmware.meta.version}</p>
      <label>{t("Min OS version required")}</label>
      <p>{farmware.meta.fbos_version}</p>
      <FarmwareToolsVersionField version={farmware.meta.farmware_tools_version} />
      <label>{t("Language")}</label>
      <p>{farmware.meta.language}</p>
      <label>{t("Author")}</label>
      <p>{farmware.meta.author === "Farmbot.io"
        ? "FarmBot, Inc."
        : farmware.meta.author}</p>
      <FarmwareManagementSection
        botOnline={props.botOnline}
        farmware={farmware}
        navigate={navigate}
        remove={uninstallFarmware(props)} />
      <PendingInstallNameError
        url={farmware.url}
        installations={props.installations} />
    </div>
    : <div className={"no-farmware-info"}>
      <p>{t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}</p>
    </div>;
}
