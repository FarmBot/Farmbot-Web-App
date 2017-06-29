import { DropAreaProps, DropAreaState } from "./interfaces";
import * as React from "react";
import { STEP_DATATRANSFER_IDENTIFER } from "./actions";

export class DropArea extends React.Component<DropAreaProps, DropAreaState> {
  constructor() {
    super();
    this.state = { isHovered: false };
  }

  dragOver = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
  }

  drop = (event: React.DragEvent<HTMLElement>) => {
    event.preventDefault();
    let key = event.dataTransfer.getData(STEP_DATATRANSFER_IDENTIFER);
    let fn = this.props.callback;
    if (fn) { fn(key); }
    this.toggle();
  }

  toggle = () => {
    this.setState({ isHovered: !this.state.isHovered });
  }

  render() {
    let isVisible = this.props.isLocked || this.state.isHovered;

    return <div onDragLeave={this.toggle}
      onDragEnter={this.toggle}>
      {isVisible &&
        <div className="drag-drop-area padding"
          onDragOver={this.dragOver}
          onDrop={this.drop}>
          {this.props.children}
        </div>
      }
    </div>;
  }
}
