import { FirmwareHardware, Enigma } from "farmbot";
import { TimeSettings } from "../interfaces";
import { BotState } from "../devices/interfaces";

export interface MessagesProps {
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface AlertsProps {
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface ProblemTag {
  author: string;
  noun: string;
  verb: string;
}

export interface FirmwareAlertsProps {
  bot: BotState;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface Alert extends Enigma { }

export interface AlertCardProps {
  alert: Alert;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface CommonAlertCardProps {
  alert: Alert;
  timeSettings: TimeSettings;
}

export interface AlertCardTemplateProps {
  className: string;
  title: string;
  alert: Alert;
  message: string;
  timeSettings: TimeSettings;
  children?: React.ReactNode;
}

export interface FirmwareMissingProps extends CommonAlertCardProps {
  apiFirmwareValue: string | undefined;
}

export interface SeedDataMissingProps extends CommonAlertCardProps {
  dispatch: Function;
}

export interface SeedDataMissingState {
  selection: string;
}

export interface TourNotTakenProps extends CommonAlertCardProps {
  dispatch: Function;
}
