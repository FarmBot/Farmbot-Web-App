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

interface SlotScenePreviewRequest {
  slotId: number;
  canvas: HTMLCanvasElement;
}

export interface SlotScenePreviewBridge {
  current?: SlotScenePreviewRequest;
}

export const SlotScenePreviewContext =
  React.createContext<SlotScenePreviewBridge | undefined>(undefined);

const registerSlotPreview = (
  bridge: SlotScenePreviewBridge,
  request: SlotScenePreviewRequest,
) => {
  bridge.current = request;
  return () => {
    if (bridge.current == request) { bridge.current = undefined; }
  };
};

const SlotScenePreviewCanvas = (props: {
  slotId: number;
  bridge: SlotScenePreviewBridge;
}) => {
  // eslint-disable-next-line no-null/no-null
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  React.useLayoutEffect(() => {
    if (!canvasRef.current) { return; }
    return registerSlotPreview(props.bridge, {
      slotId: props.slotId, canvas: canvasRef.current,
    });
  }, [props.bridge, props.slotId]);
  return <canvas ref={canvasRef} className="tool-graphic-3d slot-scene-preview"
    aria-label={t("3D tool slot preview")} title={t("Drag to rotate")} />;
};

export const SlotScenePreview = (props: {
  slotId: number | undefined;
  children: React.ReactNode;
}) => {
  const bridge = React.useContext(SlotScenePreviewContext);
  return bridge && props.slotId !== undefined
    ? <SlotScenePreviewCanvas bridge={bridge} slotId={props.slotId} />
    : props.children;
};

const FOCUS_LAYER = 31;
const FRAME_INTERVAL_MS = 1000 / 30;
const DIM_OPACITY = 0.62;
const INITIAL_DIRECTION = new Vector3(1, -1, 1).normalize();

const findPreviewObjects = (scene: Scene, slotId: number) => {
  const lights: Light[] = [];
  const overlays: Object3D[] = [];
  let slot: Object3D | undefined;
  scene.traverseVisible(object => {
    if (object instanceof Light) { lights.push(object); }
    if (object.userData.toolSlotId == slotId) { slot = object; }
    if (object.name.endsWith("-crosshair") || object.name == "selected-object-ring") {
      overlays.push(object);
    }
  });
  return { slot, lights, overlays };
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

const renderFocusedSlot = (
  gl: WebGLRenderer,
  scene: Scene,
  camera: PerspectiveCamera,
  slot: Object3D,
  lights: Light[],
) => {
  const background = scene.background;
  const cameraLayers = camera.layers.mask;
  const layers = new Map<Object3D, number>();
  const include = (object: Object3D) => {
    layers.set(object, object.layers.mask);
    object.layers.enable(FOCUS_LAYER);
  };
  slot.traverse(include);
  lights.forEach(include);
  try {
    // Preserve the first pass's depth and shadows when redrawing the slot.
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

const openSlotScenePreview = (request: SlotScenePreviewRequest) => {
  const { canvas, slotId } = request;
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
  let highlight: ReturnType<typeof createYellowOutlinePass> | undefined;
  let lastFrame = -Infinity;

  const disposeHighlight = () => {
    highlight?.restoreObjectIds();
    highlight?.outlinePass.dispose();
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
      const { slot, lights, overlays } = findPreviewObjects(scene, slotId);
      if (!slot) { return; }

      const { source, dpr, width, height } = dimensions;
      if (renderTarget.width != width || renderTarget.height != height) {
        canvas.width = width;
        canvas.height = height;
        camera.aspect = width / height;
        camera.updateProjectionMatrix();
        renderTarget.setSize(width, height);
        highlight?.outlinePass.setSize(width, height);
      }

      bounds.setFromObject(slot);
      if (bounds.isEmpty()) {
        slot.getWorldPosition(target);
      } else {
        bounds.getCenter(target);
      }
      if (!highlight || highlight.outlinePass.selectedObjects[0] != slot) {
        disposeHighlight();
        highlight = createYellowOutlinePass(new Vector2(width, height), scene,
          camera, [{ object: slot, highlightName: "tool-slot" }],
          { thicknessScale: 0.25, spreadScale: 0.25 });
        const size = bounds.getSize(shift).length();
        camera.position.copy(target)
          .addScaledVector(INITIAL_DIRECTION, Math.max(280, size * 1.65));
      } else {
        camera.position.add(shift.subVectors(target, controls.target));
      }
      controls.target.copy(target);
      controls.update();

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
        renderFocusedSlot(gl, scene, camera, slot, lights);
        highlight.outlinePass.render(gl, renderTarget, renderTarget, 0, false);

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

export const SlotScenePreviewRenderer = (props: {
  bridge: SlotScenePreviewBridge;
}) => {
  const preview = React.useRef<ReturnType<typeof openSlotScenePreview>>(undefined);
  React.useEffect(() => () => preview.current?.dispose(), []);
  useFrame(({ gl, scene }) => {
    const request = props.bridge.current;
    if (preview.current?.request != request) {
      preview.current?.dispose();
      preview.current = request && openSlotScenePreview(request);
    }
    preview.current?.render(gl, scene);
  });
  return undefined;
};
