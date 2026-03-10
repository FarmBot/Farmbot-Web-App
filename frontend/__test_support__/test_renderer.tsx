import { type ComponentType, type ReactElement } from "react";
import TestRenderer from "react-test-renderer";

export const actRenderer = (callback: () => void | Promise<void>) =>
  TestRenderer.act(callback);

export const createRenderer = (
  element: ReactElement,
  errorMessage = "Failed to create test renderer.",
) => {
  let wrapper: TestRenderer.ReactTestRenderer | undefined;
  actRenderer(() => {
    wrapper = TestRenderer.create(element);
  });
  if (!wrapper) {
    throw new Error(errorMessage);
  }
  return wrapper;
};

export const getRendererInstance = <I, P>(
  wrapper: TestRenderer.ReactTestRenderer,
  component: ComponentType<P>,
) => wrapper.root.findByType(component).instance as I;

export const unmountRenderer = (wrapper: TestRenderer.ReactTestRenderer) => {
  actRenderer(() => {
    wrapper.unmount();
  });
};
