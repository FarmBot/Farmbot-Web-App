import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { getPathArray, push } from "../history";
import { TaggedTool, SpecialStatus, TaggedToolSlotPointer } from "farmbot";
import {
  maybeFindToolById, getDeviceAccountSettings, selectAllToolSlotPointers,
  selectAllTools,
} from "../resources/selectors";
import { SaveBtn } from "../ui";
import { edit, destroy, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { error } from "../toast/toast";
import { EditToolProps, EditToolState } from "./interfaces";
import { betterCompact } from "../util";

export const isActive = (toolSlots: TaggedToolSlotPointer[]) =>
  (toolId: number | undefined) =>
    !!(toolId && toolSlots.map(x => x.body.tool_id).includes(toolId));

export const mapStateToProps = (props: Everything): EditToolProps => ({
  findTool: (id: string) =>
    maybeFindToolById(props.resources.index, parseInt(id)),
  dispatch: props.dispatch,
  mountedToolId: getDeviceAccountSettings(props.resources.index)
    .body.mounted_tool_id,
  isActive: isActive(selectAllToolSlotPointers(props.resources.index)),
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
});

export class RawEditTool extends React.Component<EditToolProps, EditToolState> {
  state: EditToolState = { toolName: this.tool ? this.tool.body.name || "" : "" };

  get stringyID() { return getPathArray()[4] || ""; }

  get tool() { return this.props.findTool(this.stringyID); }

  fallback = () => {
    const toolsPath = "/app/designer/tools";
    getPathArray().join("/").startsWith(toolsPath) && push(toolsPath);
    return <this.PanelWrapper>
      <span>{t("Redirecting")}...</span>
    </this.PanelWrapper>;
  }

  default = (tool: TaggedTool) => {
    const { dispatch } = this.props;
    const { toolName } = this.state;
    const isMounted = this.props.mountedToolId == tool.body.id;
    const message = isMounted
      ? t("Cannot delete while mounted.")
      : t("Cannot delete while in a slot.");
    const activeOrMounted = this.props.isActive(tool.body.id) || isMounted;
    const nameTaken = this.props.existingToolNames
      .filter(x => x != tool.body.name).includes(this.state.toolName);
    return <this.PanelWrapper>
      <div className="edit-tool">
        <ToolSVG toolName={this.state.toolName} />
        <label>{t("Name")}</label>
        <input name="name"
          value={toolName}
          onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        <SaveBtn
          onClick={() => {
            this.props.dispatch(edit(tool, { name: toolName }));
            this.props.dispatch(save(tool.uuid));
            push("/app/designer/tools");
          }}
          disabled={!this.state.toolName || nameTaken}
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
  }

  PanelWrapper = (props: { children: React.ReactChild | React.ReactChild[] }) => {
    const panelName = "edit-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit tool")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {props.children}
      </DesignerPanelContent>
    </DesignerPanel>;
  }

  render() {
    return this.tool ? this.default(this.tool) : this.fallback();
  }
}

export const EditTool = connect(mapStateToProps)(RawEditTool);
