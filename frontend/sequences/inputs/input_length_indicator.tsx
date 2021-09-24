import { LegalArgString } from "farmbot";
import React from "react";

type Fields = LegalArgString | "description";

export interface InputLengthIndicatorProps {
  field: Fields;
  value: string;
  alwaysShow?: boolean;
}

const DEFAULT_LENGTH_LIMIT = 3000;

type LengthLimitLookup = Partial<Record<Fields, number>>;

const FIELD_LENGTH_LIMIT_LOOKUP: LengthLimitLookup = {
  lua: DEFAULT_LENGTH_LIMIT,
  message: 300,
  description: 5000,
};

export const InputLengthIndicator = (props: InputLengthIndicatorProps) => {
  const limit = FIELD_LENGTH_LIMIT_LOOKUP[props.field] || DEFAULT_LENGTH_LIMIT;
  const currentLength = limit < DEFAULT_LENGTH_LIMIT
    ? props.value.length
    : JSON.stringify(props.value).length;
  return <span className={`char-limit ${currentLength > limit ? "over" : ""}`}
    hidden={!props.alwaysShow && (currentLength < 0.9 * limit)}>
    {currentLength}/{limit}
  </span>;
};
