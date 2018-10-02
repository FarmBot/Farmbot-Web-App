import * as React from "react";
import { t } from "i18next";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../../ui";
import { ToolBayListProps } from "../interfaces";
import { TaggedToolSlotPointer } from "farmbot";
import { ToolBayHeader } from "./toolbay_header";
import { ToolTips } from "../../constants";

export class ToolBayList extends React.Component<ToolBayListProps, {}> {

  ToolSlotListItem = (slot: TaggedToolSlotPointer, index: number) => {
    const { getToolByToolSlotUUID } = this.props;
    const tool = getToolByToolSlotUUID(slot.uuid);
    const name = (tool && tool.body.name) || t("None");
    return <Row key={slot.uuid}>
      <Col xs={1}><label>{index + 1}</label></Col>
      <Col xs={2}>{slot.body.x}</Col>
      <Col xs={2}>{slot.body.y}</Col>
      <Col xs={2}>{slot.body.z}</Col>
      <Col xs={4}>{name}</Col>
    </Row>;
  }

  render() {
    return <Widget>
      <WidgetHeader
        helpText={ToolTips.TOOLBAY_LIST}
        title={t("ToolBay ") + "1"}>
        <button
          className="gray fb-button"
          onClick={this.props.toggle}>
          {t("Edit")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <ToolBayHeader />
        {this.props.getToolSlots().map(this.ToolSlotListItem)}
      </WidgetBody>
    </Widget>;
  }
}
