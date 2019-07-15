import { FirmwareHardware, Alert, Dictionary } from "farmbot";
import { TimeSettings } from "../interfaces";
import { UUID } from "../resources/interfaces";

export interface MessagesProps {
  alerts: Alert[];
  apiFirmwareValue: FirmwareHardware | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
  findApiAlertById(id: number): UUID;
}

export interface AlertsProps {
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
  findApiAlertById(id: number): UUID;
}

export interface ProblemTag {
  author: string;
  noun: string;
  verb: string;
}

export interface FirmwareAlertsProps {
  alerts: Alert[];
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
}

export interface AlertCardProps {
  alert: Alert;
  apiFirmwareValue: string | undefined;
  timeSettings: TimeSettings;
  dispatch: Function;
  findApiAlertById?(id: number): UUID;
}

export interface CommonAlertCardProps {
  alert: Alert;
  timeSettings: TimeSettings;
  findApiAlertById?(id: number): UUID;
  dispatch?: Function;
}

export interface AlertCardTemplateProps {
  className: string;
  title: string;
  alert: Alert;
  message: string;
  timeSettings: TimeSettings;
  children?: React.ReactNode;
  findApiAlertById?(id: number): UUID;
  dispatch?: Function;
  iconName?: string;
}

export interface DismissAlertProps {
  id?: number;
  findApiAlertById?(id: number): UUID;
  dispatch?: Function;
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

export interface Bulletin {
  content: string;
  href: string | undefined;
  href_label: string | undefined;
  type: string;
  slug: string;
  title: string | undefined;
}

export interface AlertComponentState {
  bulletin: Bulletin | undefined;
  no_content: boolean;
}

export interface AlertReducerState {
  alerts: Dictionary<Alert | undefined>;
}
