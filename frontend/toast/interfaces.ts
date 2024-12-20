export interface ToastOptions {
  title?: string;
  color?: string;
  idPrefix?: string;
  noTimer?: boolean;
  noDismiss?: boolean;
  redirect?: string;
}

interface CreateToastProps {
  message: string;
  title: string;
  color: string;
  idPrefix?: string;
  noTimer?: boolean;
  noDismiss?: boolean;
  redirect?: string;
}

export interface CreateToastOnceProps extends CreateToastProps {
  fallbackLogger?: (x: string) => void;
}

export interface ToastMessageProps extends CreateToastProps {
  id: string;
}

export type ToastMessages = Record<string, ToastMessageProps>;

export interface ToastState {
  /** Amount of time before each element is removed. */
  timeout: number;
  /** User's mouse is hovering over the message? */
  isHovered: boolean;
  detached: boolean;
  dismissed: boolean;
  intervalId: NodeJS.Timeout | undefined;
}

export interface ToastProps extends ToastMessageProps {
  dispatch: Function;
}

export interface ToastsProps {
  toastMessages: ToastMessages;
  dispatch: Function;
}
