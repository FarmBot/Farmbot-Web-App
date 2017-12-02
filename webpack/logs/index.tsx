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

export const formatLogTime = (created_at: number) =>
  moment.unix(created_at).local().format("MMM D, h:mma");

@connect(mapStateToProps)
export class Logs extends React.Component<LogsProps, Partial<LogsState>> {

  state: LogsState = {
    autoscroll: false,
    success: true,
    busy: true,
    warn: true,
    error: true,
    info: true,
    fun: true,
    debug: true,
  };

  toggle = (name: keyof LogsState) =>
    () => this.setState({ [name]: !this.state[name] });

  get filterActive() {
    const filterKeys = Object.keys(this.state)
      .filter(x => !(x === "autoscroll"));
    const filterValues = filterKeys
      .map((key: keyof LogsState) => this.state[key]);
    return !filterValues.every(x => x);
  }

  render() {
    const filterBtnColor = this.filterActive ? "green" : "gray";
    return <Page className="logs">
      <Row>
        <Col xs={11}>
          <h3>
            <i>{t("Logs")}</i>
          </h3>
          <ToolTip helpText={ToolTips.LOGS} />
        </Col>
        <Col xs={1}>
          <div className={"settings-menu-button"}>
            <Popover position={Position.BOTTOM_RIGHT}>
              <i className="fa fa-gear" />
              <LogsSettingsMenu {...this.props.bot} />
            </Popover>
          </div>
          <div className={"settings-menu-button"}>
            <Popover position={Position.BOTTOM_RIGHT}>
              <button className={`fb-button ${filterBtnColor}`}>
                {this.filterActive ? t("Filters active") : t("filter")}
              </button>
              <LogsFilterMenu toggle={this.toggle} state={this.state} />
            </Popover>
          </div>
        </Col>
      </Row>
      <Row>
        <LogsTable logs={this.props.logs} state={this.state} />
      </Row>
    </Page>;
  }
}
