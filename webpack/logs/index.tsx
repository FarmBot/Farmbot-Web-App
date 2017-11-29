import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { t } from "i18next";
import { Popover, Position } from "@blueprintjs/core";
import * as _ from "lodash";
import { LogsTableProps, LogsState, LogsFilterMenuProps, LogsProps } from "./interfaces";
import { ToolTips } from "../constants";
import { TaggedLog } from "../resources/tagged_resources";

export const formatLogTime = (created_at: number) =>
  moment.unix(created_at).local().format("MMM D, h:mma");

const LogsTable = (props: LogsTableProps) => {
  return <table className="pt-table pt-striped logs-table">
    <thead>
      <tr>
        <th><label>{t("Type")}</label></th>
        <th><label>{t("Message")}</label></th>
        <th><label>{t("Position (x, y, z)")}</label></th>
        <th><label>{t("Time")}</label></th>
      </tr>
    </thead>
    <tbody>
      {props.logs.map((log: TaggedLog) => {
        const isFiltered = log.body.message.toLowerCase().includes("filtered");
        if (!isFiltered) { return LogsRow(log, props.state); }
      })}
    </tbody>
  </table>;
};

const LogsRow = (tlog: TaggedLog, state: LogsState) => {
  const log = tlog.body;
  const time = formatLogTime(log.created_at);
  const type = (log.meta || {}).type;
  const filtered = state[type as keyof LogsState];
  const displayLog = _.isUndefined(filtered) || filtered;
  const { x, y, z } = log.meta;
  return displayLog ?
    <tr key={tlog.uuid}>
      <td>
        <div className={`saucer ${type}`} />
        {_.startCase(type)}
      </td>
      <td>
        {log.message || "Loading"}
      </td>
      <td>
        {
          (_.isNumber(x) && _.isNumber(y) && _.isNumber(z))
            ? `${x}, ${y}, ${z}`
            : "Unknown"
        }
      </td>
      <td>
        {time}
      </td>
    </tr> : undefined;
};

export const LogsFilterMenu = (props: LogsFilterMenuProps) => {
  const btnColor = (x: keyof LogsState) => props.state[x] ? "green" : "red";
  return <div>
    {Object.keys(props.state)
      .filter(x => { if (!(x == "autoscroll")) { return x; } })
      .map((logType: keyof LogsState) => {
        return <fieldset key={logType}>
          <label style={{ marginTop: "7px" }}>
            <div className={`saucer ${logType}`}
              style={{ float: "left", marginRight: "10px" }} />
            {_.startCase(logType)}
          </label>
          <button
            className={"fb-button fb-toggle-button " + btnColor(logType)}
            onClick={props.toggle(logType)} />
        </fieldset>;
      })}
  </div>;
};

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
          <Popover position={Position.BOTTOM_RIGHT}>
            <button className={`fb-button ${filterBtnColor}`}>
              {this.filterActive ? t("Filters active") : t("filter")}
            </button>
            <LogsFilterMenu toggle={this.toggle} state={this.state} />
          </Popover>
        </Col>
      </Row>
      <Row>
        <LogsTable logs={this.props.logs} state={this.state} />
      </Row>
    </Page>;
  }
}
