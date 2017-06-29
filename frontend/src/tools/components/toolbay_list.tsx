import * as React from "react";
import { t } from "i18next";
import { Row, Col, Widget, WidgetBody, WidgetHeader } from "../../ui";
import { ToolBayListProps } from "../interfaces";
import { TaggedToolSlotPointer } from "../../resources/tagged_resources";
import { ToolBayHeader } from "./toolbay_header";
import { ToolTips } from "../../constants";

export class ToolBayList extends React.Component<ToolBayListProps, {}> {
  render() {
    let toggle = () => this.props.toggle();
    let { getToolSlots, getToolByToolSlotUUID } = this.props;

    return <Widget>
      <WidgetHeader helpText={ToolTips.TOOLBAY_LIST} title={"ToolBay 1"}>
        <button
          className="gray fb-button"
          onClick={toggle}
        >
          {t("Edit")}
        </button>
      </WidgetHeader>
      <WidgetBody>
        <ToolBayHeader />
        {getToolSlots().map((slot: TaggedToolSlotPointer, index: number) => {
          let tool = getToolByToolSlotUUID(slot.uuid);
          let name = (tool && tool.body.name) || "None";
          return <Row key={slot.body.id}>
            <Col xs={2}>
              <label>{index + 1}</label>
            </Col>
            <Col xs={2}>{slot.body.x}</Col>
            <Col xs={2}>{slot.body.y}</Col>
            <Col xs={2}>{slot.body.z}</Col>
            <Col xs={4}>
              {name}
            </Col>
          </Row>;
        })}
      </WidgetBody>
    </Widget>
  }
};
