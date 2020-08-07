import React from "react";
import { MoveStepInputProps } from "./interfaces";
import { BlurableInput } from "../../../ui";

export const MoveStepInput = (props: MoveStepInputProps) => {
  const {
    field, axis, value, onCommit, setValue, min, max, onClear, disabled,
  } = props;
  const valueType = typeof value;
  const isLua = valueType == "string";
  return <BlurableInput key={valueType + value}
    wrapperClassName={isLua ? "lua" : ""}
    type={isLua ? "text" : "number"}
    name={field}
    value={value || props.defaultValue || (isLua ? "" : 0)}
    min={min}
    max={max}
    disabled={disabled}
    keyCallback={(key, buffer) => {
      isLua
        ? buffer == "" && setValue()
        : key == "=" && setValue(buffer);
      key == "" && onClear?.();
    }}
    clearBtn={!!onClear || isLua}
    onCommit={onCommit(field, axis)} />;
};
