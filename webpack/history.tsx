import { browserHistory } from "react-router";
export let history = browserHistory;
export let push = (url: string) => history.push(url);
export let pathname = history.getCurrentLocation().pathname;
