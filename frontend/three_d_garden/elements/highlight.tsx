import React from "react";
import { type ThreeElements, useFrame, useThree } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
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
import { RenderOrder } from "../constants";
import { Text } from "./text";

const EDGE_STRENGTH = 5;
const EDGE_GLOW = 1;
const EDGE_THICKNESS = 3;
const DEFAULT_LABEL_POSITION: [number, number, number] = [0, 0, 0];
export const HIGHLIGHT_ALL = "all";

type RegisterHighlight = (object: Object3D) => () => void;

interface HighlightContextValue {
  highlighted3DObject: string | undefined;
  register: RegisterHighlight;
}

const HighlightContext = React.createContext<HighlightContextValue>({
  highlighted3DObject: undefined,
  register: () => () => undefined,
});

interface HighlightRendererProps {
  objects: Object3D[];
}

const HighlightRenderer = (props: HighlightRendererProps) => {
  const { gl, scene, camera, size } = useThree();
  const { composer, outlinePass } = React.useMemo(() => {
    const nextComposer = new EffectComposer(gl);
    const nextOutlinePass = new OutlinePass(
      new Vector2(size.width, size.height), scene, camera, props.objects,
    );
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
    };
  }, [camera, gl, props.objects, scene, size.height, size.width]);

  React.useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size.height, size.width]);

  React.useEffect(() => () => {
    outlinePass.dispose();
    composer.dispose();
  }, [composer, outlinePass]);

  useFrame((_state, delta) => composer.render(delta), 1);
  return <></>;
};

export interface HighlightProviderProps {
  children: React.ReactNode;
  highlighted3DObject?: string;
}

export const HighlightProvider = (props: HighlightProviderProps) => {
  const [objects, setObjects] = React.useState<Object3D[]>([]);
  const register = React.useCallback<RegisterHighlight>(object => {
    setObjects(current => [...current, object]);
    return () => setObjects(current =>
      current.filter(currentObject => currentObject !== object));
  }, []);
  const value = React.useMemo<HighlightContextValue>(() => ({
    highlighted3DObject: props.highlighted3DObject,
    register,
  }), [props.highlighted3DObject, register]);
  return <HighlightContext.Provider value={value}>
    {props.children}
    {objects.length > 0 && <HighlightRenderer objects={objects} />}
  </HighlightContext.Provider>;
};

export interface HighlightProps
  extends Omit<ThreeElements["group"], "ref" | "name"> {
  highlightName: string;
  label?: React.ReactNode;
  labelPosition?: [number, number, number];
}

export const Highlight = (props: HighlightProps) => {
  const {
    children, highlightName, label,
    labelPosition = DEFAULT_LABEL_POSITION, ...groupProps
  } = props;
  const { highlighted3DObject, register } = React.useContext(HighlightContext);
  const active = highlighted3DObject == HIGHLIGHT_ALL
    || highlighted3DObject == highlightName;
  // eslint-disable-next-line no-null/no-null
  const groupRef = React.useRef<GroupType | null>(null);

  React.useLayoutEffect(() => {
    const group = groupRef.current;
    if (!active || !group) { return; }
    return register(group);
  }, [active, register]);

  return <Group {...groupProps} name={`${highlightName}-highlight`}>
    <Group name={`${highlightName}-highlight-selection`} ref={groupRef}>
      {children}
    </Group>
    {active && label &&
      <Billboard name={`${highlightName}-label`}
        follow={true}
        position={labelPosition}>
        <Text
          name={`${highlightName}-label-text`}
          fontSize={64}
          color={"white"}
          depthTest={false}
          renderOrder={RenderOrder.clouds + 1}
          position={[0, 0, 0]}
          rotation={[0, 0, 0]}>
          {label}
        </Text>
      </Billboard>}
  </Group>;
};
