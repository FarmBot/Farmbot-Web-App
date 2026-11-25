import React from "react";
import { useFrame } from "@react-three/fiber";
import {
  Box3, HalfFloatType, Light, Mesh, MeshBasicMaterial, Object3D,
  OrthographicCamera, PerspectiveCamera, PlaneGeometry, Scene, Vector2,
  Vector3, Vector4, WebGLRenderer, WebGLRenderTarget,
} from "three";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import { OrbitControls } from "three-stdlib";
import { t } from "../i18next_wrapper";
import { createYellowOutlinePass } from "./elements/highlight";
import { UTM_PREVIEW_Z_OFFSET } from "./constants";

type ToolScenePreviewSubject = number | "utm";

interface ToolScenePreviewRequest {
  subject: ToolScenePreviewSubject;
  canvas: HTMLCanvasElement;
}

export interface ToolScenePreviewBridge {
  current?: ToolScenePreviewRequest;
}

export const ToolScenePreviewContext =
  React.createContext<ToolScenePreviewBridge | undefined>(undefined);

const registerToolPreview = (
  bridge: ToolScenePreviewBridge,
  request: ToolScenePreviewRequest,
) => {
  bridge.current = request;
  return () => {
    if (bridge.current == request) { bridge.current = undefined; }
  };
};

const ToolScenePreviewCanvas = (props: {
  subject: ToolScenePreviewSubject;
  bridge: ToolScenePreviewBridge;
}) => {
  // eslint-disable-next-line no-null/no-null
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    if (!canvasRef.current) { return; }
    return registerToolPreview(props.bridge, {
      subject: props.subject, canvas: canvasRef.current,
    });
  }, [props.bridge, props.subject]);
  const mounted = props.subject == "utm";
  const className = mounted ? "mounted-tool-scene-preview" : "slot-scene-preview";
  return <canvas ref={canvasRef}
    className={`tool-graphic-3d tool-scene-preview ${className}`}
    aria-label={mounted ? t("3D mounted tool preview") : t("3D tool slot preview")}
    title={t("Drag to rotate")} />;
};

const ToolScenePreview = (props: {
  subject: ToolScenePreviewSubject | undefined;
  children: React.ReactNode;
}) => {
  const bridge = React.useContext(ToolScenePreviewContext);
  return bridge && props.subject !== undefined
    ? <ToolScenePreviewCanvas bridge={bridge} subject={props.subject} />
    : props.children;
};

export const SlotScenePreview = (props: {
  slotId: number | undefined;
  children: React.ReactNode;
}) => <ToolScenePreview subject={props.slotId}>{props.children}</ToolScenePreview>;

export const MountedToolScenePreview = (props: { children: React.ReactNode }) =>
  <ToolScenePreview subject={"utm"}>{props.children}</ToolScenePreview>;

const FOCUS_LAYER = 31;
const FRAME_INTERVAL_MS = 1000 / 30;
const DIM_OPACITY = 0.62;
const SLOT_DIRECTION = new Vector3(1, -1, 1).normalize();
const UTM_DIRECTION = new Vector3(1, 0, 0);
const UTM_CAMERA_DISTANCE = 310;

const findUtmFocus = (zAxis: Object3D | undefined) => {
  let anchor: Object3D | undefined;
  const focus: Object3D[] = [];
  // Only the live Z axis owns the tool. Jog ghosts can contain a copy.
  zAxis?.traverseVisible(object => {
    if (object.name == "UTM") { anchor = object; }
    if (object.name == "utm-highlight-selection") { focus.push(object); }
  });
  return { anchor, focus };
};

