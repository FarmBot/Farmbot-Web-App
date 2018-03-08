import * as React from "react";

interface ToolSlotRowProps {

}

function ToolSlotRow(p: ToolSlotRowProps) {
  return <Row key={index}>
    <Col xs={1}>
      <Popover position={Position.BOTTOM_LEFT}>
        <i className="fa fa-gear" />
        <SlotMenu
          dispatch={dispatch}
          slot={slot}
          botPosition={botPosition} />
      </Popover>
    </Col>
    {/** ======================================================= */}
    <Col xs={2}>
      <BlurableInput
        value={(x || 0).toString()}
        onCommit={(e) => {
          dispatch(edit(slot, { x: parseInt(e.currentTarget.value, 10) }));
        }}
        type="number" />
    </Col>
    <Col xs={2}>
      <BlurableInput
        value={(y || 0).toString()}
        onCommit={(e) => {
          dispatch(edit(slot, { y: parseInt(e.currentTarget.value, 10) }));
        }}
        type="number" />
    </Col>
    <Col xs={2}>
      <BlurableInput
        value={(z || 0).toString()}
        onCommit={(e) => {
          dispatch(edit(slot, { z: parseInt(e.currentTarget.value, 10) }));
        }}
        type="number" />
    </Col>
    {/** ======================================================= */}
    <Col xs={4}>
      <FBSelect
        list={this.props.getToolOptions()}
        selectedItem={this.props.getChosenToolOption(slot.uuid)}
        allowEmpty={true}
        onChange={this.props.changeToolSlot(slot,
          this.props.dispatch)} />
    </Col>
    <Col xs={1}>
      <button
        className="red fb-button del-button"
        onClick={() => dispatch(destroy(slot.uuid))}>
        <i className="fa fa-times" />
      </button>
    </Col>
  </Row>;
}
interface NumColProps {
  axis: "x" | "y" | "z";
  value?: number;
  dispatch: Function;
  slot: TaggedToolSlotPointer;
}

function ToolBayNumberCol({ axis, value, dispatch, slot }: NumColProps) {
  return <Col xs={2}>
    <BlurableInput
      value={(value || 0).toString()}
      onCommit={(e) => {
        dispatch(edit(slot, { [axis]: parseInt(e.currentTarget.value, 10) }));
      }}
      type="number" />
  </Col>;

}
