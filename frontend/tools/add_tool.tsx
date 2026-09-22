import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus, TaggedTool, Xyz } from "farmbot";
import { initSave, destroy, init, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { selectAllTools } from "../resources/selectors";
import { betterCompact } from "../util";
import {
  getFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import {
  AddToolProps, AddToolState,
} from "./interfaces";
import {
  reduceFarmwareEnv, saveOrEditFarmwareEnv,
} from "../farmware/state_to_props";
import { CustomToolGraphicsInput } from "./custom_tool_graphics";
import { Path } from "../internal_urls";
import {
  EffectorOffsetInput, ToolTypeInput, UtmMountableInput, WaterFlowRateInput,
} from "./edit_tool";
import { NavigationContext } from "../routes_helpers";
import { NavigateFunction } from "react-router";
import { ToolType } from "farmbot/dist/resources/api_resources";

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
  saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
  env: reduceFarmwareEnv(props.resources.index),
});

export type StockTool = {
  name: string;
  type: ToolType;
  utm_mountable: boolean;
} & Partial<Pick<TaggedTool["body"],
  "effector_offset_x" | "effector_offset_y" | "effector_offset_z">>;

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = {
    toolName: "",
    toolType: "none",
    utmMountable: true,
    toAdd: [],
    uuid: undefined,
    flowRate: 0,
    effectorOffset: { x: 0, y: 0, z: 0 },
  };

  filterExisting = (n: string) => !this.props.existingToolNames.includes(n);

  add = (n: string) => this.filterExisting(n) && !this.state.toAdd.includes(n) &&
    this.setState({ toAdd: this.state.toAdd.concat([n]) });

  remove = (n: string) =>
    this.setState({ toAdd: this.state.toAdd.filter(name => name != n) });

  componentDidMount = () => this.setState({
    toAdd: this.stockToolNames()
      .filter(tool => this.filterExisting(tool.name))
      .map(tool => tool.name),
  });

  newTool = (tool: StockTool) => this.props.dispatch(initSave(
    "Tool", tool));

  static contextType = NavigationContext;
  context!: React.ContextType<typeof NavigationContext>;
  navigate: NavigateFunction = url => { this.context?.(url as string); };

  back = () => {
    this.navigate(Path.tools());
  };

  save = () => {
    const initTool = init("Tool", {
      name: this.state.toolName,
      type: this.state.toolType,
      utm_mountable: this.state.utmMountable,
      flow_rate_ml_per_s: this.state.flowRate,
      effector_offset_x: this.state.effectorOffset.x,
      effector_offset_y: this.state.effectorOffset.y,
      effector_offset_z: this.state.effectorOffset.z,
    });
    this.props.dispatch(initTool);
    const { uuid } = initTool.payload;
    this.setState({ uuid });
    this.props.dispatch(save(uuid))
      .then(() => this.setState({ uuid: undefined }, this.back))
      .catch(() => { });
  };

  componentWillUnmount = () =>
    this.state.uuid && this.props.dispatch(destroy(this.state.uuid));

  stockToolNames = (): StockTool[] => {
    const TROUGHS: StockTool[] = [
      {
        name: t("Seed Trough 1"),
        type: "seed_trough",
        utm_mountable: false,
      },
      {
        name: t("Seed Trough 2"),
        type: "seed_trough",
        utm_mountable: false,
      },
    ];
    const BASE_TOOLS: StockTool[] = [
      {
        name: t("Watering Nozzle"),
        type: "watering_nozzle",
        utm_mountable: true,
      },
    ];
    const GENESIS_TOOLS: StockTool[] = [
      {
        name: t("Seeder"),
        type: "seeder",
        utm_mountable: true,
        effector_offset_x: 17.5,
        effector_offset_z: 80,
      },
      { name: t("Weeder"), type: "weeder", utm_mountable: true },
      {
        name: t("Soil Sensor"),
        type: "soil_sensor",
        utm_mountable: true,
        effector_offset_z: 60,
      },
      { name: t("Seed Bin"), type: "seed_bin", utm_mountable: false },
      { name: t("Seed Tray"), type: "seed_tray", utm_mountable: false },
    ];
    const ROTARY_TOOL: StockTool[] = [
      {
        name: t("Rotary Tool"),
        type: "rotary_tool",
        utm_mountable: true,
        effector_offset_z: 80,
      },
    ];
    switch (this.props.firmwareHardware) {
      case "arduino":
      case "farmduino":
      case "farmduino_k14":
      default:
        return [
          ...BASE_TOOLS,
          ...GENESIS_TOOLS,
        ];
      case "farmduino_k15":
        return [
          ...BASE_TOOLS,
          ...GENESIS_TOOLS,
          ...TROUGHS,
        ];
      case "farmduino_k16":
      case "farmduino_k17":
      case "farmduino_k18":
      case "farmduino_k19":
        return [
          ...BASE_TOOLS,
          ...ROTARY_TOOL,
          ...GENESIS_TOOLS,
          ...TROUGHS,
        ];
      case "express_k10":
      case "express_k11":
      case "express_k12":
        return [
          ...BASE_TOOLS,
          ...TROUGHS,
        ];
    }
  };

  StockToolCheckbox = ({ toolName }: { toolName: string }) => {
    const alreadyAdded = !this.filterExisting(toolName);
    const checked = this.state.toAdd.includes(toolName) || alreadyAdded;
    return <div className={`fb-checkbox ${alreadyAdded ? "disabled" : ""}`}>
      <input type="checkbox" key={JSON.stringify(this.state.toAdd)}
        title={alreadyAdded ? t("Already added.") : ""}
        name="toolName"
        checked={checked}
        onChange={() => checked
          ? this.remove(toolName)
          : this.add(toolName)} />
    </div>;
  };

  AddStockTools = () => {
    const add = this.stockToolNames()
      .filter(tool => this.state.toAdd.includes(tool.name))
      .filter(tool => this.filterExisting(tool.name));
    return <div className="add-stock-tools"
      hidden={this.props.firmwareHardware == "none"}>
      <label>{t("stock names")}</label>
      <ul>
        {this.stockToolNames().map(tool =>
          <li key={tool.name}>
            <this.StockToolCheckbox toolName={tool.name} />
            <p onClick={() => this.setState({
              toolName: tool.name,
              toolType: tool.type,
              utmMountable: tool.utm_mountable,
              effectorOffset: {
                x: tool.effector_offset_x ?? 0,
                y: tool.effector_offset_y ?? 0,
                z: tool.effector_offset_z ?? 0,
              },
            })}>{tool.name}</p>
          </li>)}
      </ul>
      <button
        className={`fb-button green ${add.length > 0 ? "" : "pseudo-disabled"}`}
        title={add.length > 0 ? t("Add selected") : t("None to add")}
        onClick={() => {
          add.map(tool => this.newTool(tool));
          this.navigate(Path.tools());
        }}>
        <i className="fa fa-plus" />
        {t("selected")}
      </button>
    </div>;
  };

  changeFlowRate = (flowRate: number) => this.setState({ flowRate });
  changeToolType = (toolType: ToolType) => this.setState({ toolType });
  changeEffectorOffset = (axis: Xyz, value: number) =>
    this.setState(state => ({
      effectorOffset: { ...state.effectorOffset, [axis]: value },
    }));

  render() {
    const { toolName, uuid } = this.state;
    const alreadyAdded = !uuid && !this.filterExisting(toolName);
    const panelName = "add-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new")}
        backTo={Path.tools()}
        panel={Panel.Tools}>
        <div className={"tool-action-btn-group"}>
          <SaveBtn
            onClick={this.save}
            disabled={!this.state.toolName || alreadyAdded}
            status={SpecialStatus.DIRTY} />
        </div>
      </DesignerPanelHeader>
      <DesignerPanelContent panelName={panelName}>
        <div className="add-new-tool grid">
          <ToolSVG toolName={this.state.toolName}
            toolType={this.state.toolType} profile={true} />
          <CustomToolGraphicsInput
            toolName={this.state.toolName}
            toolType={this.state.toolType}
            dispatch={this.props.dispatch}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            env={this.props.env} />
          <div className="row grid-exp-2">
            <label>{t("Name")}</label>
            <input defaultValue={this.state.toolName}
              name="toolName"
              onChange={e =>
                this.setState({ toolName: e.currentTarget.value })} />
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
            {alreadyAdded ? t("Already added.") : ""}
          </p>
        </div>
        <this.AddStockTools />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddTool = connect(mapStateToProps)(RawAddTool);
export default AddTool;
