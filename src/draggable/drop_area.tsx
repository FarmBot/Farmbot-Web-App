import { DropAreaProps, DropAreaState } from "./interfaces";
import * as React from "react";
import { STEP_DATATRANSFER_IDENTIFER } from "./actions";

export class DropArea extends React.Component<DropAreaProps, DropAreaState> {

  state: DropAreaState = { isHovered: false };

  dragOver = (e: React.DragEvent<HTMLElement>) => {
    console.log("DRAGOVER");
    e.preventDefault();
  }

  drop = (e: React.DragEvent<HTMLElement>) => {
    e.preventDefault();
    let key = e.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFER);
    console.log("Drop event for " + key || "NO_KEY");
    let fn = this.props.callback;
    if (fn) {
      console.log("Firing <DropArea/> callback");
      fn(key);
    }
    this.toggle();
  }

  toggle = () => {
    this.setState({ isHovered: !this.state.isHovered });
  };

  render() {
    let isVisible = this.props.isLocked || this.state.isHovered;
    let klass = isVisible ? "drag-drop-area" : "";
    return <div
      className={klass}
      onDragLeave={this.toggle}
      onDragEnter={(e) => {
        e.preventDefault();
        this.toggle();
        console.log("dragenter");
      }}
      onDragOver={this.dragOver}
      onDrop={this.drop}
      style={{ minHeight: "1.5rem", border: "1px solid red" }} >
      {this.props.children}
    </div>;
  }
}
