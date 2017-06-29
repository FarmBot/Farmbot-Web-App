import * as React from "react";
import { Saucer } from "../ui";
import { Color } from "../interfaces";
import { PickerProps, PickerState } from "./interfaces";
import { colors } from "../util";

export class ColorPicker extends React.Component<PickerProps, PickerState> {
  constructor() {
    super();
    this.state = { isOpen: false };
  }

  render() {
    let actual = this.props.current;
    let cb = this.props.onChange || function () { };
    let isOpen = this.state.isOpen ? "active" : "";

    function renderColors(color: Color, key: number) {
      let isActive = color === actual;
      return <div key={key} onClick={() => cb(color)} >
        <Saucer color={color} active={isActive} />
      </div>;
    }

    return <div className={`colorpicker ${isOpen}`}
      onClick={() => { this.setState({ isOpen: !this.state.isOpen }); }}>
      <Saucer color={this.props.current} />
      <div className="colorpicker-body">
        {colors.map(renderColors)}
      </div>
    </div>;
  };
}
