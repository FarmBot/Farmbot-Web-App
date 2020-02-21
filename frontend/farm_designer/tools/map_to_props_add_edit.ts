import { Everything } from "../../interfaces";
import { TaggedTool, TaggedToolSlotPointer, FirmwareHardware } from "farmbot";
import {
  selectAllTools, maybeFindToolById, maybeGetToolSlot, maybeFindToolSlotById,
  selectAllToolSlotPointers,
} from "../../resources/selectors";
import { BotPosition } from "../../devices/interfaces";
import { validBotLocationData } from "../../util";
import { UUID } from "../../resources/interfaces";
import {
  getFwHardwareValue
} from "../../devices/components/firmware_hardware_support";
import { getFbosConfig } from "../../resources/getters";
import { getWebAppConfigValue } from "../../config_storage/actions";
import { BooleanSetting, NumericSetting } from "../../session_keys";
import { BotOriginQuadrant, isBotOriginQuadrant } from "../interfaces";
import { isActive } from "./edit_tool";

export interface AddEditToolSlotPropsBase {
  tools: TaggedTool[];
  dispatch: Function;
  botPosition: BotPosition;
  findTool(id: number): TaggedTool | undefined;
  firmwareHardware: FirmwareHardware | undefined;
  xySwap: boolean;
  quadrant: BotOriginQuadrant;
  isActive(id: number | undefined): boolean;
}

export const mapStateToPropsBase = (props: Everything): AddEditToolSlotPropsBase => {
  const getWebAppConfig = getWebAppConfigValue(() => props);
  const xySwap = !!getWebAppConfig(BooleanSetting.xy_swap);
  const rawQuadrant = getWebAppConfig(NumericSetting.bot_origin_quadrant);
  const quadrant = isBotOriginQuadrant(rawQuadrant) ? rawQuadrant : 2;
  return {
    tools: selectAllTools(props.resources.index),
    dispatch: props.dispatch,
    botPosition: validBotLocationData(props.bot.hardware.location_data).position,
    findTool: (id: number) => maybeFindToolById(props.resources.index, id),
    firmwareHardware: getFwHardwareValue(getFbosConfig(props.resources.index)),
    xySwap,
    quadrant,
    isActive: isActive(selectAllToolSlotPointers(props.resources.index)),
  };
};

export interface AddToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(uuid: UUID | undefined): TaggedToolSlotPointer | undefined;
}

export const mapStateToPropsAdd = (props: Everything): AddToolSlotProps => {
  const mapStateToProps = mapStateToPropsBase(props) as AddToolSlotProps;
  mapStateToProps.findToolSlot = (uuid: UUID | undefined) =>
    maybeGetToolSlot(props.resources.index, uuid);
  return mapStateToProps;
};

export interface EditToolSlotProps extends AddEditToolSlotPropsBase {
  findToolSlot(id: string): TaggedToolSlotPointer | undefined;
}

export const mapStateToPropsEdit = (props: Everything): EditToolSlotProps => {
  const mapStateToProps = mapStateToPropsBase(props) as EditToolSlotProps;
  mapStateToProps.findToolSlot = (id: string) =>
    maybeFindToolSlotById(props.resources.index, parseInt(id));
  return mapStateToProps;
};
