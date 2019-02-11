import { DropAreaProps, DropAreaState } from "./interfaces";
import * as React from "react";
import { STEP_DATATRANSFER_IDENTIFER } from "./actions";

export class DropArea extends React.Component<DropAreaProps, DropAreaState> {

  state: DropAreaState = { isHovered: false };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    const key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFER);
    const fn = this.props.callback;
    if (fn) {
      fn(key);
    }
    this.toggle();
  }

  toggle = () => {
    this.setState({ isHovered: !this.state.isHovered });
  };

  render() {
    const isVisible = this.props.isLocked || this.state.isHovered;
    const klass = isVisible ? "drag-drop-area" : "";
    return <div
      className={klass}
      onDragLeave={this.toggle}
      onDragEnter={(e) => {
        e.preventDefault();
        this.toggle();
      }}
      onDragOver={this.dragOver}
      onDrop={this.drop}
      style={{ minHeight: "2rem" }} >
      {this.props.children}
    </div>;
  }
}
