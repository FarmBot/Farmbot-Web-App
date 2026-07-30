# 3D FarmBot architecture

The FarmBot scene follows the machine's kinematic hierarchy. Rigid geometry
belongs to the narrowest frame that completely owns its motion:

```text
bot-machine
└── bot-gantry (X)
    └── bot-cross-slide (Y)
        └── bot-z-axis (Z)
```

`bot-static`, `bot-routing`, and `bot-effects` are siblings of the rigid
machine hierarchy. Stationary hardware remains in the FarmBot domain rather
than the generic bed domain.

## Module responsibilities

- `bot.tsx` composes frames, feature gates, providers, and shape loading.
- `assemblies/` owns physical subassemblies and uses local coordinates.
- `parts/` contains reusable GLTF and geometry leaf renderers.
- `bot_versions.ts` is the source of version-specific assets, dimensions, and
  capabilities. Components must not branch on the raw kit-version string.
- `kinematics.ts` is the source of frame positions and semantic world anchors.
  Rendering, effects, selection, and focus UI must consume the same anchors.
- `belts.tsx`, cable carriers, and flexible tubes are routing systems. Their
  path builders remain pure and their renderers update only for relevant axes.

Kinematic frames are axis-aligned translation groups. Model-specific rotation
and scale belong in leaf adapters so a GLTF coordinate system cannot rotate a
child machine frame.

All authored positions are millimeters. Leaf adapters apply the 1000x GLTF
unit-conversion scale to geometry-bearing meshes before placing them;
composite part groups must never carry that scale.

When adding hardware, choose its owner by motion: never moves (`static`), X
only (`gantry`), X/Y (`cross-slide`), or X/Y/Z (`z-axis`). Anything spanning
multiple owners belongs in routing; transient visualization belongs in
effects.
