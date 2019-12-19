import * as React from "react";
import { Popover, Position } from "@blueprintjs/core";
import { Saucer } from "../ui/index";
import { ResourceColor } from "../interfaces";
import { colors } from "../util";

interface PickerProps {
  position?: Position;
  current: ResourceColor;
  onChange?: (color: ResourceColor) => void;
}

interface ColorPickerClusterProps {
  onChange: (color: ResourceColor) => void;
  current: ResourceColor;
}

interface ColorPickerItemProps extends ColorPickerClusterProps {
  color: ResourceColor;
}

const ColorPickerItem = (props: ColorPickerItemProps) => {
  const isActive = props.color === props.current;
  return <div onClick={() => props.onChange(props.color)}>
    <Saucer color={props.color} active={isActive} />
  </div>;
};

export const ColorPickerCluster = (props: ColorPickerClusterProps) => {
  return <div>
    {colors.map((color) => {
      return <ColorPickerItem
        key={color}
        onChange={props.onChange}
        current={props.current}
        color={color} />;
    })}
  </div>;
};
export class ColorPicker extends React.Component<PickerProps, {}> {

  public render() {
    const cb = this.props.onChange || function () { };
    return <Popover
      position={this.props.position || Position.BOTTOM}
      popoverClassName="colorpicker-menu gray">
      <Saucer color={this.props.current} />
      <ColorPickerCluster onChange={cb} current={this.props.current} />
    </Popover>;
  }
}
