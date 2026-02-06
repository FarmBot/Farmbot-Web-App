import { store } from "../../redux/store";
import {
  ALLOWED_GROUPING,
  ALLOWED_ROUTE,
  AxisOrder,
  JobProgress,
  SafeZ,
  TaggedFbosConfig, TaggedFirmwareConfig, TaggedWebAppConfig,
} from "farmbot";
import { calculateAxialLengths } from "../../controls/move/direction_axes_props";
import * as getters from "../../resources/getters";
import { XyzNumber } from "./interfaces";
import { FirmwareConfig } from "farmbot/dist/resources/configs/firmware";
import { WebAppConfig } from "farmbot/dist/resources/configs/web_app";
import { FbosConfig } from "farmbot/dist/resources/configs/fbos";
import {
  selectAllPointGroups, selectAllPoints,
} from "../../resources/selectors_by_kind";
import { pointsSelectedByGroup } from "../../point_groups/criteria/apply";
import { sortGroupBy } from "../../point_groups/point_group_sort";
import { ResourceIndex } from "../../resources/interfaces";
import { getZFunc, TriangleData } from "../../three_d_garden/triangle_functions";

export const getFirmwareSettings = (): FirmwareConfig => {
  const fwConfig = getters.getFirmwareConfig(store.getState().resources.index);
  const firmwareSettings = (fwConfig as TaggedFirmwareConfig).body;
  return firmwareSettings;
};

export const getWebAppSettings = (): WebAppConfig => {
  const webAppConfig = getters.getWebAppConfig(store.getState().resources.index);
  const webAppSettings = (webAppConfig as TaggedWebAppConfig).body;
  return webAppSettings;
};

export const getFbosSettings = (): FbosConfig => {
  const fbosConfig = getters.getFbosConfig(store.getState().resources.index);
  const fbosSettings = (fbosConfig as TaggedFbosConfig).body;
  return fbosSettings;
};

export const getGardenSize = (): XyzNumber => {
  const firmwareSettings = getFirmwareSettings();
  const lengths = calculateAxialLengths({ firmwareSettings });
  const webAppSettings = getWebAppSettings();
  return {
    x: lengths.x || webAppSettings.map_size_x,
    y: lengths.y || webAppSettings.map_size_y,
    z: lengths.z || 500,
  };
};

export const getSafeZ = (): number => {
  const fbosSettings = getFbosSettings();
  return fbosSettings.safe_height || 0;
};

export const getSoilHeight = (x: number, y: number): number => {
  const triangles = JSON.parse(
    sessionStorage.getItem("soilSurfaceTriangles") || "[]") as TriangleData[];
  const getZ = getZFunc(triangles, -500);
  return getZ(x, y);
};

export const getGroupPoints = (resources: ResourceIndex, groupId: number) => {
  const allPoints = selectAllPoints(resources);
  const group = selectAllPointGroups(resources)
    .filter(group => group.body.id === groupId)[0];
  const groupPoints = pointsSelectedByGroup(group, allPoints);
  return sortGroupBy(group.body.sort_type, groupPoints);
};

export const getDefaultAxisOrder = (): (SafeZ | AxisOrder)[] => {
  const fbosConfig = getters.getFbosConfig(store.getState().resources.index);
  const defaultAxisOrder = fbosConfig?.body.default_axis_order;
  switch (defaultAxisOrder) {
    case "safe_z":
      return [{ kind: "safe_z", args: {} }];
    case undefined:
      return [];
    default:
      const [grouping, route] =
        defaultAxisOrder.split(";") as [ALLOWED_GROUPING, ALLOWED_ROUTE];
      return [{ kind: "axis_order", args: { grouping, route } }];
  }
};

export const getJob = (jobName: string): JobProgress | undefined => {
  const { jobs } = store.getState().bot.hardware;
  return Object.entries(jobs)
    .map(([key, value]) =>
      key === jobName
        ? value
        : undefined)[0];
};
