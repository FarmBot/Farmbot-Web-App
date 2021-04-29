import { ToastMessageProps, ToastMessages } from "../toast/interfaces";

export const fakeToast = (): ToastMessageProps => ({
  id: "toast_id", title: "title", color: "red", message: "message",
});

export const fakeToasts = (): ToastMessages => {
  const toast = fakeToast();
  return {
    [toast.id]: toast,
  };
};