const findPreviewObjects = (scene: Scene, subject: ToolScenePreviewSubject) => {
  const lights: Light[] = [];
  const overlays: Object3D[] = [];
  let slot: Object3D | undefined;
  let zAxis: Object3D | undefined;
  scene.traverseVisible(object => {
    if (object instanceof Light) { lights.push(object); }
    if (object.userData.toolSlotId == subject) { slot = object; }
    if (object.name == "bot-z-axis") { zAxis = object; }
    if (object.name.endsWith("-crosshair")
      || object.name == "selected-object-ring") {
      overlays.push(object);
    }
  });
  const selection = subject == "utm"
    ? findUtmFocus(zAxis)
    : { anchor: slot, focus: slot ? [slot] : [] };
  return { ...selection, lights, overlays };
};

const measurePreview = (gl: WebGLRenderer, canvas: HTMLCanvasElement) => {
  const rect = canvas.getBoundingClientRect();
  if (!rect.width || !rect.height || rect.bottom <= 0
    || rect.top >= window.innerHeight) { return undefined; }
  const dpr = gl.getPixelRatio();
  const source = gl.domElement;
  const width = Math.min(source.width, Math.round(rect.width * dpr));
  const height = Math.min(source.height, Math.round(rect.height * dpr));
  return width && height ? { source, dpr, width, height } : undefined;
};

const renderFocusedObjects = (
  gl: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  focus: Object3D[],
  lights: Light[],
) => {
  const background = scene.background;
  const cameraLayers = camera.layers.mask;
  const layers = new Map<Object3D, number>();
  const include = (object: Object3D) => {
    layers.set(object, layers.get(object) ?? object.layers.mask);
    object.layers.enable(FOCUS_LAYER);
  };
  focus.forEach(root => root.traverse(include));
  lights.forEach(include);
  try {
    // Preserve the first pass's depth and shadows when redrawing the selection.
    // eslint-disable-next-line no-null/no-null
    scene.background = null;
    camera.layers.set(FOCUS_LAYER);
    gl.render(scene, camera);
  } finally {
    scene.background = background;
    camera.layers.mask = cameraLayers;
    layers.forEach((mask, object) => { object.layers.mask = mask; });
  }
};

