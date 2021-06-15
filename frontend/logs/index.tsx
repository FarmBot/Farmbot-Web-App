import React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { Popover, Position } from "@blueprintjs/core";
import { LogsState, LogsProps, Filters } from "./interfaces";
import { LogsSettingsMenu } from "./components/settings_menu";
import { LogsFilterMenu, filterStateKeys } from "./components/filter_menu";
import { LogsTable } from "./components/logs_table";
import { safeNumericSetting } from "../session";
import { isUndefined } from "lodash";
import { NumericSetting } from "../session_keys";
import { setWebAppConfigValue } from "../config_storage/actions";
import { NumberConfigKey } from "farmbot/dist/resources/configs/web_app";
import { t } from "../i18next_wrapper";
import { TimeSettings } from "../interfaces";
import { timeFormatString } from "../util";
import { SearchField } from "../ui/search_field";
import { forceOnline } from "../devices/must_be_online";
import { demoAccountLog } from "../nav/ticker_list";

/** Format log date and time for display in the app. */
export const formatLogTime =
  (created_at: number, timeSettings: TimeSettings) =>
    moment.unix(created_at)
      .utcOffset(timeSettings.utcOffset)
      .format(`MMM D, ${timeFormatString(timeSettings)}`);

export class RawLogs extends React.Component<LogsProps, Partial<LogsState>> {

  /** Initialize log type verbosity level to the configured or default value. */
  initialize = (key: NumberConfigKey, defaultValue: number): number => {
    const currentValue = this.props.getConfigValue(safeNumericSetting(key));
    if (isUndefined(currentValue)) {
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(key), defaultValue));
      return defaultValue;
    } else {
      return currentValue as number;
    }
  };

  state: LogsState = {
    autoscroll: false,
    success: this.initialize(NumericSetting.success_log, 1),
    busy: this.initialize(NumericSetting.busy_log, 1),
    warn: this.initialize(NumericSetting.warn_log, 1),
    error: this.initialize(NumericSetting.error_log, 1),
    info: this.initialize(NumericSetting.info_log, 1),
    fun: this.initialize(NumericSetting.fun_log, 1),
    debug: this.initialize(NumericSetting.debug_log, 1),
    assertion: this.initialize(NumericSetting.assertion_log, 1),
    searchTerm: "",
    markdown: true,
  };

  /** Toggle display of a log type. Verbosity level 0 hides all, 3 shows all.*/
  toggle = (key: keyof Filters) => {
    // If log type is off, set it to verbosity level 1, otherwise turn it off
    const newSetting = this.state[key] === 0 ? 1 : 0;
    return () => {
      this.setState({ [key]: newSetting });
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(key + "_log"), newSetting));
    };
  };

  /** Set log type filter level. i.e., level 2 shows verbosity 2 and lower.*/
  setFilterLevel = (key: keyof Filters) => {
    return (value: number) => {
      this.setState({ [key]: value });
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(key + "_log"), value));
    };
  };

  /** Determine if log type filters are active. */
  get filterActive() {
    const filterKeys = filterStateKeys(this.state);
    const filterValues = filterKeys
      .map((key: keyof Filters) => this.state[key]);
    // Filters active if every log type level is not equal to 3 (max verbosity)
    return !filterValues.every(x => x == 3);
  }

  render() {
    const { dispatch, bot } = this.props;
    const filterBtnColor = this.filterActive ? "green" : "gray";
    return <Page className="logs-page">
      <Row>
        <Col xs={6}>
          <h3>
            <i>{t("Logs")}</i>
          </h3>
        </Col>
        <Col xs={6}>
          <div className={"settings-menu-button"}>
            <Popover position={Position.TOP_RIGHT}>
              <i className="fa fa-gear" />
              <LogsSettingsMenu
                setFilterLevel={this.setFilterLevel}
                dispatch={dispatch}
                sourceFbosConfig={this.props.sourceFbosConfig}
                bot={bot}
                getConfigValue={this.props.getConfigValue} />
            </Popover>
          </div>
          <div className={"settings-menu-button"}>
            <Popover position={Position.TOP_RIGHT}>
              <button className={`fb-button ${filterBtnColor}`}
                title={t("edit filter settings")}>
                {this.filterActive ? t("Filters active") : t("filter")}
              </button>
              <LogsFilterMenu
                toggle={this.toggle} state={this.state}
                setFilterLevel={this.setFilterLevel} />
            </Popover>
          </div>
          <div className="fa-stack fa-2x"
            title={this.state.markdown ? t("display raw") : t("display markdown")}
            onClick={() => this.setState({ markdown: !this.state.markdown })}>
            <i className="fa fa-font fa-stack-1x" />
            {this.state.markdown && <i className="fa fa-ban fa-stack-2x" />}
          </div>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={5} lg={4}>
          <SearchField
            placeholder={t("Search logs...")}
            searchTerm={this.state.searchTerm}
            onChange={searchTerm => this.setState({ searchTerm })} />
        </Col>
      </Row>
      <Row>
        <LogsTable
          logs={this.props.logs.
            concat(forceOnline() ? [demoAccountLog()] : [])}
          dispatch={dispatch}
          state={this.state}
          fbosVersion={bot.hardware.informational_settings.controller_version}
          timeSettings={this.props.timeSettings} />
      </Row>
    </Page>;
  }
}

export const Logs = connect(mapStateToProps)(RawLogs);
