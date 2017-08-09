import * as React from "react";
import { BlurableInput } from "../../../ui/blurable_input";
import { InputBoxProps } from "./interfaces";

export function InputBox(p: InputBoxProps) {
  return <div>
    <label>
      {p.children}
    </label>
    <BlurableInput
      disabled={!!p.disabled}
      onCommit={p.onCommit}
      type="number"
      name={p.name}
      value={p.value} />
  </div>;
}
