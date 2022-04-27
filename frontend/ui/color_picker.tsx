import React from "react";
import { Position } from "@blueprintjs/core";
import { Popover, Saucer } from "../ui";
import { ResourceColor } from "../interfaces";
import { colors } from "../util";
import { t } from "../i18next_wrapper";

export interface ColorPickerProps {
  position?: Position;
  current: ResourceColor;
  onChange?: (color: ResourceColor) => void;
  saucerIcon?: string;
  targetElement?: JSX.Element;
}

export interface ColorPickerClusterProps {
  onChange: (color: ResourceColor) => void;
  current: ResourceColor;
  saucerIcon?: string;
}

interface ColorPickerItemProps extends ColorPickerClusterProps {
  color: ResourceColor;
}

const ColorPickerItem = (props: ColorPickerItemProps) => {
  return <div className="color-picker-item-wrapper"
    title={t(props.color)}
    onClick={() => props.onChange(props.color)}>
    {props.saucerIcon
      ? <i className={`icon-saucer fa ${props.saucerIcon} ${props.color}`} />
      : <Saucer color={props.color} active={false} />}
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

export class ColorPicker extends React.Component<ColorPickerProps> {
  render() {
    const { saucerIcon, onChange, targetElement } = this.props;
    const currentColor = this.props.current;
    const title = t("select color");
    const Target = () => {
      if (saucerIcon) {
        return <i title={title}
          className={[
            "icon-saucer",
            "fa",
            saucerIcon,
            currentColor,
          ].join(" ")} />;
      }
      if (targetElement) { return targetElement; }
      return <Saucer color={currentColor} title={title} />;
    };
    return onChange
      ? <Popover className={"color-picker"}
        position={this.props.position || Position.BOTTOM}
        popoverClassName={"colorpicker-menu gray"}
        target={<Target />}
        content={<ColorPickerCluster
          onChange={onChange}
          current={currentColor}
          saucerIcon={saucerIcon} />} />
      : <Target />;
  }
}
