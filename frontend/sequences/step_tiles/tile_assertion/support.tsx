import { Assertion } from "farmbot";
import { StepParams } from "../../interfaces";

export interface AssertionStepProps extends StepParams {
  currentStep: Assertion;
}
