import { uuid } from "farmbot";
import { Actions } from "../constants";
import { store } from "../redux/store";
import { CreateToastOnceProps } from "./interfaces";
import { notify } from "../util";

export const createToastOnce = (props: CreateToastOnceProps) => {
  const { message, fallbackLogger, title } = props;
  if (Object.values(store.getState().app.toasts)
    .filter(toast => toast.message == message).length > 0) {
    (fallbackLogger || console.log)(message);
  } else {
    notify(title, message);
    setTimeout(() => store.dispatch({
      type: Actions.CREATE_TOAST, payload: {
        ...props,
        id: `${props.idPrefix}-toast-${uuid()}`
      }
    }));
  }
};
