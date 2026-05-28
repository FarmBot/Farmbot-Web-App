import { Actions } from "../constants";

export const setPanelOpen3D = (payload: boolean) =>
  (dispatch: Function) => dispatch({
    type: Actions.SET_PANEL_OPEN,
    payload,
  });
