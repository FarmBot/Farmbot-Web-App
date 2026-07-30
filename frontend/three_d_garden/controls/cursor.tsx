import React from "react";
import { useThree } from "@react-three/fiber";

interface CursorRequest {
  cursor: string;
  priority: number;
  order: number;
}

interface ControlCursorContextValue {
  request(token: symbol, cursor: string, priority: number): void;
  release(token: symbol): void;
}

const ControlCursorContext =
  React.createContext<ControlCursorContextValue | undefined>(undefined);

export interface ControlCursorProviderProps {
  baseCursor?: string;
  children: React.ReactNode;
}

export const ControlCursorProvider = (
  props: ControlCursorProviderProps,
) => {
  const state = useThree();
  const requests = React.useRef(new Map<symbol, CursorRequest>());
  const previous = React.useRef(new Map<HTMLElement, string>());
  const order = React.useRef(0);
  const mounted = React.useRef(true);

  const targets = React.useCallback(() => {
    const result: HTMLElement[] = [];
    const add = (target: unknown) => {
      if (target instanceof HTMLElement && !result.includes(target)) {
        result.push(target);
      }
    };
    const canvas = state.gl.domElement as HTMLElement | undefined;
    add(state.events?.connected);
    add(canvas);
    add(canvas?.closest<HTMLElement>(".garden-bed-3d-model"));
    return result;
  }, [state.events?.connected, state.gl.domElement]);

  const applyCursor = React.useCallback(() => {
    const request = [...requests.current.values()]
      .sort((a, b) =>
        b.priority - a.priority || b.order - a.order)[0];
    targets().forEach(target => {
      if (!previous.current.has(target)) {
        previous.current.set(target, target.style.cursor);
      }
      target.style.cursor = request?.cursor || props.baseCursor || "";
    });
  }, [props.baseCursor, targets]);

  const value = React.useMemo<ControlCursorContextValue>(() => ({
    request: (token, cursor, priority) => {
      requests.current.set(token, {
        cursor,
        priority,
        order: ++order.current,
      });
      if (mounted.current) { applyCursor(); }
    },
    release: token => {
      requests.current.delete(token);
      if (mounted.current) { applyCursor(); }
    },
  }), [applyCursor]);

  React.useLayoutEffect(applyCursor, [applyCursor]);
  React.useEffect(() => {
    const previousCursors = previous.current;
    mounted.current = true;
    return () => {
      mounted.current = false;
      previousCursors.forEach((cursor, target) => {
        target.style.cursor = cursor;
      });
      previousCursors.clear();
    };
  }, []);

  return <ControlCursorContext.Provider value={value}>
    {props.children}
  </ControlCursorContext.Provider>;
};

export const useControlCursor = (
  active: boolean,
  cursor: string,
  priority = 1,
) => {
  const context = React.useContext(ControlCursorContext);
  const token = React.useRef(Symbol("three-d-control-cursor"));
  React.useEffect(() => {
    const currentToken = token.current;
    if (active) {
      if (context) {
        context.request(currentToken, cursor, priority);
      } else {
        document.body.style.cursor = cursor;
      }
    } else if (context) {
      context.release(currentToken);
    }
    return () => {
      if (context) {
        context.release(currentToken);
      } else if (active) {
        document.body.style.cursor = "default";
      }
    };
  }, [active, context, cursor, priority]);
};
