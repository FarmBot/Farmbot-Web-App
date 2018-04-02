import * as React from "react";
import { connect } from "react-redux";
import { ToolsState, Props } from "./interfaces";
import { Col, Row, Page } from "../ui/index";
import { ToolBayList, ToolBayForm, ToolList, ToolForm } from "./components";
import { mapStateToProps } from "./state_to_props";

@connect(mapStateToProps)
export class Tools extends React.Component<Props, Partial<ToolsState>> {
  state: ToolsState = { editingBays: false, editingTools: false };

  toggle = (name: keyof ToolsState) =>
    () => this.setState({ [name]: !this.state[name] });

  render() {
    const isEditingBays = this.state.editingBays;
    const isEditingTools = this.state.editingTools;
    return <Page className="tools">
      <Row>
        <Col sm={7}>
          {!isEditingBays &&
            <ToolBayList
              toggle={this.toggle("editingBays")}
              dispatch={this.props.dispatch}
              getToolByToolSlotUUID={this.props.getToolByToolSlotUUID}
              getToolSlots={this.props.getToolSlots} />}
          {isEditingBays &&
            <ToolBayForm
              toggle={this.toggle("editingBays")}
              dispatch={this.props.dispatch}
              botPosition={this.props.botPosition}
              toolSlots={this.props.toolSlots}
              getToolSlots={this.props.getToolSlots}
              getChosenToolOption={this.props.getChosenToolOption}
              getToolOptions={this.props.getToolOptions}
              changeToolSlot={this.props.changeToolSlot} />}
        </Col>
        <Col sm={5}>
          {!isEditingTools &&
            <ToolList
              isActive={this.props.isActive}
              toggle={this.toggle("editingTools")}
              dispatch={this.props.dispatch}
              tools={this.props.tools} />}
          {isEditingTools &&
            <ToolForm
              toggle={this.toggle("editingTools")}
              dispatch={this.props.dispatch}
              tools={this.props.tools} />}
        </Col>
      </Row>
    </Page>;
  }
}
