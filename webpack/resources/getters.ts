import { findAll } from "./find_all";
import { ResourceIndex } from "./interfaces";
import {
  TaggedFbosConfig,
  TaggedWebAppConfig,
  TaggedFirmwareConfig
} from "farmbot";

/** @fileoverview Resource selectors for SINGULAR resources. */

/** Wow! */
export const getFbosConfig =
  (i: ResourceIndex): TaggedFbosConfig | undefined =>
    findAll<TaggedFbosConfig>(i, "FbosConfig")[0];
export const getWebAppConfig =
  (i: ResourceIndex): TaggedWebAppConfig | undefined =>
    findAll<TaggedWebAppConfig>(i, "WebAppConfig")[0];
export const getFirmwareConfig =
  (i: ResourceIndex): TaggedFirmwareConfig | undefined =>
    findAll<TaggedFirmwareConfig>(i, "FirmwareConfig")[0];
