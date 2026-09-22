import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import {
  TaggedTool, SpecialStatus, TaggedToolSlotPointer, Xyz,
} from "farmbot";
import {
  maybeFindToolById, getDeviceAccountSettings, selectAllToolSlotPointers,
  selectAllTools,
} from "../resources/selectors";
import { DropDownItem, FBSelect, Help, SaveBtn } from "../ui";
import { edit, destroy, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { error } from "../toast/toast";
import {
  EditToolProps, EditToolState,
} from "./interfaces";
import { betterCompact } from "../util";
import { CustomToolGraphicsInput } from "./custom_tool_graphics";
import {
  reduceFarmwareEnv, saveOrEditFarmwareEnv,
} from "../farmware/state_to_props";
import { Path } from "../internal_urls";
import { ToolTips } from "../constants";
import * as deviceActions from "../devices/actions";
import { NavigationContext } from "../routes_helpers";
import { Navigate, NavigateFunction } from "react-router";
import { XYZ } from "../devices/constants";
import { ToolType } from "farmbot/dist/resources/api_resources";

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
  return <div className={"flow-rate-input row grid-exp-3"}>
    <label>{t("Water Flow Rate (mL/s)")}</label>
    {!props.hideTooltip && <Help text={ToolTips.WATER_FLOW_RATE}
      enableMarkdown={true} />}
    <button className={"fb-button orange"}
      onClick={() => {
        void deviceActions.sendRPC({
          kind: "lua", args: { lua: LUA_WATER_FLOW_RATE }
        });
      }}>
      {t("run water for 5 seconds")}
    </button>
    <input
      value={props.value}
      type={"number"}
      onChange={e => props.onChange(parseInt(e.currentTarget.value))} />
  </div>;
};

export interface EffectorOffsetInputProps {
  value: Record<Xyz, number>;
  onChange(axis: Xyz, value: number): void;
}

export const EffectorOffsetInput = (props: EffectorOffsetInputProps) => {
  return <div className={"effector-offset-input row grid-4-col"}>
    <label>{t("Effector Offset")}</label>
    {XYZ.map(axis =>
      <div key={axis}>
        <label>
          {t("{{axis}} (mm)", { axis: axis.toUpperCase() })}
        </label>
        <input
          name={`effectorOffset${axis.toUpperCase()}`}
          value={props.value[axis]}
          type={"number"}
          step={"any"}
          onChange={e =>
            props.onChange(axis, parseFloat(e.currentTarget.value))} />
      </div>)}
  </div>;
};

export const TOOL_TYPE_CHOICES = (): DropDownItem[] => [
  { label: t("Rotary Tool"), value: "rotary_tool" },
  { label: t("Seed Bin"), value: "seed_bin" },
  { label: t("Seed Tray"), value: "seed_tray" },
  { label: t("Seed Trough"), value: "seed_trough" },
  { label: t("Seeder"), value: "seeder" },
  { label: t("Soil Sensor"), value: "soil_sensor" },
  { label: t("Watering Nozzle"), value: "watering_nozzle" },
  { label: t("Weeder"), value: "weeder" },
  { label: t("None"), value: "none" },
];

export interface ToolTypeInputProps {
  value: ToolType;
  onChange(value: ToolType): void;
}

export const ToolTypeInput = (props: ToolTypeInputProps) => {
  const choices = TOOL_TYPE_CHOICES();
  return <div className="tool-type-input row grid-exp-2">
    <label>{t("Type")}</label>
    <FBSelect
      list={choices}
      selectedItem={choices.find(choice => choice.value == props.value)}
      onChange={choice => props.onChange(choice.value as ToolType)} />
  </div>;
};

export interface UtmMountableInputProps {
  value: boolean;
  onChange(value: boolean): void;
}

