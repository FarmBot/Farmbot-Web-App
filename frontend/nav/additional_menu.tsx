import React from "react";
import { AccountMenuProps } from "./interfaces";
import { Link } from "../link";
import { shortRevision } from "../util";
import { t } from "../i18next_wrapper";
import { ExternalUrl } from "../external_urls";
import { FilePath, Icon, Path } from "../internal_urls";
import { logout } from "../logout";
import { setWebAppConfigValue } from "../config_storage/actions";
import { BooleanSetting } from "../session_keys";
import { ToggleButton } from "../ui";
import { setPanelOpen } from "../farm_designer/panel_header";

export const AdditionalMenu = (props: AccountMenuProps) => {
  return <div className="nav-additional-menu">
    <div className={"account-link"}>
      <Link to={Path.settings("account")}
        onClick={() => {
          props.dispatch(setPanelOpen(true));
          props.close();
        }}>
        <img width={12} height={12} src={FilePath.icon(Icon.settings_small)} />
        {t("Account Settings")}
      </Link>
    </div>
    <div className={"setup-link"}>
      <Link to={Path.setup()}
        onClick={() => {
          props.dispatch(setPanelOpen(true));
          props.close();
        }}>
        <i className="fa fa-magic" />
        {t("Setup")}
      </Link>
    </div>
    <div className={"help-link"}>
      <Link to={Path.help()}
        onClick={() => {
          props.dispatch(setPanelOpen(true));
          props.close();
        }}>
        <i className="fa fa-question-circle" />
        {t("Help")}
      </Link>
    </div>
    <div className={"logout-link"}>
      <a onClick={logout(props.isStaff)} title={t("logout")}>
        <img width={12} height={12} src={FilePath.icon(Icon.logout)} />
        {t("Logout")}
      </a>
    </div>
    {props.isStaff && <div className={"logout-link"}>
      <a onClick={logout()} title={t("logout")}>
        <img width={12} height={12} src={FilePath.icon(Icon.logout)} />
        {t("Logout and destroy token")}
      </a>
    </div>}
    <div className={"dark-mode-toggle"}>
      <i className="fa fa-moon-o" />
      <label>{t("Dark Mode")}</label>
      <ToggleButton
        toggleValue={props.darkMode}
        toggleAction={() => {
          props.dispatch(setWebAppConfigValue(
            BooleanSetting.dark_mode, !props.darkMode));
        }}
        customText={{ textFalse: t("off"), textTrue: t("on") }} />
    </div>
    <div className="app-version row grid-exp-2 no-gap">
      <img width={12} height={12} src={FilePath.icon(Icon.developer)} />
      <label>{t("APP VERSION")}</label>
      <a href={ExternalUrl.webAppRepo} target="_blank" rel={"noreferrer"}>
        {shortRevision().slice(0, 8)}
      </a>
    </div>
  </div>;
};
