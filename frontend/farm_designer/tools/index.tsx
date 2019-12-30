import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { DesignerNavTabs, Panel, TAB_COLOR } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic
} from "../../ui/empty_state_wrapper";
import { t } from "../../i18next_wrapper";
import {
  TaggedTool, TaggedToolSlotPointer, TaggedDevice, TaggedSensor,
} from "farmbot";
import {
  selectAllTools, selectAllToolSlotPointers, getDeviceAccountSettings,
  maybeFindToolById,
  selectAllSensors
} from "../../resources/selectors";
import { Content } from "../../constants";
import { history } from "../../history";
import { Row, Col, Help } from "../../ui";
import { botPositionLabel } from "../map/layers/farmbot/bot_position_label";
import { Link } from "../../link";
import { edit, save } from "../../api/crud";
import { readPin } from "../../devices/actions";
import { isBotOnline } from "../../devices/must_be_online";
import { BotState } from "../../devices/interfaces";
import { NetworkState } from "../../connectivity/interfaces";
import { getStatus } from "../../connectivity/reducer_support";
import { setToolHover } from "../map/layers/tool_slots/tool_graphics";
import { ToolSelection } from "./tool_slot_edit_components";
import { error } from "../../toast/toast";

export interface ToolsProps {
  tools: TaggedTool[];
  toolSlots: TaggedToolSlotPointer[];
  dispatch: Function;
  findTool(id: number): TaggedTool | undefined;
  device: TaggedDevice;
  sensors: TaggedSensor[];
  bot: BotState;
  botToMqttStatus: NetworkState;
  hoveredToolSlot: string | undefined;
}

export interface ToolsState {
  searchTerm: string;
}

export const mapStateToProps = (props: Everything): ToolsProps => ({
  tools: selectAllTools(props.resources.index),
  toolSlots: selectAllToolSlotPointers(props.resources.index),
  dispatch: props.dispatch,
  findTool: (id: number) => maybeFindToolById(props.resources.index, id),
  device: getDeviceAccountSettings(props.resources.index),
  sensors: selectAllSensors(props.resources.index),
  bot: props.bot,
  botToMqttStatus: getStatus(props.bot.connectivity.uptime["bot.mqtt"]),
  hoveredToolSlot: props.resources.consumers.farm_designer.hoveredToolSlot,
});

const toolStatus = (value: number | undefined): string => {
  switch (value) {
    case 1: return t("disconnected");
    case 0: return t("connected");
    default: return t("unknown");
  }
};

export class RawTools extends React.Component<ToolsProps, ToolsState> {
  state: ToolsState = { searchTerm: "" };

  update = ({ currentTarget }: React.SyntheticEvent<HTMLInputElement>) => {
    this.setState({ searchTerm: currentTarget.value });
  }

  getToolName = (toolId: number | undefined): string | undefined => {
    const foundTool = this.props.tools.filter(tool => tool.body.id === toolId)[0];
    return foundTool ? foundTool.body.name : undefined;
  };

  get mountedToolId() { return this.props.device.body.mounted_tool_id; }

  get mountedTool() { return this.props.findTool(this.mountedToolId || 0); }

  get toolVerificationPin() {
    const toolVerificationSensor =
      this.props.sensors.filter(sensor => sensor.body.label.toLowerCase()
        .includes("tool verification"))[0] as TaggedSensor | undefined;
    return toolVerificationSensor ? toolVerificationSensor.body.pin || 63 : 63;
  }

  get pins() { return this.props.bot.hardware.pins; }

  get toolVerificationValue() {
    const pinData = this.pins[this.toolVerificationPin];
    return pinData ? pinData.value : undefined;
  }

  get arduinoBusy() {
    return !!this.props.bot.hardware.informational_settings.busy;
  }

  get botOnline() {
    return isBotOnline(
      this.props.bot.hardware.informational_settings.sync_status,
      this.props.botToMqttStatus);
  }

