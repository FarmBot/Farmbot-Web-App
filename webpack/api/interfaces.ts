import { SpecialStatus } from "../resources/tagged_resources";

export interface EditResourceParams {
  uuid: string;
  update: object;
  specialStatus: SpecialStatus;
}
