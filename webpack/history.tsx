import { navigate } from "takeme";

export const push = (url: string) => navigate(url);
export const getPathArray = () => location.pathname.split("/");

/** This is a stub from the `react-router`. Don't use it anymore. */
export const history = { push, getCurrentLocation: () => window.location };

