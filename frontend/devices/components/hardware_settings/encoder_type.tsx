import * as React from "react";
import { McuParams, Encoder, McuParamName } from "farmbot/dist";

import { FBSelect, DropDownItem } from "../../../ui/index";
import { t } from "../../../i18next_wrapper";

export interface EncoderTypeProps {
  hardware: McuParams;
  onChange(key: McuParamName, value: Encoder): void;
}

export const LOOKUP: { [name: string]: DropDownItem } = {
  [Encoder.differential]: { label: "Differential", value: Encoder.differential },
  [Encoder.quadrature]: { label: "Single-Ended", value: Encoder.quadrature },
  DEFAULT: { label: "---", value: Encoder.unknown }
};

const OPTIONS = [LOOKUP[Encoder.differential], LOOKUP[Encoder.quadrature]];

const KEYS: McuParamName[] = [
  "encoder_type_x",
  "encoder_type_y",
  "encoder_type_z"
];

export function isEncoderValue(x: unknown): x is Encoder {
  return !!Encoder[parseInt("" + x)];
}

export function findByType(input: number | string | undefined) {
  return LOOKUP[input || "DEFAULT"] || LOOKUP.DEFAULT;
}

export function EncoderType(props: EncoderTypeProps) {
  const { hardware } = props;
  const handleChange = (key: McuParamName) => (d: DropDownItem) => {
    const val = d.value;
    if (isEncoderValue(val)) {
      props.onChange(key, val);
    } else {
      throw new Error("Got bad encoder type in device panel.");
    }
  };
  return <tr>
    <td>
      <label>{t("ENCODER TYPE")}</label>
      <div className="help">
        <i className="fa fa-question-circle help-icon" />
        <div className="help-text">
          {t(`Rotary encoder type. Differential encoders use
            A, A+, B, and B+ channels. Single-Ended encoders use
            A and B channels.`)}
        </div>
      </div>
    </td>
    {KEYS.map(function (key, inx) {
      return <td key={inx}>
        <FBSelect selectedItem={findByType(hardware.encoder_type_z)}
          list={OPTIONS}
          onChange={handleChange(key)} />
      </td>;
    })}
  </tr>;
}
