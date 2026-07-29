import React from "react";
import { type ThreeElements, useFrame, useThree } from "@react-three/fiber";
import {
  type Group as GroupType, type Object3D, Vector2,
} from "three";
import { EffectComposer } from
  "three/examples/jsm/postprocessing/EffectComposer.js";
import { OutlinePass } from
  "three/examples/jsm/postprocessing/OutlinePass.js";
import { RenderPass } from
  "three/examples/jsm/postprocessing/RenderPass.js";
import { Color } from "../../ui/colors";
import { Group } from "../components";

const EDGE_STRENGTH = 5;
const EDGE_GLOW = 1;
const EDGE_THICKNESS = 3;
const OBJECT_ID_EDGE_INTENSITY = 0.3;
export const HIGHLIGHT_ALL = "all";

export interface HighlightRegistration {
  highlightName: string;
  object: Object3D;
}

type RegisterHighlight = (
  object: Object3D,
  highlightName: string,
) => () => void;

interface HighlightContextValue {
  highlighted3DObject: string | undefined;
  register: RegisterHighlight;
}

const HighlightContext =
  React.createContext<HighlightContextValue | undefined>(undefined);

interface HighlightRendererProps {
  registrations: HighlightRegistration[];
}

const OBJECT_ID_UNIFORM = "highlightObjectId";

const replaceShaderChunk = (
  source: string,
  current: string,
  replacement: string,
) => {
  if (!source.includes(current)) {
    throw new Error("Unable to configure the object-ID outline shader.");
  }
  return source.replace(current, replacement);
};

export const configureObjectIdOutlinePass = (
  outlinePass: OutlinePass,
  registrations: HighlightRegistration[],
) => {
  const maskMaterial = outlinePass.prepareMaskMaterial;
  maskMaterial.uniforms[OBJECT_ID_UNIFORM] = { value: 0 };
  maskMaterial.fragmentShader = replaceShaderChunk(
    maskMaterial.fragmentShader,
    "uniform sampler2D depthTexture;",
    `uniform sampler2D depthTexture;
     uniform float ${OBJECT_ID_UNIFORM};`,
  );
  maskMaterial.fragmentShader = replaceShaderChunk(
    maskMaterial.fragmentShader,
    "gl_FragColor = vec4(0.0, depthTest, 1.0, 1.0);",
    `gl_FragColor = vec4(${OBJECT_ID_UNIFORM}, depthTest, 0.0, 1.0);`,
  );
  maskMaterial.needsUpdate = true;

  const edgeMaterial = outlinePass.edgeDetectionMaterial;
  edgeMaterial.fragmentShader = replaceShaderChunk(
    edgeMaterial.fragmentShader,
    "float d = length( vec2(diff1, diff2) );",
    `float d = ${OBJECT_ID_EDGE_INTENSITY}
      * step(0.0001, length(vec2(diff1, diff2)));`,
  );
  edgeMaterial.needsUpdate = true;

  const overlayMaterial = outlinePass.overlayMaterial;
  overlayMaterial.fragmentShader = replaceShaderChunk(
    overlayMaterial.fragmentShader,
    "vec4 finalColor = edgeStrength * maskColor.r * edgeValue;",
    "vec4 finalColor = edgeStrength * edgeValue;",
  );
  overlayMaterial.needsUpdate = true;

  const highlightNames = [...new Set(
    registrations.map(registration => registration.highlightName))];
  const idByName = new Map(highlightNames.map((name, index) => [
    name,
    (index + 1) / (highlightNames.length + 1),
  ]));
  const idByRoot = new Map(registrations.map(registration => [
    registration.object,
    idByName.get(registration.highlightName) ?? 0,
  ]));
  const originalBeforeRender = maskMaterial.onBeforeRender;
  const objectIdBeforeRender: typeof maskMaterial.onBeforeRender = function (
    this: typeof maskMaterial,
    ...args
  ) {
    originalBeforeRender.apply(this, args);
    let object: Object3D | null = args[4];
    while (object) {
      const objectId = idByRoot.get(object);
      if (objectId !== undefined) {
        const uniform = maskMaterial.uniforms[OBJECT_ID_UNIFORM];
        if (uniform.value != objectId) {
          uniform.value = objectId;
          maskMaterial.uniformsNeedUpdate = true;
        }
        return;
      }
      object = object.parent;
    }
  };
  maskMaterial.onBeforeRender = objectIdBeforeRender;
  return () => {
    if (maskMaterial.onBeforeRender == objectIdBeforeRender) {
      maskMaterial.onBeforeRender = originalBeforeRender;
    }
  };
};

