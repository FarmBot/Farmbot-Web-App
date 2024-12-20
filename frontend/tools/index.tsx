import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelTop, DesignerPanelContent,
} from "../farm_designer/designer_panel";
import { Panel } from "../farm_designer/panel_header";
import {
  EmptyStateWrapper, EmptyStateGraphic,
} from "../ui/empty_state_wrapper";
import { t } from "../i18next_wrapper";
import { Content } from "../constants";
import { useNavigate } from "react-router";
import { Row, Help } from "../ui";
import {
  botPositionLabel,
} from "../farm_designer/map/layers/farmbot/bot_position_label";
import { Link } from "../link";
import { edit, save } from "../api/crud";
import {
  setToolHover, ToolSlotSVG, ToolSVG,
} from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { ToolSelection } from "./tool_slot_edit_components";
import { hasUTM } from "../settings/firmware/firmware_hardware_support";
import {
  ToolsProps, ToolsState, ToolSlotInventoryItemProps, ToolInventoryItemProps,
} from "./interfaces";
import { mapStateToProps } from "./state_to_props";
import { mapPointClickAction, selectPoint } from "../farm_designer/map/actions";
import { getMode } from "../farm_designer/map/util";
import { Mode } from "../farm_designer/map/interfaces";
import { SearchField } from "../ui/search_field";
import { ToolVerification } from "./tool_verification";
import { PanelSection } from "../plants/plant_inventory";
import { createGroup } from "../point_groups/actions";
import { DEFAULT_CRITERIA } from "../point_groups/criteria/interfaces";
import { GroupInventoryItem } from "../point_groups/group_inventory_item";
import { pointGroupSubset } from "../plants/select_plants";
import { Path } from "../internal_urls";
import { UTMProfile } from "../farm_designer/map/profile/tools";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { NavigationContext } from "../routes_helpers";

export class RawTools extends React.Component<ToolsProps, ToolsState> {
  state: ToolsState = { searchTerm: "", groups: false };

  getToolName = (toolId: number | undefined): string | undefined => {
    const foundTool = this.props.tools.filter(tool => tool.body.id === toolId)[0];
    return foundTool ? foundTool.body.name : undefined;
  };

  get mountedToolId() { return this.props.device.body.mounted_tool_id; }

  get mountedTool() { return this.props.findTool(this.mountedToolId || 0); }

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
        noUTM={this.noUTM}
        isActive={this.props.isActive}
        filterSelectedTool={true}
        filterActiveTools={false} />
      <svg className={"utm-and-mounted-tool-graphic"}
        viewBox={"-60 -50 120 140"}>
        <UTMProfile profileAxis={"y"} expanded={true} getX={() => 0}
          position={{ x: 0, y: 0 }} selectionWidth={1}
          mountedToolInfo={{
            name: this.mountedTool?.body.name,
            pulloutDirection: ToolPulloutDirection.POSITIVE_X,
            noUTM: this.noUTM,
            flipped: false,
          }} reversed={false}
          hidePositionIndicator={true}
          gantryHeight={0}
          botPosition={{ x: 0, y: 0, z: 0 }} />
      </svg>
      <ToolVerification sensors={this.props.sensors} bot={this.props.bot} />
    </div>;

