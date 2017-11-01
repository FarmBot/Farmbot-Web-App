/// <reference path="react-redux.d.ts" />
import { Farmbot } from "farmbot";

/** This contains all of the global ENV vars passed from server => client.
 * Previously was `process.env.XYZ`. */
declare var globalConfig: { [k: string]: string };
