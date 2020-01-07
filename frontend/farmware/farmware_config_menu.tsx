import * as React from "react";
import { getDevice } from "../device";
import { FarmwareConfigMenuProps } from "./interfaces";
import { commandErr } from "../devices/actions";
import { toggleWebAppBool } from "../config_storage/actions";
import { destroyAll } from "../api/crud";
import { success, error } from "../toast/toast";
import { Feature } from "../devices/interfaces";
import { t } from "../i18next_wrapper";
import { BooleanSetting } from "../session_keys";

/** First-party Farmware settings. */
export function FarmwareConfigMenu(props: FarmwareConfigMenuProps) {
  const listBtnColor = props.show ? "green" : "red";
  return <div className="farmware-settings-menu-contents">
    <label>
      {t("First-party Farmware")}
    </label>
    <fieldset>
      <label>
        {t("Reinstall")}
      </label>
      <button
        className="fb-button gray fa fa-download"
        onClick={() => {
          const p = getDevice().installFirstPartyFarmware();
          p?.catch(commandErr("Farmware installation"));
        }}
        disabled={props.firstPartyFwsInstalled} />
    </fieldset>
    <fieldset>
      <label>
        {t("Show in list")}
      </label>
      <button
        className={"fb-button fb-toggle-button " + listBtnColor}
        onClick={() => props.dispatch(
          toggleWebAppBool(BooleanSetting.show_first_party_farmware))} />
    </fieldset>
    {props.shouldDisplay(Feature.api_farmware_env) &&
      <fieldset>
        <label>
          {t("Delete all Farmware data")}
        </label>
        <button
          className={"fb-button red fa fa-trash"}
          onClick={() => destroyAll("FarmwareEnv")
            .then(() => success(t("Farmware data successfully deleted.")))
            .catch(() => error(t("Error deleting Farmware data")))} />
      </fieldset>}
  </div>;
}