export const UtmMountableInput = (props: UtmMountableInputProps) =>
  <div className="utm-mountable-input row grid-exp-1">
    <label>{t("UTM Mountable")}</label>
    <input
      name="utmMountable"
      type="checkbox"
      checked={props.value}
      onChange={() => props.onChange(!props.value)} />
  </div>;

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
  // eslint-disable-next-line complexity
  state: EditToolState = {
    toolName: this.tool?.body.name || "",
    toolType: this.tool?.body.type ?? "none",
    utmMountable: this.tool?.body.utm_mountable ?? true,
    flowRate: this.tool?.body.flow_rate_ml_per_s || 0,
    effectorOffset: {
      x: this.tool?.body.effector_offset_x ?? 0,
      y: this.tool?.body.effector_offset_y ?? 0,
      z: this.tool?.body.effector_offset_z ?? 0,
    },
  };

  get stringyID() { return Path.getSlug(Path.tools()); }

  get tool() { return this.props.findTool(this.stringyID); }

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate: NavigateFunction = url => { this.context?.(url as string); };

  fallback = () => {
    const toolsPath = Path.tools();
    return <this.PanelWrapper>
      {Path.startsWith(toolsPath) && <Navigate to={toolsPath} />}
      <span>{t("Redirecting")}...</span>
    </this.PanelWrapper>;
  };

  changeFlowRate = (flowRate: number) => this.setState({ flowRate });
  changeToolType = (toolType: ToolType) => this.setState({ toolType });
  changeEffectorOffset = (axis: Xyz, value: number) =>
    this.setState(state => ({
      effectorOffset: { ...state.effectorOffset, [axis]: value },
    }));

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
    return <this.PanelWrapper
      headerElement={<div className={"tool-action-btn-group"}>
        <SaveBtn
          onClick={() => {
            this.props.dispatch(edit(tool, {
              name: toolName,
              type: this.state.toolType,
              utm_mountable: this.state.utmMountable,
              flow_rate_ml_per_s: this.state.flowRate,
              effector_offset_x: this.state.effectorOffset.x,
              effector_offset_y: this.state.effectorOffset.y,
              effector_offset_z: this.state.effectorOffset.z,
            }));
            this.props.dispatch(save(tool.uuid));
            this.navigate(Path.tools());
          }}
          disabled={!toolName || nameTaken}
          status={SpecialStatus.DIRTY} />
        <i
          className={`fa fa-trash fb-icon-button invert ${activeOrMounted
            ? "pseudo-disabled"
            : ""}`}
          title={activeOrMounted ? message : t("delete")}
          onClick={() => activeOrMounted
            ? error(t(message))
            : dispatch(destroy(tool.uuid))} />
      </div>}>
      <div className="edit-tool grid">
        <ToolSVG toolName={toolName}
          toolType={this.state.toolType} profile={true} />
        <CustomToolGraphicsInput
          toolName={toolName}
          toolType={this.state.toolType}
          dispatch={this.props.dispatch}
          saveFarmwareEnv={this.props.saveFarmwareEnv}
          env={this.props.env} />
        <div className="row grid-exp-2">
          <label>{t("Name")}</label>
          <input name="toolName"
            value={toolName}
            onChange={e => this.setState({ toolName: e.currentTarget.value })} />
        </div>
        <ToolTypeInput value={this.state.toolType}
          onChange={this.changeToolType} />
        <UtmMountableInput value={this.state.utmMountable}
          onChange={utmMountable => this.setState({ utmMountable })} />
        <EffectorOffsetInput value={this.state.effectorOffset}
          onChange={this.changeEffectorOffset} />
        {this.state.toolType == "watering_nozzle" &&
          <WaterFlowRateInput value={this.state.flowRate}
            onChange={this.changeFlowRate} />}
        <p className="name-error">
          {nameTaken ? t("Name already taken.") : ""}
        </p>
      </div>
    </this.PanelWrapper>;
  };

  PanelWrapper = (props: {
    children: React.ReactNode,
    headerElement?: React.ReactElement,
  }) => {
    const panelName = "edit-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Edit tool")}
        backTo={Path.tools()}
        panel={Panel.Tools}>
        {props.headerElement}
      </DesignerPanelHeader>
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
export default EditTool;
