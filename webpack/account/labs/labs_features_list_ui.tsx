import * as React from "react";
import { fetchLabFeatures, LabsFeature } from "./labs_features_list_data";
import { KeyValShowRow } from "../../controls/key_val_show_row";

interface LabsFeaturesListProps {
  onToggle(feature: LabsFeature): void;
}

export function LabsFeaturesList(props: LabsFeaturesListProps) {
  return <div>
    {fetchLabFeatures().map((p, i) => {
      return <KeyValShowRow key={i}
        label={p.name}
        labelPlaceholder=""
        value={p.description}
        toggleValue={p.value ? 1 : 0}
        valuePlaceholder=""
        onClick={() => props.onToggle(p)}
        disabled={false} />;
    })}
  </div>;
}
