import { SpecialStatus } from "farmbot";

export interface EditResourceParams {
  uuid: string;
  update: object;
  specialStatus: SpecialStatus;
}
