import React from "react";
import { act, render } from "@testing-library/react";

type NodeLike = Element;

const toCamel = (key: string) =>
  key
    .replace(/-([a-z])/g, (_, c: string) => c.toUpperCase())
    .replace(/:([a-z])/g, (_, c: string) => c.toUpperCase());

const parseAttrValue = (value: string) => {
  if (value === "true") { return true; }
  if (value === "false") { return false; }
  const asNumber = Number(value);
  return Number.isNaN(asNumber) ? value : asNumber;
};

const parseStyle = (styleText: string): Record<string, string> =>
  styleText
    .split(";")
    .map(chunk => chunk.trim())
    .filter(Boolean)
    .reduce((acc, rule) => {
      const [name, ...valueParts] = rule.split(":");
      const value = valueParts.join(":").trim();
      if (!name || !value) { return acc; }
      acc[toCamel(name.trim())] = value;
      return acc;
    }, {} as Record<string, string>);

const propsOf = (node?: NodeLike) => {
  if (!node) { return {}; }
  const props: Record<string, unknown> = {};
  Array.from(node.attributes).forEach(attr => {
    const normalized = toCamel(attr.name);
    props[normalized] = normalized == "style"
      ? parseStyle(attr.value)
      : parseAttrValue(attr.value);
    // Some SVG renderers expose xlinkHref as href in the DOM.
    if (node.tagName.toLowerCase() == "image" && normalized == "href") {
      props.xlinkHref = parseAttrValue(attr.value);
    }
  });
  const styleText = (node as HTMLElement).style?.cssText;
  if (!props.style && styleText) {
    props.style = parseStyle(styleText);
  }
  return props;
};

const dispatchDomEvent = (
  node: NodeLike | undefined,
  eventName: string,
  init?: EventInit,
) => {
  if (!node) { return; }
  const rawType = eventName.replace(/^on/, "");
  const eventType = rawType[0]
    ? `${rawType[0].toLowerCase()}${rawType.slice(1)}`
    : eventName;
  const type = ({
    mouseEnter: "mouseover",
    mouseLeave: "mouseout",
  } as Record<string, string>)[eventType] || eventType.toLowerCase();
  const mouseEvent = type.startsWith("mouse")
    || ["click", "dblclick", "contextmenu"].includes(type);
  const shared = { bubbles: true, cancelable: true, ...(init || {}) };
  const event = mouseEvent
    ? new MouseEvent(type, shared)
    : new Event(type, shared);
  act(() => {
    node.dispatchEvent(event);
  });
};

const makeWrapper = (nodes: NodeLike[], root: HTMLElement) => ({
  length: nodes.length,
  first: () => makeWrapper(nodes.length ? [nodes[0]] : [], root),
  last: () => makeWrapper(nodes.length ? [nodes[nodes.length - 1]] : [], root),
  at: (index: number) => makeWrapper(
    nodes[index] ? [nodes[index]] : [],
    root,
  ),
  find: (selector: unknown) => {
    const found = typeof selector == "string"
      ? nodes.flatMap(node =>
        Array.from(node.querySelectorAll(selector)))
      : nodes.flatMap(node =>
        Array.from(node.querySelectorAll(":scope > *")));
    return makeWrapper(found, root);
  },
  props: () => propsOf(nodes[0]),
  prop: (name: string) => (propsOf(nodes[0]))[name],
  filterWhere: (
    predicate: (
      node: {
        prop: (name: string) => unknown;
        props: () => Record<string, unknown>;
      }
    ) => boolean,
  ) => {
    const filtered = nodes.filter(node => predicate({
      prop: (name: string) => (propsOf(node))[name],
      props: () => propsOf(node),
    }));
    return makeWrapper(filtered, root);
  },
  hasClass: (className: string) => !!nodes[0]?.classList.contains(className),
  text: () => nodes[0]?.textContent || "",
  simulate: (eventName: string, init?: EventInit) => {
    dispatchDomEvent(nodes[0], eventName, init);
  },
  html: () => root.innerHTML,
  container: root,
});

export function svgMount(element: React.ReactNode) {
  const classInstances = new Map<unknown, Record<string, unknown>>();
  const withRef = React.isValidElement(element)
    && typeof element.type !== "string"
    && (element.type as { prototype?: unknown }).prototype
    && "isReactComponent" in ((
      element.type as { prototype?: Record<string, unknown> }
    ).prototype || {})
    ? React.cloneElement(element, {
      ref: (instance: unknown) => {
        if (instance) {
          classInstances.set(element.type, instance as Record<string, unknown>);
        }
      }
    } as never)
    : element;

  const view = render(<svg>{withRef}</svg>);
  const root = view.container;
  const findComponent = (selector: unknown) => {
    const instance = classInstances.get(selector);
    return {
      setState: (state: unknown, callback?: () => void) => {
        if (!instance || typeof instance.setState !== "function") { return; }
        act(() => (instance.setState as (s: unknown, cb?: () => void) => void)(state, callback));
      },
      state: () => (instance?.state) || {},
      instance: () => instance,
      props: () => (instance?.props) || {},
      html: () => root.innerHTML,
      simulate: (eventName: string, init?: EventInit) => {
        const first = root.querySelector("svg > *");
        dispatchDomEvent(first || undefined, eventName, init);
      },
      first: () => findComponent(selector),
      last: () => findComponent(selector),
      at: () => findComponent(selector),
      find: (subSelector: unknown) =>
        typeof subSelector == "string"
          ? makeWrapper(Array.from(root.querySelectorAll(subSelector)), root)
          : makeWrapper([], root),
    };
  };
  return {
    ...view,
    // Compatibility for older Enzyme-style tests.
    html: () => root.innerHTML,
    find: (selector: string | unknown) => {
      if (typeof selector == "string") {
        return makeWrapper(Array.from(root.querySelectorAll(selector)), root);
      }
      if (classInstances.has(selector)) {
        return findComponent(selector);
      }
      return makeWrapper(Array.from(root.querySelectorAll("svg > *")), root);
    },
  };
}
