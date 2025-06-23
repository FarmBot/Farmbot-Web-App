import React from "react";
import { DropAreaProps, DropAreaState } from "./interfaces";
import { STEP_DATATRANSFER_IDENTIFIER } from "./actions";

export class DropArea extends React.Component<DropAreaProps, DropAreaState> {

  state: DropAreaState = { isHovered: false };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  };

  drop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFIER);
    this.props.callback(key);
    this.toggle();
  };

  toggle = () => {
    this.setState({ isHovered: !this.state.isHovered });
  };

  render() {
    const isVisible = this.props.isLocked || this.state.isHovered;
    const visible = isVisible ? "visible" : "";
    return <div
      className={`drag-drop-area ${visible}`}
      onDragLeave={this.toggle}
      onDragEnter={(e) => {
        e.preventDefault();
        this.toggle();
      }}
      onDragOver={this.dragOver}
      onDrop={this.drop}
      style={{ minHeight: "2rem" }}>
      {this.props.children}
    </div>;
  }
}