const openToolScenePreview = (request: ToolScenePreviewRequest) => {
  const { canvas, subject } = request;
  const context = canvas.getContext("2d");
  if (!context) { return undefined; }
  const camera = new PerspectiveCamera(35, 1, 5, 100000);
  camera.up.set(0, 0, 1);
  const controls = new OrbitControls(camera, canvas);
  controls.enablePan = false;
  controls.enableZoom = false;
  const bounds = new Box3();
  const target = new Vector3();
  const shift = new Vector3();
  const viewport = new Vector4();
  const scissor = new Vector4();
  const renderTarget = new WebGLRenderTarget(1, 1, { type: HalfFloatType });
  const output = new OutputPass();
  output.renderToScreen = true;
  output.material.depthTest = false;
  output.material.depthWrite = false;
  const dimmer = new Scene();
  const dimCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 2);
  dimCamera.position.z = 1;
  const dimGeometry = new PlaneGeometry(2, 2);
  const dimMaterial = new MeshBasicMaterial({
    color: 0, transparent: true, opacity: DIM_OPACITY,
    depthTest: false, depthWrite: false, toneMapped: false,
  });
  dimmer.add(new Mesh(dimGeometry, dimMaterial));
  let cameraAnchor: Object3D | undefined;
  let highlight: ReturnType<typeof createYellowOutlinePass> | undefined;
  let lastFrame = -Infinity;

  const disposeHighlight = () => {
    highlight?.restoreObjectIds();
    highlight?.outlinePass.dispose();
  };

  const getOutline = (scene: Scene, focus: Object3D[]) => {
    const pass = highlight?.outlinePass;
    if (pass && pass.selectedObjects.length == focus.length
      && focus.every((object, index) => object == pass.selectedObjects[index])) {
      return pass;
    }
    disposeHighlight();
    highlight = createYellowOutlinePass(
      new Vector2(renderTarget.width, renderTarget.height), scene, camera,
      focus.map(object => ({ object, highlightName: "tool-preview" })),
      { thicknessScale: 0.25, spreadScale: 0.25 });
    return highlight.outlinePass;
  };

  const frameCamera = (anchor: Object3D) => {
    const mounted = subject == "utm";
    anchor.updateWorldMatrix(true, false);
    bounds.setFromObject(anchor);
    if (bounds.isEmpty()) {
      anchor.getWorldPosition(target);
    } else {
      bounds.getCenter(target);
    }
    if (mounted) { target.z += UTM_PREVIEW_Z_OFFSET; }
    if (!cameraAnchor || (!mounted && cameraAnchor != anchor)) {
      const distance = mounted
        ? UTM_CAMERA_DISTANCE
        : Math.max(280, bounds.getSize(shift).length() * 1.65);
      camera.position.copy(target)
        .addScaledVector(mounted ? UTM_DIRECTION : SLOT_DIRECTION, distance);
    } else {
      camera.position.add(shift.subVectors(target, controls.target));
    }
    cameraAnchor = anchor;
    controls.target.copy(target);
    controls.update();
  };

  return {
    request,
    dispose: () => {
      controls.dispose();
      dimGeometry.dispose();
      dimMaterial.dispose();
      disposeHighlight();
      output.dispose();
      renderTarget.dispose();
    },
    render: (gl: WebGLRenderer, scene: Scene) => {
      const now = performance.now();
      if (now - lastFrame < FRAME_INTERVAL_MS || gl.getRenderTarget()) { return; }
      const dimensions = measurePreview(gl, canvas);
      if (!dimensions) { return; }
      const { anchor, focus, lights, overlays } = findPreviewObjects(scene, subject);
      if (!anchor) { return; }

      const { source, dpr, width, height } = dimensions;
      if (renderTarget.width != width || renderTarget.height != height) {
        canvas.width = width;
        canvas.height = height;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderTarget.setSize(width, height);
        highlight?.outlinePass.setSize(width, height);
      }

      frameCamera(anchor);
      const outline = getOutline(scene, focus);

      gl.getViewport(viewport);
      gl.getScissor(scissor);
      const scissorTest = gl.getScissorTest();
      const autoClear = gl.autoClear;
      const updateShadows = gl.shadowMap.autoUpdate;
      overlays.forEach(object => { object.visible = false; });
      try {
        gl.setRenderTarget(renderTarget);
        gl.autoClear = true;
        gl.render(scene, camera);
        gl.autoClear = false;
        gl.shadowMap.autoUpdate = false;
        gl.render(dimmer, dimCamera);
        renderFocusedObjects(gl, scene, camera, focus, lights);
        outline.render(gl, renderTarget, renderTarget, 0, false);

        // Present before the map draws. The panel canvas only needs 2D access.
        gl.setRenderTarget(null); // eslint-disable-line no-null/no-null
        gl.setViewport(0, 0, width / dpr, height / dpr);
        gl.setScissor(0, 0, width / dpr, height / dpr);
        gl.setScissorTest(true);
        output.render(gl, renderTarget, renderTarget, 0, false);
        context.clearRect(0, 0, width, height);
        context.drawImage(source, 0, source.height - height, width, height,
          0, 0, width, height);
        lastFrame = now;
      } finally {
        gl.setRenderTarget(null); // eslint-disable-line no-null/no-null
        gl.setViewport(viewport);
        gl.setScissor(scissor);
        gl.setScissorTest(scissorTest);
        gl.autoClear = autoClear;
        gl.shadowMap.autoUpdate = updateShadows;
        overlays.forEach(object => { object.visible = true; });
      }
    },
  };
};

export const ToolScenePreviewRenderer = (props: {
  bridge: ToolScenePreviewBridge;
}) => {
  const preview = React.useRef<ReturnType<typeof openToolScenePreview>>(undefined);
  React.useEffect(() => () => preview.current?.dispose(), []);
  useFrame(({ gl, scene }) => {
    const request = props.bridge.current;
    if (preview.current?.request != request) {
      preview.current?.dispose();
      preview.current = request && openToolScenePreview(request);
    }
    preview.current?.render(gl, scene);
  });
  return undefined;
};
