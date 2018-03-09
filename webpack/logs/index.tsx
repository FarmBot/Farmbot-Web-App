import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip } from "../ui/index";
import { mapStateToProps } from "./state_to_props";
import { t } from "i18next";
import { Popover, Position } from "@blueprintjs/core";
import { LogsState, LogsProps } from "./interfaces";
import { ToolTips } from "../constants";
import { LogsSettingsMenu } from "./components/settings_menu";
import { LogsFilterMenu } from "./components/filter_menu";
import { LogsTable } from "./components/logs_table";
import { Session, safeNumericSetting } from "../session";
import { isUndefined } from "lodash";
import { NumericSetting } from "../session_keys";
import { catchErrors } from "../util";
import { NumberConfigKey } from "../config_storage/web_app_configs";

export const formatLogTime = (created_at: number, timeoffset: number) =>
  moment.unix(created_at).utcOffset(timeoffset).format("MMM D, h:mma");

@connect(mapStateToProps)
export class Logs extends React.Component<LogsProps, Partial<LogsState>> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  initialize = (name: NumberConfigKey, defaultValue: number): number => {
    const currentValue = Session.deprecatedGetNum(safeNumericSetting(name));
    if (isUndefined(currentValue)) {
      Session.deprecatedSetNum(safeNumericSetting(name), defaultValue);
      return defaultValue;
    } else {
      return currentValue;
    }
  }

  state: LogsState = {
    autoscroll: false,
    success: this.initialize(NumericSetting.success_log, 1),
    busy: this.initialize(NumericSetting.busy_log, 1),
    warn: this.initialize(NumericSetting.warn_log, 1),
    error: this.initialize(NumericSetting.error_log, 1),
    info: this.initialize(NumericSetting.info_log, 1),
    fun: this.initialize(NumericSetting.fun_log, 1),
    debug: this.initialize(NumericSetting.debug_log, 1),
  };

  toggle = (name: keyof LogsState) => {
    switch (this.state[name]) {
      case 0:
        return () => {
          this.setState({ [name]: 1 });
          Session.deprecatedSetNum(safeNumericSetting(name + "_log"), 1);
        };
      default:
        return () => {
          this.setState({ [name]: 0 });
          Session.deprecatedSetNum(safeNumericSetting(name + "_log"), 0);
        };
    }
  }

  setFilterLevel = (name: keyof LogsState) => {
    return (value: number) => {
      this.setState({ [name]: value });
      Session.deprecatedSetNum(safeNumericSetting(name + "_log"), value);
    };
  };

  get filterActive() {
    const filterKeys = Object.keys(this.state)
      .filter(x => !(x === "autoscroll"));
    const filterValues = filterKeys
      .map((key: keyof LogsState) => this.state[key]);
    return !filterValues.every(x => x == 3);
  }

  render() {
    const filterBtnColor = this.filterActive ? "green" : "gray";
    return <Page className="logs">
      <Row>
        <Col xs={10}>
          <h3>
            <i>{t("Logs")}</i>
          </h3>
          <ToolTip helpText={ToolTips.LOGS} />
        </Col>
        <Col xs={2}>
          <div className={"settings-menu-button"}>
            <Popover position={Position.BOTTOM_RIGHT}>
              <i className="fa fa-gear" />
              <LogsSettingsMenu
                setFilterLevel={this.setFilterLevel}
                dispatch={this.props.dispatch}
                sourceFbosConfig={this.props.sourceFbosConfig} />
            </Popover>
          </div>
          <div className={"settings-menu-button"}>
            <Popover position={Position.BOTTOM_RIGHT}>
              <button className={`fb-button ${filterBtnColor}`}>
                {this.filterActive ? t("Filters active") : t("filter")}
              </button>
              <LogsFilterMenu
                toggle={this.toggle} state={this.state}
                setFilterLevel={this.setFilterLevel} />
            </Popover>
          </div>
        </Col>
      </Row>
      <Row>
        <LogsTable logs={this.props.logs}
          state={this.state}
          timeOffset={this.props.timeOffset} />
      </Row>
    </Page>;
  }
}
