import * as React from "react";

interface LayerTogleProps {
  label: string;
  value: boolean | undefined;
  onClick(): void;
}

/** A flipper type switch for showing/hiding the layers of the garden map. */
export function LayerToggle({ label, value, onClick }: LayerTogleProps) {
  let klassName = "fb-button fb-toggle-button " + (value ? "green" : "red");
  return <fieldset>
    <label>
      <span>{label}</span>
      <button className={klassName} onClick={onClick} />
    </label>
  </fieldset>;
}
