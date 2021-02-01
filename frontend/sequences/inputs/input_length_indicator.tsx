import { LegalArgString } from "farmbot";
import React from "react";

export interface InputLengthIndicatorProps {
  field: LegalArgString;
  value: string;
}

const DEFAULT_LENGTH_LIMIT = 1500;

const FIELD_LENGTH_LIMIT_LOOKUP: Partial<Record<LegalArgString, number>> = {
  lua: DEFAULT_LENGTH_LIMIT,
  message: 300,
};

export const InputLengthIndicator = (props: InputLengthIndicatorProps) => {
  const limit = FIELD_LENGTH_LIMIT_LOOKUP[props.field] || DEFAULT_LENGTH_LIMIT;
  const currentLength = limit < DEFAULT_LENGTH_LIMIT
    ? props.value.length
    : JSON.stringify(props.value).length;
  return <span className={`char-limit ${currentLength > limit ? "over" : ""}`}
    hidden={currentLength < 0.9 * limit}>
    {currentLength}/{limit}
  </span>;
};
