import * as React from "react";
import { ToolBayFormProps } from "../interfaces";
import {
  Widget,
  WidgetBody,
  WidgetHeader,
  SaveBtn,
} from "../../ui/index";
import { t } from "i18next";
import {
  TaggedToolSlotPointer,
  getArrayStatus
} from "../../resources/tagged_resources";
import { saveAll, init } from "../../api/crud";
import { ToolBayHeader } from "./toolbay_header";
import { ToolTips } from "../../constants";
import { ToolSlotRow } from "./tool_slot_row";
import { emptyToolSlot } from "./empty_tool_slot";

export class ToolBayForm extends React.Component<ToolBayFormProps, {}> {

  render() {
    const { toggle, dispatch, toolSlots, botPosition } = this.props;
    const toolSlotStatus = getArrayStatus(toolSlots);
    return <div className={"toolbay-widget"}>
      <Widget>
        <WidgetHeader helpText={ToolTips.TOOLBAY_LIST} title={t("Tool Slots")}>
          <button
            className="gray fb-button"
            hidden={!!toolSlotStatus}
            onClick={() => { toggle(); }}>
            {t("Back")}
          </button>
          <SaveBtn
            status={toolSlotStatus}
            onClick={() => {
              dispatch(saveAll(toolSlots, () => { toggle(); }));
            }} />
          <button
            className="green fb-button"
            onClick={() => { dispatch(init(emptyToolSlot())); }}>
            <i className="fa fa-plus" />
          </button>
        </WidgetHeader>
        <WidgetBody>
          <ToolBayHeader />
          {this.props.getToolSlots().map(
            (slot: TaggedToolSlotPointer, index: number) => {
              return <ToolSlotRow
                dispatch={dispatch}
                slot={slot}
                botPosition={botPosition}
                toolOptions={this.props.getToolOptions()}
                onToolSlotChange={this.props.changeToolSlot(slot, this.props.dispatch)}
                chosenToolOption={this.props.getChosenToolOption(slot.uuid)}
              />;
            })}
        </WidgetBody>
      </Widget>
    </div>;
  }
}
