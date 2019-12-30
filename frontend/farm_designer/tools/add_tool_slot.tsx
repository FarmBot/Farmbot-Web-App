import React from "react";
import { connect } from "react-redux";
import {
  DesignerPanel, DesignerPanelContent, DesignerPanelHeader
} from "../designer_panel";
import { Everything } from "../../interfaces";
import { t } from "../../i18next_wrapper";
import { SaveBtn } from "../../ui";
import { SpecialStatus, TaggedTool, TaggedToolSlotPointer } from "farmbot";
import { init, save, edit, destroy } from "../../api/crud";
import { Panel } from "../panel_header";
import { ToolPulloutDirection } from "farmbot/dist/resources/api_resources";
import {
  selectAllTools, maybeFindToolById, maybeGetToolSlot
} from "../../resources/selectors";
import { BotPosition } from "../../devices/interfaces";
import { validBotLocationData } from "../../util";
import { history } from "../../history";
import { SlotEditRows } from "./tool_slot_edit_components";
import { UUID } from "../../resources/interfaces";

export interface AddToolSlotProps {
  tools: TaggedTool[];
  dispatch: Function;
  botPosition: BotPosition;
  findTool(id: number): TaggedTool | undefined;
  findToolSlot(uuid: UUID | undefined): TaggedToolSlotPointer | undefined;
}

export interface AddToolSlotState {
  uuid: UUID | undefined;
}

export const mapStateToProps = (props: Everything): AddToolSlotProps => ({
  tools: selectAllTools(props.resources.index),
  dispatch: props.dispatch,
  botPosition: validBotLocationData(props.bot.hardware.location_data).position,
  findTool: (id: number) => maybeFindToolById(props.resources.index, id),
  findToolSlot: (uuid: UUID | undefined) =>
    maybeGetToolSlot(props.resources.index, uuid),
});

export class RawAddToolSlot
  extends React.Component<AddToolSlotProps, AddToolSlotState> {
  state: AddToolSlotState = { uuid: undefined };

  componentDidMount() {
    const action = init("Point", {
      pointer_type: "ToolSlot", name: "Tool Slot", radius: 0, meta: {},
      x: 0, y: 0, z: 0, tool_id: undefined,
      pullout_direction: ToolPulloutDirection.NONE, gantry_mounted: false
    });
    this.setState({ uuid: action.payload.uuid });
    this.props.dispatch(action);
  }

  componentWillUnmount() {
    if (this.state.uuid && this.toolSlot
      && this.toolSlot.specialStatus == SpecialStatus.DIRTY) {
      confirm(t("Save new tool?"))
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
        title={t("Add new tool slot")}
        backTo={"/app/designer/tools"}
        panel={Panel.Tools} />
      <DesignerPanelContent panelName={panelName}>
        {this.toolSlot
          ? <SlotEditRows
            toolSlot={this.toolSlot}
            tools={this.props.tools}
            tool={this.tool}
            botPosition={this.props.botPosition}
            updateToolSlot={this.updateSlot(this.toolSlot)} />
          : "initializing"}
        <SaveBtn onClick={this.save} status={SpecialStatus.DIRTY} />
      </DesignerPanelContent>
    </DesignerPanel >;
  }
}

export const AddToolSlot = connect(mapStateToProps)(RawAddToolSlot);
