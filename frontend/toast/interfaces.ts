export interface ToastOptions {
  title?: string;
  color?: string;
  idPrefix?: string;
  noTimer?: boolean;
  noDismiss?: boolean;
}

export interface CreateToastProps {
  message: string;
  title: string;
  color: string;
  idPrefix?: string;
  noTimer?: boolean;
  noDismiss?: boolean;
}

export interface CreateToastOnceProps extends CreateToastProps {
  fallbackLogger?: (x: string) => void;
}