const HighlightRenderer = (props: HighlightRendererProps) => {
  const { gl, scene, camera, size } = useThree();
  const { composer, outlinePass, restoreObjectIds } = React.useMemo(() => {
    const nextComposer = new EffectComposer(gl);
    const objects = props.registrations.map(
      registration => registration.object);
    const nextOutlinePass = new OutlinePass(
      new Vector2(size.width, size.height), scene, camera, objects,
    );
    const restoreIds = configureObjectIdOutlinePass(
      nextOutlinePass, props.registrations);
    nextOutlinePass.visibleEdgeColor.set(Color.yellow);
    nextOutlinePass.hiddenEdgeColor.set(Color.yellow);
    nextOutlinePass.edgeStrength = EDGE_STRENGTH;
    nextOutlinePass.edgeGlow = EDGE_GLOW;
    nextOutlinePass.edgeThickness = EDGE_THICKNESS;
    nextOutlinePass.pulsePeriod = 0;
    nextComposer.addPass(new RenderPass(scene, camera));
    nextComposer.addPass(nextOutlinePass);
    return {
      composer: nextComposer,
      outlinePass: nextOutlinePass,
      restoreObjectIds: restoreIds,
    };
  }, [camera, gl, props.registrations, scene, size.height, size.width]);

  React.useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.height, size.width]);

  React.useEffect(() => () => {
    restoreObjectIds();
    outlinePass.dispose();
    composer.dispose();
  }, [composer, outlinePass, restoreObjectIds]);

  useFrame((_state, delta) => composer.render(delta), 1);
  return <></>;
};

export interface HighlightProviderProps {
  children: React.ReactNode;
  highlighted3DObject?: string;
}

export const HighlightProvider = (props: HighlightProviderProps) => {
  const [registrations, setRegistrations] =
    React.useState<HighlightRegistration[]>([]);
  const register = React.useCallback<RegisterHighlight>((
    object,
    highlightName,
  ) => {
    setRegistrations(current => [...current, { highlightName, object }]);
    return () => setRegistrations(current =>
      current.filter(registration => registration.object !== object));
  }, []);
  const value = React.useMemo<HighlightContextValue>(() => ({
    highlighted3DObject: props.highlighted3DObject,
    register,
  }), [props.highlighted3DObject, register]);
  return <HighlightContext.Provider value={value}>
    {props.children}
    {registrations.length > 0 &&
      <HighlightRenderer registrations={registrations} />}
  </HighlightContext.Provider>;
};

export interface HighlightProps
  extends Omit<ThreeElements["group"], "ref" | "name"> {
  highlightName: string;
}

export const Highlight = (props: HighlightProps) => {
  const { children, highlightName, ...groupProps } = props;
  const context = React.useContext(HighlightContext);
  const highlighted3DObject = context?.highlighted3DObject;
  const register = context?.register;
  const active = highlighted3DObject == HIGHLIGHT_ALL
    || highlighted3DObject == highlightName;
  // eslint-disable-next-line no-null/no-null
  const groupRef = React.useRef<GroupType | null>(null);

  React.useLayoutEffect(() => {
    const group = groupRef.current;
    if (!active || !group || !register) { return; }
    return register(group, highlightName);
  }, [active, highlightName, register]);

  return <Group {...groupProps} name={`${highlightName}-highlight`}>
    <Group name={`${highlightName}-highlight-selection`} ref={groupRef}>
      {children}
    </Group>
  </Group>;
};
