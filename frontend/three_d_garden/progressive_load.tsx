import React from "react";
import { animated, useSpring } from "@react-spring/three";
import { Group } from "./components";

const AnimatedGroup = animated(Group);

const loadInConfig = {
  tension: 220,
  friction: 26,
};

interface LoadInGroupProps {
  name: string;
  children: React.ReactNode;
  delay?: number;
  fromPosition?: [number, number, number];
  toPosition?: [number, number, number];
  fromScale?: number | [number, number, number];
  toScale?: number | [number, number, number];
}

export const LoadInGroup = (props: LoadInGroupProps) => {
  const { position, scale } = useSpring({
    from: {
      position: props.fromPosition || [0, 0, 0],
      scale: props.fromScale || 1,
    },
    to: {
      position: props.toPosition || [0, 0, 0],
      scale: props.toScale || 1,
    },
    delay: props.delay,
    config: loadInConfig,
  });

  return <AnimatedGroup
    name={props.name}
    position={position as unknown as [number, number, number]}
    scale={scale}>
    {props.children}
  </AnimatedGroup>;
};

interface PopInGroupProps {
  name: string;
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}

export const PopInGroup = (props: PopInGroupProps) =>
  <LoadInGroup
    name={props.name}
    delay={props.delay}
    fromPosition={[0, 0, -(props.distance || 300)]}
    fromScale={[0.96, 0.96, 0.05]}
    toScale={[1, 1, 1]}>
    {props.children}
  </LoadInGroup>;

interface FallInGroupProps {
  name: string;
  children: React.ReactNode;
  delay?: number;
  distance?: number;
}

export const FallInGroup = (props: FallInGroupProps) =>
  <LoadInGroup
    name={props.name}
    delay={props.delay}
    fromPosition={[0, 0, props.distance || 3000]}
    fromScale={1.02}
    toScale={1}>
    {props.children}
  </LoadInGroup>;

interface GridRevealGroupProps {
  name: string;
  children: React.ReactNode;
  delay?: number;
}

export const GridRevealGroup = (props: GridRevealGroupProps) =>
  <LoadInGroup
    name={props.name}
    delay={props.delay}
    fromScale={[0.001, 0.001, 1]}
    toScale={[1, 1, 1]}>
    {props.children}
  </LoadInGroup>;
