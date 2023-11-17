import {
  FirmwareHardware, TaggedDevice, TaggedWizardStepResult, Xyz,
} from "farmbot";
import { WizardStepResult } from "farmbot/dist/resources/api_resources";
import { NumberConfigKey } from "farmbot/dist/resources/configs/firmware";
import { GetWebAppConfigValue } from "../config_storage/actions";
import { BotState } from "../devices/interfaces";
import { TimeSettings } from "../interfaces";
import { ResourceIndex } from "../resources/interfaces";
import { ControlsCheckOptions, PinBindingOptions } from "./checks";
import { WizardSectionSlug, WizardStepSlug } from "./data";

export interface SetupWizardProps extends WizardOutcomeComponentProps {
  timeSettings: TimeSettings;
  firmwareHardware: FirmwareHardware | undefined;
  wizardStepResults: TaggedWizardStepResult[];
  device: TaggedDevice | undefined;
}

interface WizardStepOutcome {
  slug: string;
  description: string;
  tips: string;
  hidden?: boolean;
  detectedProblems?: WizardOutcomeDetectedProblem[];
  images?: string[];
  component?: React.ComponentType<WizardOutcomeComponentProps>;
  controlsCheckOptions?: ControlsCheckOptions;
  video?: string;
  firmwareNumberSettings?: FirmwareSettingInputProps[];
  goToStep?: GoToStep;
}

interface GoToStep {
  text: string;
  step: WizardStepSlug;
}

interface WizardStepPrerequisite {
  status(): boolean;
  indicator: React.ComponentType;
}

interface WizardOutcomeDetectedProblem {
  status(): boolean;
  description: string;
}

export interface WizardOutcomeComponentProps {
  resources: ResourceIndex;
  bot: BotState;
  dispatch: Function;
  getConfigValue: GetWebAppConfigValue;
}

export interface WizardStepComponentProps extends WizardOutcomeComponentProps {
  setStepSuccess(success: boolean, outcome?: string): () => void;
}

interface ComponentOptions {
  border?: boolean;
  fullWidth?: boolean;
  background?: boolean;
}

export interface WizardStep {
  section: WizardSectionSlug;
  slug: WizardStepSlug;
  title: string;
  prerequisites?: WizardStepPrerequisite[];
  content: string;
  video?: string;
  images?: string[];
  component?: React.ComponentType<WizardStepComponentProps>;
  componentOptions?: ComponentOptions;
  warning?: string;
  controlsCheckOptions?: ControlsCheckOptions;
  pinBindingOptions?: PinBindingOptions;
  question: string;
  outcomes: WizardStepOutcome[];
}

export interface WizardSection {
  slug: WizardSectionSlug;
  title: string;
  steps: WizardStep[];
}

export interface WizardToCSection {
  title: string;
  steps: WizardStep[];
}

export type WizardToC = Record<WizardSectionSlug, WizardToCSection>;
export type WizardSteps = WizardStep[];

export type WizardResults = Partial<Record<WizardStepSlug, WizardStepResult>>;

export type WizardSectionsOpen = Partial<Record<WizardSectionSlug, boolean>>;

export interface SetupWizardState extends WizardSectionsOpen {
  stepOpen: WizardStepSlug | undefined;
}

export interface WizardStepDataProps {
  firmwareHardware: FirmwareHardware | undefined;
  getConfigValue?: GetWebAppConfigValue;
}

export interface WizardHeaderProps {
  reset(): void;
  results: TaggedWizardStepResult[];
  stepDataProps: WizardStepDataProps;
}

export interface WizardSectionHeaderProps {
  results: WizardResults;
  section: WizardSection;
  sectionOpen: boolean | undefined;
  toggleSection(slug: WizardSectionSlug): () => void;
}

export interface WizardStepHeaderProps {
  step: WizardStep;
  stepResult: WizardStepResult | undefined;
  section: WizardSection;
  stepOpen: WizardStepSlug | undefined;
  openStep(stepSlug: WizardStepSlug): () => void;
  timeSettings: TimeSettings;
  showProgress?: boolean;
}

export interface WizardStepContainerProps extends WizardOutcomeComponentProps {
  step: WizardStep;
  results: WizardResults;
  section: WizardSection;
  stepOpen: WizardStepSlug | undefined;
  openStep(stepSlug: WizardStepSlug): () => void;
  setStepSuccess(stepSlug: WizardStepSlug):
    (success: boolean, outcome?: string) => () => void;
  timeSettings: TimeSettings;
}

export interface TroubleshootingTipsProps extends WizardOutcomeComponentProps {
  selectedOutcome: string | undefined;
  step: WizardStep;
  openStep(stepSlug: WizardStepSlug): () => void;
  setSuccess(success: boolean, outcome?: string): () => void;
}

export interface CameraCheckBaseProps extends WizardStepComponentProps {
  component: React.ComponentType<WizardStepComponentProps>;
  longDuration?: boolean;
}

export interface SetupWizardSettingsProps {
  dispatch: Function;
  wizardStepResults: TaggedWizardStepResult[];
  device: TaggedDevice;
}

interface FirmwareSettingInputProps {
  key: NumberConfigKey;
  label: string;
  scale?: Xyz;
  intSize?: "long";
  inputMax?: number;
  toInput?: (input: number) => number;
  fromInput?: (input: number) => number;
}

export interface FirmwareNumberSettingsProps {
  firmwareNumberSettings?: FirmwareSettingInputProps[];
  dispatch: Function;
  bot: BotState;
  resources: ResourceIndex;
}
