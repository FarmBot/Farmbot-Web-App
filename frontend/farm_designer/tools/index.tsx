import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent,
} from "../designer_panel";
import { DesignerNavTabs, Panel, TAB_COLOR } from "../panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../../ui/empty_state_wrapper";
import { t } from "../../i18next_wrapper";
import { TaggedTool, TaggedToolSlotPointer, TaggedSensor } from "farmbot";
import { Content } from "../../constants";
import { history } from "../../history";
import { Row, Col, Help } from "../../ui";
import { botPositionLabel } from "../map/layers/farmbot/bot_position_label";
import { Link } from "../../link";
import { edit, save } from "../../api/crud";
import { readPin } from "../../devices/actions";
import { isBotOnlineFromState } from "../../devices/must_be_online";
import {
  setToolHover, ToolSlotSVG, ToolSVG,
} from "../map/layers/tool_slots/tool_graphics";
import { ToolSelection } from "./tool_slot_edit_components";
import { error } from "../../toast/toast";
import { hasUTM } from "../../devices/components/firmware_hardware_support";
import { ToolsProps, ToolsState } from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { BotOriginQuadrant } from "../interfaces";
import { mapPointClickAction } from "../map/actions";
import { getMode } from "../map/util";
import { Mode } from "../map/interfaces";

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

  get botOnline() { return isBotOnlineFromState(this.props.bot); }

  get noUTM() { return !hasUTM(this.props.firmwareHardware); }

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
        isActive={this.props.isActive}
        filterSelectedTool={true}
        filterActiveTools={false} />
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
        <label>{this.strings.toolSlots}</label>
        <Link to={"/app/designer/tool-slots/add"}>
          <div className={`fb-button panel-${TAB_COLOR[Panel.Tools]}`}>
            <i className="fa fa-plus" title={this.strings.addSlot} />
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
            isActive={this.props.isActive}
            tools={this.props.tools}
            xySwap={this.props.xySwap}
            quadrant={this.props.quadrant} />)}
    </div>

  Tools = () =>
    <div className="tools">
      <div className="tools-header">
        <label>{this.strings.tools}</label>
        <Link to={"/app/designer/tools/add"}>
          <div className={`fb-button panel-${TAB_COLOR[Panel.Tools]}`}>
            <i className="fa fa-plus" title={this.strings.titleText} />
          </div>
        </Link>
      </div>
      {this.props.tools
        .filter(tool => !tool.body.name ||
          tool.body.name && tool.body.name.toLowerCase()
            .includes(this.state.searchTerm.toLowerCase()))
        .filter(tool => tool.body.id)
        .map(tool =>
          <ToolInventoryItem key={tool.uuid}
            toolId={tool.body.id}
            active={this.props.isActive(tool.body.id)}
            mounted={this.mountedTool?.uuid == tool.uuid}
            toolName={tool.body.name || t("Unnamed")} />)}
    </div>

  get strings() {
    return {
      placeholder: this.noUTM
        ? t("Search your seed containers...")
        : t("Search your tools..."),
      titleText: this.noUTM
        ? t("Add a seed container")
        : t("Add a tool or seed container"),
      emptyStateText: this.noUTM
        ? Content.NO_SEED_CONTAINERS
        : Content.NO_TOOLS,
      tools: this.noUTM
        ? t("seed containers")
        : t("tools and seed containers"),
      toolSlots: t("slots"),
      addSlot: t("Add slot"),
    };
  }

  render() {
    const panelName = "tools";
    const hasTools = this.props.tools.length > 0;
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerNavTabs />
      <DesignerPanelTop
        panel={Panel.Tools}
        linkTo={!hasTools ? "/app/designer/tools/add" : undefined}
        title={!hasTools ? this.strings.titleText : undefined}>
        <input type="text" onChange={this.update} name="searchTerm"
          placeholder={this.strings.placeholder} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"tools"}>
        <EmptyStateWrapper
          notEmpty={hasTools}
          graphic={EmptyStateGraphic.tools}
          title={this.strings.titleText}
          text={this.strings.emptyStateText}
          colorScheme={"tools"}>
          {!this.noUTM && <this.MountedToolInfo />}
          <this.ToolSlots />
          <this.Tools />
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export interface ToolSlotInventoryItemProps {
  toolSlot: TaggedToolSlotPointer;
  tools: TaggedTool[];
  hovered: boolean;
  dispatch: Function;
  isActive(id: number | undefined): boolean;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  hideDropdown?: boolean;
}

export const ToolSlotInventoryItem = (props: ToolSlotInventoryItemProps) => {
  const { x, y, z, id, tool_id, gantry_mounted } = props.toolSlot.body;
  const toolName = props.tools
    .filter(tool => tool.body.id == tool_id)[0]?.body.name;
  return <div
    className={`tool-slot-search-item ${props.hovered ? "hovered" : ""}`}
    onClick={() => {
      if (getMode() == Mode.boxSelect) {
        mapPointClickAction(props.dispatch, props.toolSlot.uuid)();
        props.dispatch(setToolHover(undefined));
      } else {
        history.push(`/app/designer/tool-slots/${id}`);
      }
    }}
    onMouseEnter={() => props.dispatch(setToolHover(props.toolSlot.uuid))}
    onMouseLeave={() => props.dispatch(setToolHover(undefined))}>
    <Row>
      <Col xs={2}>
        <ToolSlotSVG
          toolSlot={props.toolSlot}
          toolName={tool_id ? toolName : "Empty"}
          xySwap={props.xySwap} quadrant={props.quadrant} />
      </Col>
      <Col xs={6}>
        {props.hideDropdown
          ? <span className={"tool-slot-search-item-name"}>
            {toolName || t("Empty")}
          </span>
          : <div className={"tool-selection-wrapper"}
            onClick={e => e.stopPropagation()}>
            <ToolSelection
              tools={props.tools}
              selectedTool={props.tools
                .filter(tool => tool.body.id == tool_id)[0]}
              onChange={update => {
                props.dispatch(edit(props.toolSlot, update));
                props.dispatch(save(props.toolSlot.uuid));
              }}
              isActive={props.isActive}
              filterSelectedTool={false}
              filterActiveTools={true} />
          </div>}
      </Col>
      <Col xs={4} className={"tool-slot-position-info"}>
        <p className="tool-slot-position">
          <i>{botPositionLabel({ x, y, z }, gantry_mounted)}</i>
        </p>
      </Col>
    </Row>
  </div>;
};

interface ToolInventoryItemProps {
  toolName: string;
  toolId: number | undefined;
  mounted: boolean;
  active: boolean;
}

const ToolInventoryItem = (props: ToolInventoryItemProps) => {
  const activeText = props.active ? t("in slot") : t("inactive");
  return <div className={"tool-search-item"}
    onClick={() => history.push(`/app/designer/tools/${props.toolId}`)}>
    <Row>
      <Col xs={2}>
        <ToolSVG toolName={props.toolName} />
      </Col>
      <Col xs={7}>
        <p>{t(props.toolName)}</p>
      </Col>
      <Col xs={3}>
        <p className="tool-status">
          <i>{props.mounted ? t("mounted") : activeText}</i>
        </p>
      </Col>
    </Row>
  </div>;
};

export const Tools = connect(mapStateToProps)(RawTools);
