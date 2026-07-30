import { ExecutableType } from "farmbot/dist/resources/api_resources";
import { Path } from "../internal_urls";

export interface FarmEventScheduleTarget {
  executableType: ExecutableType;
  executableId: number;
}

export const farmEventSchedulePath = (
  executableType: ExecutableType,
  executableId: number,
) => `${Path.farmEvents("add")}?executable_type=${executableType}`
  + `&executable_id=${executableId}`;

export const readFarmEventScheduleTarget = (
  search = window.location.search,
): FarmEventScheduleTarget | undefined => {
  const params = new URLSearchParams(search);
  const type = params.get("executable_type");
  const id = Number(params.get("executable_id"));
  if (!["Sequence", "Regimen"].includes(type || "")
    || !Number.isInteger(id) || id < 1) {
    return;
  }
  return {
    executableType: type as ExecutableType,
    executableId: id,
  };
};