  MountedToolInfo = () =>
    <div className="mounted-tool">
      <div className="mounted-tool-header">
        <label>{t("mounted tool")}</label>
        <Help text={Content.MOUNTED_TOOL} />
      </div>
      <ToolSelection
        tools={this.props.tools}
        selectedTool={this.mountedTool}
        onChange={({ tool_id }) => {
          this.props.dispatch(edit(this.props.device,
            { mounted_tool_id: tool_id }));
          this.props.dispatch(save(this.props.device.uuid));
        }}
        filterSelectedTool={true} />
      <div className="tool-verification-status">
        <p>{t("status")}: {toolStatus(this.toolVerificationValue)}</p>
        <button
          className={`fb-button yellow ${this.botOnline ? "" : "pseudo-disabled"}`}
          disabled={this.arduinoBusy}
          title={this.botOnline ? "" : t(Content.NOT_AVAILABLE_WHEN_OFFLINE)}
          onClick={() => this.botOnline
            ? readPin(this.toolVerificationPin,
              `pin${this.toolVerificationPin}`, 0)
            : error(t(Content.NOT_AVAILABLE_WHEN_OFFLINE))}>
          {t("verify")}
        </button>
      </div>
    </div>

  ToolSlots = () =>
    <div className="tool-slots">
      <div className="tool-slots-header">
        <label>{t("tool slots")}</label>
        <Link to={"/app/designer/tool-slots/add"}>
          <div className={`fb-button panel-${TAB_COLOR[Panel.Tools]}`}>
            <i className="fa fa-plus" title={t("Add tool slot")} />
          </div>
        </Link>
      </div>
      {this.props.toolSlots
        .filter(p => (this.getToolName(p.body.tool_id) || "").toLowerCase()
          .includes(this.state.searchTerm.toLowerCase()))
        .map(toolSlot =>
          <ToolSlotInventoryItem key={toolSlot.uuid}
            hovered={toolSlot.uuid === this.props.hoveredToolSlot}
            dispatch={this.props.dispatch}
            toolSlot={toolSlot}
            getToolName={this.getToolName} />)}
    </div>

  InactiveTools = () =>
    <div className="inactive-tools">
      <label>{t("inactive tools")}</label>
      {this.props.tools
        .filter(tool => !tool.body.name ||
          tool.body.name && tool.body.name.toLowerCase()
            .includes(this.state.searchTerm.toLowerCase()))
        .filter(tool => tool.body.status === "inactive")
        .map(tool =>
          <ToolInventoryItem key={tool.uuid}
            toolId={tool.body.id}
            toolName={tool.body.name || t("Unnamed tool")} />)}
    </div>

  render() {
    const panelName = "tools";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Tools}
        linkTo={"/app/designer/tools/add"}
        title={t("Add tool")}>
        <input type="text" onChange={this.update}
          placeholder={t("Search your tools...")} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"tools"}>
        <EmptyStateWrapper
          notEmpty={this.props.tools.length > 0}
          graphic={EmptyStateGraphic.tools}
          title={t("Add a tool")}
          text={Content.NO_TOOLS}
          colorScheme={"tools"}>
          <this.MountedToolInfo />
          <this.ToolSlots />
          <this.InactiveTools />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

interface ToolSlotInventoryItemProps {
  toolSlot: TaggedToolSlotPointer;
  getToolName(toolId: number | undefined): string | undefined;
  hovered: boolean;
  dispatch: Function;
}

const ToolSlotInventoryItem = (props: ToolSlotInventoryItemProps) => {
  const { x, y, z, id, tool_id } = props.toolSlot.body;
  return <div
    className={`tool-slot-search-item ${props.hovered ? "hovered" : ""}`}
    onClick={() => history.push(`/app/designer/tool-slots/${id}`)}
    onMouseEnter={() => props.dispatch(setToolHover(props.toolSlot.uuid))}
    onMouseLeave={() => props.dispatch(setToolHover(undefined))}>
    <Row>
      <Col xs={7}>
        <p>{props.getToolName(tool_id) || t("No tool")}</p>
      </Col>
      <Col xs={5}>
        <p style={{ float: "right" }}>{botPositionLabel({ x, y, z })}</p>
      </Col>
    </Row>
  </div>;
};

interface ToolInventoryItemProps {
  toolName: string;
  toolId: number | undefined;
}

const ToolInventoryItem = (props: ToolInventoryItemProps) =>
  <div className={"tool-search-item"}
    onClick={() => history.push(`/app/designer/tools/${props.toolId}`)}>
    <Row>
      <Col xs={12}>
        <p>{t(props.toolName)}</p>
      </Col>
    </Row>
  </div>;

export const Tools = connect(mapStateToProps)(RawTools);
