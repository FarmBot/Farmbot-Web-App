import * as React from "react";
import { TaggedFarmwareInstallation } from "farmbot";
import { getDevice } from "../device";
import { commandErr } from "../devices/actions";
import { Content } from "../constants";
import { ShouldDisplay, Feature } from "../devices/interfaces";
import { destroy } from "../api/crud";
import { error } from "../toast/toast";
import { isPendingInstallation } from "./state_to_props";
import { Popover } from "@blueprintjs/core";
import { retryFetchPackageName } from "./actions";
import { history } from "../history";
import { setActiveFarmwareByName } from "./set_active_farmware_by_name";
import { FarmwareManifestInfo } from "./interfaces";
import { t } from "../i18next_wrapper";

export interface FarmwareInfoProps {
  dispatch: Function;
  farmware: FarmwareManifestInfo | undefined;
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

const FarmwareToolsVersionField =
  ({ version }: { version: string | undefined }) =>
    (version && version != "latest")
      ? <div>
        <label>{t("Farmware Tools version")}</label>
        <p>{version}</p>
      </div>
      : <div />;

const PendingInstallNameError =
  ({ url, installations }: {
    url: string | undefined,
    installations: TaggedFarmwareInstallation[],
  }): JSX.Element => {
    const installation: TaggedFarmwareInstallation | undefined =
      installations.filter(x => x.body.url === url)[0];
    const packageError = installation && installation.body.package_error;
    return (url && installation && packageError)
      ? <div className="error-with-button">
        <label>{t("Could not fetch package name")}</label>
        <p>{packageError}</p>
        <button
          className="fb-button red no-float"
          onClick={() => retryFetchPackageName(installation.body.id)}>
          {t("Retry")}
        </button>
      </div>
      : <div />;
  };

type RemoveFarmwareFunction =
  (farmwareName: string | undefined, url: string | undefined) => () => void;

const FarmwareManagementSection =
  ({ farmware, remove }: {
    farmware: FarmwareManifestInfo,
    remove: RemoveFarmwareFunction,
  }) =>
    <div>
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
    </div>;

/** Update a Farmware to the latest version. */
const update = (farmwareName: string | undefined) => () => {
  if (farmwareName) {
    getDevice()
      .updateFarmware(farmwareName)
      .then(() => { })
      .catch(commandErr("Update"));
  }
};

interface RemoveFarmwareProps {
  dispatch: Function;
  firstPartyFarmwareNames: string[];
  installations: TaggedFarmwareInstallation[];
  shouldDisplay: ShouldDisplay;
}

/** Uninstall a Farmware. */
const uninstallFarmware = (props: RemoveFarmwareProps) =>
  (farmwareName: string | undefined, url: string | undefined) => () => {
    if (farmwareName) {
      const { installations, dispatch, firstPartyFarmwareNames } = props;
      const isFirstParty = firstPartyFarmwareNames &&
        firstPartyFarmwareNames.includes(farmwareName);
      if (!isFirstParty || confirm(Content.FIRST_PARTY_WARNING)) {
        props.shouldDisplay(Feature.api_farmware_installations)
          ? removeFromAPI({ url, installations, dispatch })
          : getDevice()
            .removeFarmware(farmwareName)
            .catch(commandErr("Farmware Removal"));
        history.push("/app/farmware");
        setActiveFarmwareByName([]);
      }
    }
  };

export function FarmwareInfo(props: FarmwareInfoProps) {
  const { farmware } = props;
  return farmware ? <div className="farmware-info">
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
      farmware={farmware}
      remove={uninstallFarmware(props)} />
    <PendingInstallNameError
      url={farmware.url}
      installations={props.installations} />
  </div> : <div><p>{t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}</p></div>;
}
