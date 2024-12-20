import { FirmwareHardware } from "farmbot";
import { AnyAction } from "redux";
import { HelpState } from "../reducer";

export interface TourListProps {
  dispatch: Function;
}

export interface TourStepContainerProps {
  dispatch: Function;
  helpState: HelpState;
  firmwareHardware: FirmwareHardware | undefined;
}

export interface TourStepContainerState {
  title: string;
  message: string;
  transitionOut: boolean;
  transitionIn: boolean;
  highlighted: boolean;
  activeBeacons: string[];
}

interface ActiveBeacons {
  class: string;
  type: "soft" | "hard";
  keep?: boolean;
}

export interface TourStep {
  slug: string;
  title: string;
  content: string;
  beacons: string[] | undefined;
  activeBeacons?: ActiveBeacons[];
  url: string | undefined;
  extraContent?: React.ReactNode;
  dispatchActions?: AnyAction[];
}

export interface Tour {
  title: string;
  steps: TourStep[];
}
