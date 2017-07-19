import { DropAreaProps, DropAreaState } from "./interfaces";
import * as React from "react";
import { STEP_DATATRANSFER_IDENTIFER } from "./actions";

export class DropArea extends React.Component<DropAreaProps, DropAreaState> {

  state: DropAreaState = { isHovered: false };

  dragOver = (e: React.DragEvent<HTMLElement>) => e.preventDefault();

  drop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    let key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFER);
    let fn = this.props.callback;
    if (fn) { fn(key); }
    this.toggle();
  }

  toggle = () => this.setState({ isHovered: !this.state.isHovered });

  render() {
    let isVisible = this.props.isLocked || this.state.isHovered;
    let klass = isVisible ? "drag-drop-area" : "";
    return <div
      className={klass}
      onDragLeave={this.toggle}
      onDragEnter={this.toggle}
      onDragOver={this.dragOver}
      onDrop={this.drop}
      style={{ minHeight: "2.5rem" }} >
      {this.props.children}
    </div>;
  }
}
