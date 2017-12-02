import * as React from "react";
import * as moment from "moment";
import { connect } from "react-redux";
import { Col, Row, Page, ToolTip, Help } from "../ui";
import { mapStateToProps } from "./state_to_props";
import { t } from "i18next";
import { Popover, Position } from "@blueprintjs/core";
import * as _ from "lodash";
import {
  LogsTableProps, LogsState, LogsFilterMenuProps, LogsProps
} from "./interfaces";
import { ToolTips } from "../constants";
import { TaggedLog } from "../resources/tagged_resources";
import { ToggleButton } from "../controls/toggle_button";
import { noop } from "lodash";
import { updateConfig } from "../devices/actions";
import { BotState } from "../devices/interfaces";

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
  return <div className={"logs-settings-menu"}>
    {Object.keys(props.state)
      .filter(x => { if (!(x == "autoscroll")) { return x; } })
      .map((logType: keyof LogsState) => {
        return <fieldset key={logType}>
          <label>
            <div className={`saucer ${logType}`} />
            {_.startCase(logType)}
          </label>
          <button
            className={"fb-button fb-toggle-button " + btnColor(logType)}
            onClick={props.toggle(logType)} />
        </fieldset>;
      })}
  </div>;
};

export const LogsSettingsMenu = (bot: BotState) => {
  const {
    sequence_init_log, sequence_body_log, sequence_complete_log
  } = bot.hardware.configuration;
  return <div className={"logs-settings-menu"}>
    {t("Create logs for sequence:")}
    <fieldset>
      <label>
        {t("Begin")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_BEGIN)} />
      <ToggleButton toggleValue={sequence_init_log}
        toggleAction={() => {
          updateConfig({ sequence_init_log: !sequence_init_log })(noop);
        }} />
    </fieldset>
    <fieldset>
      <label>
        {t("Steps")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_STEP)} />
      <ToggleButton toggleValue={sequence_body_log}
        toggleAction={() => {
          updateConfig({ sequence_body_log: !sequence_body_log })(noop);
        }} />
    </fieldset>
    <fieldset>
      <label>
        {t("Complete")}
      </label>
      <Help text={t(ToolTips.SEQUENCE_LOG_END)} />
      <ToggleButton toggleValue={sequence_complete_log}
        toggleAction={() => {
          updateConfig({
            sequence_complete_log: !sequence_complete_log
          })(noop);
        }} />
    </fieldset>
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
