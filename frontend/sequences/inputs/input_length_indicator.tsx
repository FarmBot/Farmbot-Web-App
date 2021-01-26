import { LegalArgString } from "farmbot";
import React from "react";

export interface InputLengthIndicatorProps {
  field: LegalArgString;
  value: string;
}

const DEFAULT_LENGTH_LIMIT = 300;

const FIELD_LENGTH_LIMIT_LOOKUP: Partial<Record<LegalArgString, number>> = {
  lua: DEFAULT_LENGTH_LIMIT,
  message: DEFAULT_LENGTH_LIMIT,
};

export const InputLengthIndicator = (props: InputLengthIndicatorProps) => {
  const currentLength = JSON.stringify(props.value).length;
  const limit = FIELD_LENGTH_LIMIT_LOOKUP[props.field] || DEFAULT_LENGTH_LIMIT;
  return <span className={"char-limit"} hidden={currentLength < 0.9 * limit}>
    {currentLength}/{limit}
  </span>;
};
