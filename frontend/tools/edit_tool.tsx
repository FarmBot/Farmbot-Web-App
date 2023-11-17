import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { push } from "../history";
import { TaggedTool, SpecialStatus, TaggedToolSlotPointer } from "farmbot";
import {
  maybeFindToolById, getDeviceAccountSettings, selectAllToolSlotPointers,
  selectAllTools,
} from "../resources/selectors";
import { Help, SaveBtn } from "../ui";
import { edit, destroy, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { error } from "../toast/toast";
import { EditToolProps, EditToolState } from "./interfaces";
import { betterCompact } from "../util";
import { CustomToolGraphicsInput } from "./custom_tool_graphics";
import {
  reduceFarmwareEnv, saveOrEditFarmwareEnv,
} from "../farmware/state_to_props";
import { Path } from "../internal_urls";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";
import { ToolTips } from "../constants";
import { sendRPC } from "../devices/actions";

export const isActive = (toolSlots: TaggedToolSlotPointer[]) =>
  (toolId: number | undefined) =>
    !!(toolId && toolSlots.map(x => x.body.tool_id).includes(toolId));

export const LUA_WATER_FLOW_RATE =
  "toast(\"Running water for 5 seconds\")\n" +
  "write_pin(8, \"digital\", 1)\n" +
  "wait(5000)\n" +
  "write_pin(8, \"digital\", 0)";

export interface WaterFlowRateInputProps {
  value: number;
  onChange(value: number): void;
  hideTooltip?: boolean;
}

export const WaterFlowRateInput = (props: WaterFlowRateInputProps) => {
  return <div className={"flow-rate-input"}>
    <label>{t("Water Flow Rate (mL/s)")}</label>
    {!props.hideTooltip && <Help text={ToolTips.WATER_FLOW_RATE}
      enableMarkdown={true} />}
    <button className={"fb-button orange"}
      onClick={() => sendRPC({ kind: "lua", args: { lua: LUA_WATER_FLOW_RATE } })}>
      {t("run water for 5 seconds")}
    </button>
    <input
      value={props.value}
      type={"number"}
      onChange={e => props.onChange(parseInt(e.currentTarget.value))} />
  </div>;
};

export const mapStateToProps = (props: Everything): EditToolProps => ({
  findTool: (id: string) =>
    maybeFindToolById(props.resources.index, parseInt(id)),
  dispatch: props.dispatch,
  mountedToolId: getDeviceAccountSettings(props.resources.index)
    .body.mounted_tool_id,
  isActive: isActive(selectAllToolSlotPointers(props.resources.index)),
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
  env: reduceFarmwareEnv(props.resources.index),
});

export class RawEditTool extends React.Component<EditToolProps, EditToolState> {
  state: EditToolState = {
    toolName: this.tool?.body.name || "",
    flowRate: this.tool?.body.flow_rate_ml_per_s || 0,
  };

  get stringyID() { return Path.getSlug(Path.tools()); }

  get tool() { return this.props.findTool(this.stringyID); }

  fallback = () => {
    const toolsPath = Path.tools();
    Path.startsWith(toolsPath) && push(toolsPath);
    return <this.PanelWrapper>
      <span>{t("Redirecting")}...</span>
    </this.PanelWrapper>;
  };

  changeFlowRate = (flowRate: number) => this.setState({ flowRate });

  default = (tool: TaggedTool) => {
    const { dispatch } = this.props;
    const { toolName } = this.state;
    const isMounted = this.props.mountedToolId == tool.body.id;
    const message = isMounted
      ? t("Cannot delete while mounted.")
      : t("Cannot delete while in a slot.");
    const activeOrMounted = this.props.isActive(tool.body.id) || isMounted;
    const nameTaken = this.props.existingToolNames
      .filter(x => x != tool.body.name).includes(toolName);
    return <this.PanelWrapper>
      <div className="edit-tool">
        <ToolSVG toolName={toolName} profile={true} />
        <CustomToolGraphicsInput
          toolName={toolName}
          dispatch={this.props.dispatch}
          saveFarmwareEnv={this.props.saveFarmwareEnv}
          env={this.props.env} />
        <label>{t("Name")}</label>
        <input name="name"
          value={toolName}
          onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        {reduceToolName(toolName) == ToolName.wateringNozzle &&
          <WaterFlowRateInput value={this.state.flowRate}
            onChange={this.changeFlowRate} />}
        <SaveBtn
          onClick={() => {
            this.props.dispatch(edit(tool, {
              name: toolName,
              flow_rate_ml_per_s: this.state.flowRate,
            }));
            this.props.dispatch(save(tool.uuid));
            push(Path.tools());
          }}
          disabled={!toolName || nameTaken}
          status={SpecialStatus.DIRTY} />
        <p className="name-error">
          {nameTaken ? t("Name already taken.") : ""}
        </p>
      </div>
      <button
        className={`fb-button red no-float ${activeOrMounted
          ? "pseudo-disabled"
          : ""}`}
        title={activeOrMounted ? message : t("delete")}
        onClick={() => activeOrMounted
          ? error(t(message))
          : dispatch(destroy(tool.uuid))}>
        {t("Delete")}
      </button>
    </this.PanelWrapper>;
  };

  PanelWrapper = (props: { children: React.ReactChild | React.ReactChild[] }) => {
    const panelName = "edit-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit tool")}
        backTo={Path.tools()}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {props.children}
      </DesignerPanelContent>
    </DesignerPanel>;
  };

  render() {
    return this.tool ? this.default(this.tool) : this.fallback();
  }
}

export const EditTool = connect(mapStateToProps)(RawEditTool);
