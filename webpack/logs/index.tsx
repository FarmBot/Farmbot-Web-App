import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip } from "../ui";
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

export const formatLogTime = (created_at: number) =>
  moment.unix(created_at).local().format("MMM D, h:mma");

@connect(mapStateToProps)
export class Logs extends React.Component<LogsProps, Partial<LogsState>> {
  componentDidCatch(x: Error, y: React.ErrorInfo) { catchErrors(x, y); }

  initialize = (name: NumericSetting, defaultValue: number): number => {
    const currentValue = Session.getNum(safeNumericSetting(name));
    if (isUndefined(currentValue)) {
      Session.setNum(safeNumericSetting(name), defaultValue);
      return defaultValue;
    } else {
      return currentValue;
    }
  }

  state: LogsState = {
    autoscroll: false,
    success: this.initialize(NumericSetting.successLog, 1),
    busy: this.initialize(NumericSetting.busyLog, 1),
    warn: this.initialize(NumericSetting.warnLog, 1),
    error: this.initialize(NumericSetting.errorLog, 1),
    info: this.initialize(NumericSetting.infoLog, 1),
    fun: this.initialize(NumericSetting.funLog, 1),
    debug: this.initialize(NumericSetting.debugLog, 1),
  };

  toggle = (name: keyof LogsState) => {
    switch (this.state[name]) {
      case 0:
        return () => {
          this.setState({ [name]: 1 });
          Session.setNum(safeNumericSetting(name + "Log"), 1);
        };
      default:
        return () => {
          this.setState({ [name]: 0 });
          Session.setNum(safeNumericSetting(name + "Log"), 0);
        };
    }
  }

  setFilterLevel = (name: keyof LogsState) => {
    return (value: number) => {
      this.setState({ [name]: value });
      Session.setNum(safeNumericSetting(name + "Log"), value);
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
                setFilterLevel={this.setFilterLevel} bot={this.props.bot} />
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
