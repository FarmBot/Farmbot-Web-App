import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { Saucer } from "../ui/index";
import { ResourceColor } from "../interfaces";
import { colors } from "../util";

interface PickerProps {
  position?: Position;
  current: ResourceColor;
  onChange?: (color: ResourceColor) => void;
  saucerIcon?: string;
}

interface ColorPickerClusterProps {
  onChange: (color: ResourceColor) => void;
  current: ResourceColor;
  saucerIcon?: string;
}

interface ColorPickerItemProps extends ColorPickerClusterProps {
  color: ResourceColor;
}

const ColorPickerItem = (props: ColorPickerItemProps) => {
  const isActive = props.color === props.current;
  return <div className="color-picker-item-wrapper"
    onClick={() => props.onChange(props.color)}>
    {props.saucerIcon
      ? <div className={`color-picker-item ${isActive ? "active" : ""}`}>
        <i className={`icon-saucer active-border fa ${props.saucerIcon}`} />
        <i className={`icon-saucer fa ${props.saucerIcon} ${props.color}`} />
      </div>
      : <Saucer color={props.color} active={isActive} />}
  </div>;
};

export const ColorPickerCluster = (props: ColorPickerClusterProps) => {
  return <div className="color-picker-cluster">
    {colors.map((color) => {
      return <ColorPickerItem
        key={color}
        onChange={props.onChange}
        saucerIcon={props.saucerIcon}
        current={props.current}
        color={color} />;
    })}
  </div>;
};
export class ColorPicker extends React.Component<PickerProps, {}> {

  public render() {
    const cb = this.props.onChange || function () { };
    return <Popover className="color-picker"
      position={this.props.position || Position.BOTTOM}
      popoverClassName="colorpicker-menu gray">
      {this.props.saucerIcon
        ? <i className={`icon-saucer fa ${this.props.saucerIcon} ${
          this.props.current}`} />
        : <Saucer color={this.props.current} />}
      <ColorPickerCluster
        onChange={cb}
        current={this.props.current}
        saucerIcon={this.props.saucerIcon} />
    </Popover>;
  }
}
