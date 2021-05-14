import React from "react";
import { forceOnline } from "../../devices/must_be_online";
import { t } from "../../i18next_wrapper";
import { resendParameters } from "./export_menu";

export const SETTING_SYNC_TIMEOUT = 10000;

export interface SettingStatusState {
  inconsistent: boolean;
  syncing: boolean;
  timeout: NodeJS.Timeout | undefined;
}

export const initSettingStatusState = (): SettingStatusState => ({
  inconsistent: false,
  syncing: false,
  timeout: undefined,
});

export interface SettingStatusIndicatorProps {
  dispatch: Function | undefined;
  wasSyncing: boolean;
  isSyncing: boolean | undefined;
}

export const SettingStatusIndicator = (props: SettingStatusIndicatorProps) => {
  const { dispatch } = props;
  return <div className={"setting-status-indicator"}>
    {props.wasSyncing && dispatch &&
      <i className={`fa fa-${props.isSyncing ? "spinner fa-pulse" : "check"}`} />}
    {(!props.wasSyncing && props.isSyncing) && dispatch && !forceOnline() &&
      <i className={"fa fa-exclamation-triangle"}
        title={t("Save error. Click to retry.")}
        onClick={e => {
          e.stopPropagation();
          dispatch(resendParameters());
        }} />}
  </div>;
};
