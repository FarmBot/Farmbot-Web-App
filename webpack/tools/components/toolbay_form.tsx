import * as React from "react";
import { ToolBayFormProps } from "../interfaces";
import {
  Widget,
  WidgetBody,
  WidgetHeader,
  SaveBtn,
} from "../../ui";
import { t } from "i18next";
import {
  getArrayStatus
} from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolBayHeader } from "./toolbay_header";
import { ToolTips } from "../../constants";
import { ToolSlotRow } from "./tool_slot_row";
import { emptyToolSlotBody } from "./empty_tool_slot";
import { TaggedToolSlotPointer } from "farmbot";

export class ToolBayForm extends React.Component<ToolBayFormProps, {}> {

  HeaderButtons = () => {
    const { toggle, dispatch, toolSlots } = this.props;
    const toolSlotStatus = getArrayStatus(toolSlots);
    return <div>
      <button
        className="gray fb-button"
        disabled={!!toolSlotStatus}
        onClick={toggle}>
        {t("Back")}
      </button>
      <SaveBtn
        status={toolSlotStatus}
        onClick={() => dispatch(saveAll(toolSlots, toggle))} />
      <button
        className="green fb-button"
        onClick={() => dispatch(init("Point", emptyToolSlotBody()))}>
        <i className="fa fa-plus" />
      </button>
    </div>;
  }

  ToolbayForm = (slot: TaggedToolSlotPointer) => {
    const { dispatch, botPosition } = this.props;
    return <ToolSlotRow
      key={slot.uuid}
      dispatch={dispatch}
      slot={slot}
      botPosition={botPosition}
      toolOptions={this.props.getToolOptions()}
      onToolSlotChange={this.props.changeToolSlot(slot, this.props.dispatch)}
      chosenToolOption={this.props.getChosenToolOption(slot.uuid)} />;
  }

  render() {
    return <div className={"toolbay-widget"}>
      <Widget>
        <WidgetHeader helpText={ToolTips.TOOLBAY_LIST} title={t("Tool Slots")}>
          <this.HeaderButtons />
        </WidgetHeader>
        <WidgetBody>
          <ToolBayHeader />
          {this.props.getToolSlots().map(this.ToolbayForm)}
        </WidgetBody>
      </Widget>
    </div>;
  }
}
