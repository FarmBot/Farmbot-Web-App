import React from "react";
import { connect } from "react-redux";
import { Everything } from "../../interfaces";
import { getFbosConfig } from "../../resources/getters";
import { FBSelect, DropDownItem, Row } from "../../ui";
import { edit, save } from "../../api/crud";
import { FirmwareHardware, TaggedFbosConfig, TaggedSequence } from "farmbot";
import {
  selectAllSequences, findSequenceById,
} from "../../resources/selectors";
import { betterCompact } from "../../util";
import { t } from "../../i18next_wrapper";
import { Highlight } from "../maybe_highlight";
import { DeviceSetting } from "../../constants";
import { getModifiedClassName } from "./default_values";
import { getFwHardwareValue } from "../firmware/firmware_hardware_support";

export interface BootSequenceSelectorProps {
  list: DropDownItem[];
  selectedItem: Readonly<DropDownItem> | undefined;
  config: TaggedFbosConfig;
  dispatch: Function;
  firmwareHardware: FirmwareHardware | undefined;
}

export const sequence2ddi = (x: TaggedSequence): DropDownItem | undefined => {
  const { body } = x;
  const emptyScope = (body.args.locals.body || []).length == 0;
  if (emptyScope && body.id) {
    return { label: body.name, value: body.id };
  }

  return undefined;
};

export function mapStateToProps(p: Everything): BootSequenceSelectorProps {
  const { index } = p.resources;
  const fbosConfig = getFbosConfig(index);
  if (fbosConfig) {
    const list = betterCompact(selectAllSequences(index).map(sequence2ddi));
    const { boot_sequence_id } = fbosConfig.body;
    const bs = boot_sequence_id
      ? findSequenceById(index, boot_sequence_id)
      : undefined;
    const firmwareHardware = getFwHardwareValue(fbosConfig);
    return {
      list,
      selectedItem: bs ? sequence2ddi(bs) : undefined,
      config: fbosConfig,
      dispatch: p.dispatch,
      firmwareHardware,
    };

  } else {
    throw new Error("No config found?");
  }
}

export const RawBootSequenceSelector = (props: BootSequenceSelectorProps) => {
  const onChange = (_selected: DropDownItem) => {
    const payload = { boot_sequence_id: _selected.value as number | undefined };
    props.dispatch(edit(props.config, payload));
    props.dispatch(save(props.config.uuid));
  };

  return <Highlight settingName={DeviceSetting.bootSequence}>
    <Row className="grid-2-col">
      <label>
        {t("BOOT SEQUENCE")}
      </label>
      <FBSelect
        extraClass={getModifiedClassName("boot_sequence_id",
          props.selectedItem?.value, props.firmwareHardware)}
        allowEmpty={true}
        list={props.list}
        selectedItem={props.selectedItem}
        onChange={onChange} />
    </Row>
  </Highlight>;
};

export const BootSequenceSelector =
  connect(mapStateToProps)(RawBootSequenceSelector);
