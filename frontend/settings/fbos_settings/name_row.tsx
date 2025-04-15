import React from "react";
import { Row } from "../../ui";
import { DeviceSetting } from "../../constants";
import { NameRowProps } from "./interfaces";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { edit, save } from "../../api/crud";
import { getModifiedClassNameSpecifyDefault } from "../default_values";

export const NameRow = (props: NameRowProps) =>
  <Highlight settingName={DeviceSetting.name}>
    <Row className="grid-2-col">
      <label htmlFor={"device-name"}>
        {t(DeviceSetting.name)}
      </label>
      <input id={"device-name"}
        className={getModifiedClassNameSpecifyDefault(
          props.device.body.name, "FarmBot",
        )}
        onChange={e => props.dispatch(edit(props.device, {
          name: e.currentTarget.value
        }))}
        onBlur={() => props.dispatch(save(props.device.uuid))}
        value={props.device.body.name} />
    </Row>
  </Highlight>;
