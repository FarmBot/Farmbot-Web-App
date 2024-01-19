import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../farm_designer/designer_panel";
import { Everything } from "../interfaces";
import { t } from "../i18next_wrapper";
import { SaveBtn } from "../ui";
import { SpecialStatus } from "farmbot";
import { initSave, destroy, init, save } from "../api/crud";
import { Panel } from "../farm_designer/panel_header";
import { push } from "../history";
import { selectAllTools } from "../resources/selectors";
import { betterCompact } from "../util";
import {
  getFwHardwareValue,
} from "../settings/firmware/firmware_hardware_support";
import { getFbosConfig } from "../resources/getters";
import { ToolSVG } from "../farm_designer/map/layers/tool_slots/tool_graphics";
import { AddToolProps, AddToolState } from "./interfaces";
import {
  reduceFarmwareEnv, saveOrEditFarmwareEnv,
} from "../farmware/state_to_props";
import { CustomToolGraphicsInput } from "./custom_tool_graphics";
import { Path } from "../internal_urls";
import {
  reduceToolName, ToolName,
} from "../farm_designer/map/tool_graphics/all_tools";
import { WaterFlowRateInput } from "./edit_tool";

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
  saveFarmwareEnv: saveOrEditFarmwareEnv(props.resources.index),
  env: reduceFarmwareEnv(props.resources.index),
});

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = { toolName: "", toAdd: [], uuid: undefined, flowRate: 0 };

  filterExisting = (n: string) => !this.props.existingToolNames.includes(n);

  add = (n: string) => this.filterExisting(n) && !this.state.toAdd.includes(n) &&
    this.setState({ toAdd: this.state.toAdd.concat([n]) });

  remove = (n: string) =>
    this.setState({ toAdd: this.state.toAdd.filter(name => name != n) });

  componentDidMount = () => this.setState({
    toAdd: this.stockToolNames().filter(this.filterExisting)
  });

  newTool = (name: string) => this.props.dispatch(initSave("Tool", { name }));

  back = () => push(Path.tools());

  save = () => {
    const initTool = init("Tool", {
      name: this.state.toolName,
      flow_rate_ml_per_s: this.state.flowRate,
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

  stockToolNames = () => {
    const TROUGHS = [
      t("Seed Trough 1"),
      t("Seed Trough 2"),
    ];
    const BASE_TOOLS = [
      t("Watering Nozzle"),
    ];
    const GENESIS_TOOLS = [
      t("Seeder"),
      t("Weeder"),
      t("Soil Sensor"),
      t("Seed Bin"),
      t("Seed Tray"),
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
        return [
          ...BASE_TOOLS,
          t("Rotary Tool"),
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
    const add = this.state.toAdd.filter(this.filterExisting);
    return <div className="add-stock-tools"
      hidden={this.props.firmwareHardware == "none"}>
      <label>{t("stock names")}</label>
      <ul>
        {this.stockToolNames().map(n =>
          <li key={n}>
            <this.StockToolCheckbox toolName={n} />
            <p onClick={() => this.setState({ toolName: n })}>{n}</p>
          </li>)}
      </ul>
      <button
        className={`fb-button green ${add.length > 0 ? "" : "pseudo-disabled"}`}
        title={add.length > 0 ? t("Add selected") : t("None to add")}
        onClick={() => {
          add.map(n => this.newTool(n));
          push(Path.tools());
        }}>
        <i className="fa fa-plus" />
        {t("selected")}
      </button>
    </div>;
  };

  changeFlowRate = (flowRate: number) => this.setState({ flowRate });

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
        <div className="add-new-tool">
          <ToolSVG toolName={this.state.toolName} profile={true} />
          <CustomToolGraphicsInput
            toolName={this.state.toolName}
            dispatch={this.props.dispatch}
            saveFarmwareEnv={this.props.saveFarmwareEnv}
            env={this.props.env} />
          <label>{t("Name")}</label>
          <input defaultValue={this.state.toolName}
            name="toolName"
            onChange={e =>
              this.setState({ toolName: e.currentTarget.value })} />
          {reduceToolName(toolName) == ToolName.wateringNozzle &&
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
