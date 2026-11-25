import React from "react";
import { Canvas, createPortal, useFrame } from "@react-three/fiber";
import { OrthographicCamera, PCFShadowMap, Scene } from "three";
import { ErrorBoundary } from "../error_boundary";
import { DesignerPanelContent } from "../farm_designer/designer_panel";
import {
  ToolGraphic3DProps, ToolGraphicScene, ToolPreviewUnavailable, toolPreviewAvailable,
} from "./tool_graphics";

interface ToolPreview {
  target: HTMLDivElement;
  graphic: ToolGraphic3DProps;
}

type SetToolPreview = (id: string, preview?: ToolPreview) => void;
const ToolPreviewContext =
  React.createContext<SetToolPreview | undefined>(undefined);

export const ToolPreviewView = React.memo((props: ToolGraphic3DProps) => {
  const setPreview = React.useContext(ToolPreviewContext);
  const id = React.useId();
  // eslint-disable-next-line no-null/no-null
  const target = React.useRef<HTMLDivElement>(null);
  React.useLayoutEffect(() => {
    if (!setPreview || !target.current) { return; }
    setPreview(id, { target: target.current, graphic: props });
    return () => setPreview(id);
  }, [id, props, setPreview]);
  return <div ref={target} className={props.mounted
    ? "utm-and-mounted-tool-graphic tool-graphic-3d"
    : "tool-graphic-3d"} />;
});

ToolPreviewView.displayName = "ToolPreviewView";

const ToolPreviewScene = ({ target, graphic }: ToolPreview) => {
  const [scene] = React.useState(() => new Scene());
  const [camera] = React.useState(() => {
    const previewCamera = new OrthographicCamera();
    previewCamera.position.set(200, 0, 0);
    previewCamera.up.set(0, 0, 1);
    previewCamera.lookAt(0, 0, 0);
    return previewCamera;
  });
  const [size, setSize] = React.useState(() => ({
    width: target.clientWidth, height: target.clientHeight,
  }));
  React.useEffect(() => {
    const observer = new ResizeObserver(() => {
      const { clientWidth: width, clientHeight: height } = target;
      setSize(current => current.width == width && current.height == height
        ? current
        : { width, height });
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [target]);

  useFrame(({ gl }) => {
    const viewport = gl.domElement.getBoundingClientRect();
    const rect = target.getBoundingClientRect();
    const left = rect.left - viewport.left;
    const bottom = viewport.bottom - rect.bottom;
    const clipLeft = Math.max(0, left);
    const clipBottom = Math.max(0, bottom);
    const clipWidth = Math.min(viewport.width, left + rect.width) - clipLeft;
    const clipHeight = Math.min(viewport.height, bottom + rect.height) - clipBottom;
    if (clipWidth <= 0 || clipHeight <= 0) { return; }

    // Keep the full viewport to preserve framing when a row is partly visible.
    gl.setViewport(left, bottom, rect.width, rect.height);
    gl.setScissor(clipLeft, clipBottom, clipWidth, clipHeight);
    gl.setScissorTest(true);
    gl.render(scene, camera);
    gl.setScissorTest(false);
  }, 2);

  return size.width > 0 && size.height > 0
    ? createPortal(<ToolGraphicScene {...graphic} orbitTarget={target}
      viewportSize={size} />, scene, { camera })
    : undefined;
};

const ClearToolPreviewCanvas = () => {
  useFrame(({ gl }) => {
    gl.setScissorTest(false);
    gl.clear();
  }, 1);
  return undefined;
};

export const ToolPreviewPanel = (props: {
  hasTools: boolean;
  children: React.ReactNode;
}) => {
  const [previews, setPreviews] = React.useState(new Map<string, ToolPreview>());
  const [available] = React.useState(toolPreviewAvailable);
  const invalidate = React.useRef<(() => void) | undefined>(undefined);
  const setPreview = React.useCallback<SetToolPreview>((id, preview) => {
    setPreviews(current => {
      const next = new Map(current);
      preview ? next.set(id, preview) : next.delete(id);
      return next;
    });
  }, []);
  return <div className="tool-preview-panel"
    onScrollCapture={() => invalidate.current?.()}>
    <DesignerPanelContent panelName="tools">
      {props.hasTools && !available && <ToolPreviewUnavailable />}
      <ToolPreviewContext.Provider value={available ? setPreview : undefined}>
        {props.children}
      </ToolPreviewContext.Provider>
    </DesignerPanelContent>
    {props.hasTools && available &&
      <ErrorBoundary fallback={<ToolPreviewUnavailable />}>
        <div className="tool-preview-canvas" aria-hidden={true}>
          <Canvas
            style={{ pointerEvents: "none" }}
            shadows={{ type: PCFShadowMap }}
            frameloop="demand"
            onCreated={({ gl, invalidate: requestFrame }) => {
              gl.autoClear = false;
              invalidate.current = requestFrame;
            }}>
            <ClearToolPreviewCanvas />
            {Array.from(previews, ([id, preview]) =>
              <ToolPreviewScene key={id} {...preview} />)}
          </Canvas>
        </div>
      </ErrorBoundary>}
  </div>;
};
