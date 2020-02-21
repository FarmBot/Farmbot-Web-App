import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus, TaggedToolSlotPointer } from "farmbot";
import { init, save, edit, destroy } from "../../api/crud";
import { Panel } from "../panel_header";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import { history } from "../../history";
import { SlotEditRows } from "./tool_slot_edit_components";
import { UUID } from "../../resources/interfaces";
import {
  isExpressBoard
} from "../../devices/components/firmware_hardware_support";
import { AddToolSlotProps, mapStateToPropsAdd } from "./map_to_props_add_edit";

export interface AddToolSlotState {
  uuid: UUID | undefined;
}

export class RawAddToolSlot
  extends React.Component<AddToolSlotProps, AddToolSlotState> {
  state: AddToolSlotState = { uuid: undefined };

  componentDidMount() {
    const action = init("Point", {
      pointer_type: "ToolSlot", name: t("Slot"), radius: 0, meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE,
      gantry_mounted: isExpressBoard(this.props.firmwareHardware) ? true : false,
    });
    this.setState({ uuid: action.payload.uuid });
    this.props.dispatch(action);
  }

  componentWillUnmount() {
    if (this.state.uuid && this.toolSlot
      && this.toolSlot.specialStatus == SpecialStatus.DIRTY) {
      confirm(t("Save new slot?"))
        ? this.props.dispatch(save(this.state.uuid))
        : this.props.dispatch(destroy(this.state.uuid, true));
    }
  }

  get toolSlot() {
    return this.props.findToolSlot(this.state.uuid);
  }

  get tool() {
    return this.toolSlot ?
      this.props.findTool(this.toolSlot.body.tool_id || 0) : undefined;
  }

  updateSlot = (toolSlot: TaggedToolSlotPointer) =>
    (update: Partial<TaggedToolSlotPointer["body"]>) =>
      this.props.dispatch(edit(toolSlot, update));

  save = () => {
    this.state.uuid && this.props.dispatch(save(this.state.uuid));
    history.push("/app/designer/tools");
  }

  render() {
    const panelName = "add-tool-slot";
    return <DesignerPanel panelName={panelName} panel={Panel.Tools}>
      <DesignerPanelHeader
        panelName={panelName}
        title={t("Add new slot")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {this.toolSlot
          ? <SlotEditRows
            isExpress={isExpressBoard(this.props.firmwareHardware)}
            toolSlot={this.toolSlot}
            tools={this.props.tools}
            tool={this.tool}
            botPosition={this.props.botPosition}
            xySwap={this.props.xySwap}
            quadrant={this.props.quadrant}
            isActive={this.props.isActive}
            updateToolSlot={this.updateSlot(this.toolSlot)} />
          : "initializing"}
        <SaveBtn onClick={this.save} status={SpecialStatus.DIRTY} />
      </DesignerPanelContent>
    </DesignerPanel>;
  }
}

export const AddToolSlot = connect(mapStateToPropsAdd)(RawAddToolSlot);