  ToolSlots = () =>
    <div className="tool-slots">
      <div className="row grid-exp-1">
        <label>{this.strings.toolSlots}</label>
        <Link to={Path.toolSlots("add")}>
          <div className={"fb-button green"}>
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
            noUTM={this.noUTM}
            toolTransformProps={this.props.toolTransformProps} />)}
    </div>;

  Tools = () =>
    <div className="tools">
      <div className="row grid-exp-1">
        <label>{this.strings.tools}</label>
        <Link to={Path.tools("add")}>
          <div className={"fb-button green add-tool-btn"}>
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
    </div>;

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

  toggleOpen = (category: keyof ToolsState) => () =>
    this.setState({ ...this.state, [category]: !this.state[category] });

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate = this.context;
  navigateById = (id: number | undefined) => () => {
    this.navigate(Path.groups(id));
  };

  render() {
    const panelName = "tools";
    const hasTools = this.props.tools.length > 0;
    const toolSlotGroups = pointGroupSubset(this.props.groups, "ToolSlot");
    const filteredGroups = toolSlotGroups
      .filter(p => p.body.name.toLowerCase()
        .includes(this.state.searchTerm.toLowerCase()));
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelTop
        panel={Panel.Tools}
        linkTo={!hasTools ? Path.tools("add") : undefined}
        title={!hasTools ? this.strings.titleText : undefined}>
        <SearchField nameKey={"tools"}
          searchTerm={this.state.searchTerm}
          placeholder={this.strings.placeholder}
          onChange={searchTerm => this.setState({ searchTerm })} />
      </DesignerPanelTop>
      <DesignerPanelContent panelName={"tools"}>
        <EmptyStateWrapper
          notEmpty={hasTools}
          graphic={EmptyStateGraphic.tools}
          title={this.strings.titleText}
          text={this.strings.emptyStateText}
          colorScheme={"tools"}>
          {!this.noUTM && <this.MountedToolInfo />}
          <div className="grid double-gap">
            <this.ToolSlots />
            <this.Tools />
            {toolSlotGroups.length > 0 &&
              <PanelSection isOpen={this.state.groups} panel={Panel.Tools}
                toggleOpen={this.toggleOpen("groups")}
                itemCount={toolSlotGroups.length}
                addNew={() => this.props.dispatch(createGroup({
                  criteria: {
                    ...DEFAULT_CRITERIA,
                    string_eq: { pointer_type: ["ToolSlot"] },
                  },
                  navigate: this.navigate,
                }))}
                addTitle={t("add new group")}
                addClassName={"plus-group"}
                title={t("Groups")}>
                {filteredGroups
                  .map(group => <GroupInventoryItem
                    key={group.uuid}
                    group={group}
                    allPoints={this.props.allPoints}
                    hovered={false}
                    dispatch={this.props.dispatch}
                    onClick={this.navigateById(group.body.id)}
                  />)}
              </PanelSection>}
          </div>
        </EmptyStateWrapper>
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const ToolSlotInventoryItem = (props: ToolSlotInventoryItemProps) => {
  const { x, y, z, id, tool_id, gantry_mounted } = props.toolSlot.body;
  const toolName = props.tools
    .filter(tool => tool.body.id == tool_id)[0]?.body.name;
  const navigate = useNavigate();
  return <div
    className={`tool-slot-search-item ${props.hovered ? "hovered" : ""}`}
    onClick={() => {
      if (getMode() == Mode.boxSelect) {
        mapPointClickAction(navigate, props.dispatch, props.toolSlot.uuid)();
        props.dispatch(setToolHover(undefined));
      } else {
        props.dispatch(selectPoint([props.toolSlot.uuid]));
        navigate(Path.toolSlots(id));
      }
    }}
    onMouseEnter={() => props.dispatch(setToolHover(props.toolSlot.uuid))}
    onMouseLeave={() => props.dispatch(setToolHover(undefined))}>
    <Row className="grid-exp-2">
      <div className={"tool-slot-search-item-icon"}>
        <ToolSlotSVG
          toolSlot={props.toolSlot}
          toolName={tool_id ? toolName : "Empty"}
          toolTransformProps={props.toolTransformProps} />
      </div>
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
            noUTM={props.noUTM}
            isActive={props.isActive}
            filterSelectedTool={false}
            filterActiveTools={true} />
        </div>}
      <p className="tool-slot-position">
        <i>{botPositionLabel({ x, y, z }, { gantryMounted: gantry_mounted })}</i>
      </p>
    </Row>
  </div>;
};

const ToolInventoryItem = (props: ToolInventoryItemProps) => {
  const activeText = props.active ? t("in slot") : t("inactive");
  const navigate = useNavigate();
  return <div className={"tool-search-item"}
    onClick={() => { navigate(Path.tools(props.toolId)); }}>
    <Row className="grid-exp-2">
      <ToolSVG toolName={props.toolName} />
      <p className={"tool-search-item-name"}>{t(props.toolName)}</p>
      <p className="tool-status">
        <i>{props.mounted ? t("mounted") : activeText}</i>
      </p>
    </Row>
  </div>;
};

export const Tools = connect(mapStateToProps)(RawTools);
// eslint-disable-next-line import/no-default-export
export default Tools;
