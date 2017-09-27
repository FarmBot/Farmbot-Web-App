import * as React from "react";
import { Primitive, coerceToBool } from "../../util";

interface FbCheckboxProps {
  value: Primitive | undefined;
  name: string;
  onChange: React.EventHandler<React.FormEvent<HTMLInputElement>>;
  children?: React.ReactChild;
}

export function FbCheckbox(props: FbCheckboxProps) {
  return <div>
    <input type="checkbox"
      value={"" + coerceToBool(props.value)}
      checked={coerceToBool(props.value)}
      name={props.name}
      onChange={(e) => {
        // No need make special cases for checkboxes.
        // Im sorry. Change back if it causes headaches.
        e.currentTarget.value = "" + e.currentTarget.checked;
        props.onChange(e);
      }
      } />
    <label>
      {props.children}
    </label>
  </div>;
}
