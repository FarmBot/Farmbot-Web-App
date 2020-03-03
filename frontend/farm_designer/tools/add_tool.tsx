import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader,
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus, FirmwareHardware } from "farmbot";
import { initSave } from "../../api/crud";
import { Panel } from "../panel_header";
import { history } from "../../history";
import { selectAllTools } from "../../resources/selectors";
import { betterCompact } from "../../util";
import {
  getFwHardwareValue,
} from "../../devices/components/firmware_hardware_support";
import { getFbosConfig } from "../../resources/getters";
import { ToolSVG } from "../map/layers/tool_slots/tool_graphics";

export interface AddToolProps {
  dispatch: Function;
  existingToolNames: string[];
  firmwareHardware: FirmwareHardware | undefined;
}

export interface AddToolState {
  toolName: string;
  toAdd: string[];
}

export const mapStateToProps = (props: Everything): AddToolProps => ({
  dispatch: props.dispatch,
  existingToolNames: betterCompact(selectAllTools(props.resources.index)
    .map(tool => tool.body.name)),
  firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
});

export class RawAddTool extends React.Component<AddToolProps, AddToolState> {
  state: AddToolState = { toolName: "", toAdd: [] };

  filterExisting = (n: string) => !this.props.existingToolNames.includes(n);

  add = (n: string) => this.filterExisting(n) && !this.state.toAdd.includes(n) &&
    this.setState({ toAdd: this.state.toAdd.concat([n]) });

  remove = (n: string) =>
    this.setState({ toAdd: this.state.toAdd.filter(name => name != n) });

  componentDidMount = () => this.setState({
    toAdd: this.stockToolNames().filter(this.filterExisting)
  });

  newTool = (name: string) => {
    this.props.dispatch(initSave("Tool", { name }));
  };

  save = () => {
    this.newTool(this.state.toolName);
    history.push("/app/designer/tools");
  }

  stockToolNames = () => {
    switch (this.props.firmwareHardware) {
      case "arduino":
      case "farmduino":
      case "farmduino_k14":
      default:
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
        ];
      case "farmduino_k15":
        return [
          t("Seeder"),
          t("Watering Nozzle"),
          t("Weeder"),
          t("Soil Sensor"),
          t("Seed Bin"),
          t("Seed Tray"),
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
      case "express_k10":
        return [
          t("Seed Trough 1"),
          t("Seed Trough 2"),
        ];
    }
  }

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
  }

  AddStockTools = () =>
    <div className="add-stock-tools">
      <label>{t("stock names")}</label>
      <ul>
        {this.stockToolNames().map(n =>
          <li key={n}>
            <this.StockToolCheckbox toolName={n} />
            <p onClick={() => this.setState({ toolName: n })}>{n}</p>
          </li>)}
      </ul>
      <button
        className="fb-button green"
        title={t("add selected stock names")}
        onClick={() => {
          this.state.toAdd.filter(this.filterExisting)
            .map(n => this.newTool(n));
          history.push("/app/designer/tools");
        }}>
        <i className="fa fa-plus" />
        {t("selected")}
      </button>
    </div>

  render() {
    const panelName = "add-tool";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        <div className="add-new-tool">
          <ToolSVG toolName={this.state.toolName} />
          <label>{t("Name")}</label>
          <input defaultValue={this.state.toolName}
            name="name"
            onChange={e =>
              this.setState({ toolName: e.currentTarget.value })} />
          <SaveBtn onClick={this.save} status={SpecialStatus.DIRTY} />
        </div>
        <this.AddStockTools />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddTool = connect(mapStateToProps)(RawAddTool);
