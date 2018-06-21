import * as React from "react";
import { t } from "i18next";
import { getDevice } from "../device";
import { FarmwareConfigMenuProps } from "./interfaces";
import { commandErr } from "../devices/actions";
import { toggleWebAppBool } from "../config_storage/actions";

/** First-party Farmware settings. */
export function FarmwareConfigMenu(props: FarmwareConfigMenuProps) {
  const listBtnColor = props.show ? "green" : "red";
  return <div>
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
          p && p.catch(commandErr("Farmware installation"));
        }}
        disabled={props.firstPartyFwsInstalled} />
    </fieldset>
    <fieldset>
      <label>
        {t("Show in list")}
      </label>
      <button
        className={"fb-button fb-toggle-button " + listBtnColor}
        onClick={() =>
          props.dispatch(toggleWebAppBool("show_first_party_farmware"))} />
    </fieldset>
  </div>;
}
