import * as React from "react";
import moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { Popover, Position } from "@blueprintjs/core";
import { LogsState, LogsProps, Filters } from "./interfaces";
import { ToolTips } from "../constants";
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

/** Format log date and time for display in the app. */
export const formatLogTime =
  (created_at: number, timeSettings: TimeSettings) =>
    moment.unix(created_at)
      .utcOffset(timeSettings.utcOffset)
      .format(`MMM D, ${timeFormatString(timeSettings)}`);

export class RawLogs extends React.Component<LogsProps, Partial<LogsState>> {

  /** Initialize log type verbosity level to the configured or default value. */
  initialize = (name: NumberConfigKey, defaultValue: number): number => {
    const currentValue = this.props.getConfigValue(safeNumericSetting(name));
    if (isUndefined(currentValue)) {
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(name), defaultValue));
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
  toggle = (name: keyof Filters) => {
    // If log type is off, set it to verbosity level 1, otherwise turn it off
    const newSetting = this.state[name] === 0 ? 1 : 0;
    return () => {
      this.setState({ [name]: newSetting });
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(name + "_log"), newSetting));
    };
  };

  /** Set log type filter level. i.e., level 2 shows verbosity 2 and lower.*/
  setFilterLevel = (name: keyof Filters) => {
    return (value: number) => {
      this.setState({ [name]: value });
      this.props.dispatch(
        setWebAppConfigValue(safeNumericSetting(name + "_log"), value));
    };
  };

  /** Determine if log type filters are active. */
  get filterActive() {
    const filterKeys = filterStateKeys(this.state, this.props.shouldDisplay);
    const filterValues = filterKeys
      .map((key: keyof Filters) => this.state[key]);
    // Filters active if every log type level is not equal to 3 (max verbosity)
    return !filterValues.every(x => x == 3);
  }

  render() {
    const filterBtnColor = this.filterActive ? "green" : "gray";
    return <Page className="logs-page">
      <Row>
        <Col xs={6}>
          <h3>
            <i>{t("Logs")}</i>
          </h3>
          <ToolTip helpText={ToolTips.LOGS} />
        </Col>
        <Col xs={6}>
          <div className={"settings-menu-button"}>
            <Popover position={Position.TOP_RIGHT}>
              <i className="fa fa-gear" />
              <LogsSettingsMenu
                setFilterLevel={this.setFilterLevel}
                dispatch={this.props.dispatch}
                sourceFbosConfig={this.props.sourceFbosConfig}
                getConfigValue={this.props.getConfigValue} />
            </Popover>
          </div>
          <div className={"settings-menu-button"}>
            <Popover position={Position.TOP_RIGHT}>
              <button className={`fb-button ${filterBtnColor}`}>
                {this.filterActive ? t("Filters active") : t("filter")}
              </button>
              <LogsFilterMenu
                toggle={this.toggle} state={this.state}
                shouldDisplay={this.props.shouldDisplay}
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
          <div className="thin-search-wrapper">
            <div className="text-input-wrapper">
              <i className="fa fa-search" />
              <input
                onChange={e =>
                  this.setState({ searchTerm: e.currentTarget.value })}
                placeholder={t("Search logs...")} />
            </div>
          </div>
        </Col>
      </Row>
      <Row>
        <LogsTable logs={this.props.logs}
          dispatch={this.props.dispatch}
          state={this.state}
          timeSettings={this.props.timeSettings} />
      </Row>
    </Page>;
  }
}

export const Logs = connect(mapStateToProps)(RawLogs);
