import React from "react";

// eslint-disable-next-line comma-spacing
export const findElement = <P,>(
  node: React.ReactNode,
  matcher: (type: React.ElementType) => boolean,
): React.ReactElement<P> | undefined => {
  if (!node || typeof node === "string" || typeof node === "number") {
    return undefined;
  }
  if (Array.isArray(node)) {
    const children: React.ReactNode[] = node;
    for (const child of children) {
      const found = findElement<P>(child, matcher);
      if (found) { return found; }
    }
    return undefined;
  }
  if (React.isValidElement<{ children?: React.ReactNode }>(node)) {
    if (matcher(node.type as React.ElementType)) {
      return node as React.ReactElement<P>;
    }
    return findElement<P>(node.props.children, matcher);
  }
  return undefined;
};

export const findElementByType =
  // eslint-disable-next-line comma-spacing
  <P,>(
    node: React.ReactNode,
    component: React.ElementType,
  ): React.ReactElement<P> | undefined =>
    findElement<P>(node, type => type === component);
