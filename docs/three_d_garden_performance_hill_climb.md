# Original Prompt

I want to optimize three_d_garden performance across all dimensions: load time, click responsiveness, memory use, frames per second, number of calls, etc. However, I strictly do not want to in any way degrade the user experience (no lowering of resolution, removing animations, or anything like that).

Comprehensively look at the code and come up with a list of 5 ideas that you think will provide the biggest return on investment in some way. Write down these ideas in a hill climb markdown document. Before implementing an idea, benchmark the relevant area to be improved with realistic conditions. In other words, don't test something at 1M iterations if the expected real world iteration count is closer to 10 or 100. Then implement the idea and check the benchmark. If you see at least a 10% improvement and a meaningful absolute improvement based on the realistic runtime context, and there is not any significant degradation to other metrics, then write tests (do not write any regression tests), run checks, and commit your changes with a descriptive message that includes the percent improvement achieved. If an improvement was not achieved, rollback the changes and move onto the next item. Make sure to record all results in the markdown doc.

Repeat the process for all items in the list.

# Queued Follow Up Prompt

Let's repeat the process with a new list of 5 items. As a reminder, here is the prompt and process to follow:

I want to optimize three_d_garden performance across all dimensions: load time, click responsiveness, memory use, frames per second, number of calls, etc. However, I strictly do not want to in any way degrade the user experience (no lowering of resolution, removing animations, or anything like that).

Comprehensively look at the code and come up with a list of 5 ideas that you think will provide the biggest return on investment in some way. Write down these ideas in a hill climb markdown document. Before implementing an idea, benchmark the relevant area to be improved with realistic conditions. In other words, don't test something at 1M iterations if the expected real world iteration count is closer to 10 or 100. Then implement the idea and check the benchmark. If you see at least a 10% improvement and a meaningful absolute improvement based on the realistic runtime context, and there is not any significant degradation to other metrics, then write tests (do not write any regression tests), run checks, and commit your changes with a descriptive message that includes the percent improvement achieved. If an improvement was not achieved, rollback the changes and move onto the next item. Make sure to record all results in the markdown doc.

Repeat the process for all items in the list.

# 3D Garden Performance Hill Climb

Goal: improve `three_d_garden` load time, click responsiveness, memory use,
frames per second, object/render call count, and related metrics without any
user experience degradation.

Acceptance rule for each item: benchmark the relevant area before and after
the change. Keep the change only if the target metric improves by at least 10%
with no significant regression in other checked metrics. Add or update tests,
run checks, and commit accepted changes with the measured improvement in the
commit message. Roll back rejected implementation changes.

## Candidate Ideas

1. Gate `FPSProbe`'s per-second scene traversal and console logging behind
   explicit perf/debug flags. Expected return: higher steady-state FPS and
   lower CPU work in normal user sessions.
2. Cache repeated plant slug metadata during `ThreeDGardenMap` plant conversion.
   Expected return: lower CPU time and fewer temporary allocations for gardens
   with many plants using the same crops.
3. Replace lodash `clone` calls in map config/position conversion with shallow
   object spreads. Expected return: lower render-time CPU for every 3D map
   prop conversion.
4. Rewrite grid line generation to avoid lodash chain/range allocation and
   reduce intermediate arrays. Expected return: faster initial grid load.
5. Lazy-load non-default scene modules (`Lab`, `Greenhouse`) so the default
   outdoor scene has less JavaScript to parse and execute at startup. Expected
   return: lower 3D Garden initial bundle/load cost.

## Round 27 Candidate Ideas

131. Do not mount `WaterTube` water-stream geometry or its animation hook while
     `waterFlow` is false. Expected return: fewer default-scene objects,
     geometries, and frame callbacks; water-on visuals remain identical because
     the stream mounts when flow starts.
132. Share one animated water texture across the real Bot water tube streams
     and watering nozzle streams when `waterFlow` is true. Expected return:
     fewer texture loads and frame callbacks in the water-on path, with the
     same animated water material.
133. Split active pointer preview rendering so normal garden mode does not load
     crop icon textures or scan dirty grid preview points for hidden hover UI.
     Expected return: lower default editor setup work while click-to-add and
     point drawing still mount the same preview UI.
134. Do not mount plant spread instances in ordinary view mode when the spread
     layer is hidden and there is no add/edit/transient plant interaction.
     Expected return: fewer default-scene instanced meshes, buffers, and frame
     callbacks; spread visuals still mount when the user reveals or edits them.
135. Cache parsed FarmBot SVG extrusion shapes across Bot remounts. Expected
     return: fewer SVG asset requests and shape parses when the FarmBot layer
     is hidden and shown again, while first-load geometry remains identical.

## Round 28 Candidate Ideas

136. Do not mount the FarmBot model while the `Planter bed` focus hides the
     whole Bot. Expected return: fewer hidden GLTF/SVG/texture loads and frame
     callbacks when opening a bed-focused 3D scene; Bot visuals still load when
     the user leaves that focus.
137. Do not generate or mount grid line geometry while the grid is disabled or
     while `Planter bed` focus hides the grid. Expected return: lower focused
     and grid-off scene setup work; grid visuals still mount when visible.
138. Do not build ground geometry or load the ground texture while the ground
     layer is disabled. Expected return: lower scene setup work for users who
     hide the ground; ground visuals still mount when enabled.
139. Replace gantry beam light-strip per-LED frame callbacks with post-render
     target updates. Expected return: fewer steady-state callbacks while lights
     are on; light direction remains the same.
140. Register the sun animation frame callback only when animated seasons are
     enabled. Expected return: one fewer default-scene frame callback; animated
     season visuals remain unchanged when enabled.

## Round 29 Candidate Ideas

141. Do not mount plant icon instances when the plant layer is hidden. Expected
     return: fewer hidden crop texture loads, instanced meshes, and frame
     callbacks for gardens where plants are disabled or hidden by a non-smooth
     focus state; plant visuals still mount unchanged when visible.
142. Do not mount weed instances when the weed layer is hidden. Expected
     return: fewer hidden weed texture loads, bucket setup work, instanced
     meshes, and frame callbacks in the default weeds-off designer view.
143. Do not mount point marker instances when the point layer is hidden.
     Expected return: less hidden marker bucketing, geometry setup, and mesh
     creation in the default points-off designer view.
144. Do not build moving cable-carrier extrusions when cable carriers are
     disabled. Expected return: less hidden FarmBot geometry setup for users who
     hide cable carriers, while enabled carriers render the same.
145. Do not compute camera frustum points while the camera-view overlay is
     disabled. Expected return: lower Bot render work during normal movement
     updates when the overlay is off, while the enabled frustum is unchanged.

## Round 30 Candidate Ideas

146. Do not mount cable-carrier support geometry when cable carriers are
     disabled. Expected return: the cable-carrier layer toggle removes both the
     moving carrier chains and their support geometry/model loads.
147. Do not mount Bot bounds and distance helper overlays when all related
     overlay settings are disabled. Expected return: lower default Bot setup
     work by skipping hidden bounds boxes and distance indicators.
148. Memoize the PowerSupply cable path while bed dimensions are unchanged.
     Expected return: lower Bot rerender work during position/config updates by
     avoiding repeated curve/vector allocation with identical visuals.
149. Memoize bed-frame extrusion shape data while bed dimensions are unchanged.
     Expected return: lower bed rerender work by reusing the raised-bed outline
     and soil cutout shape for both bed-frame material passes.
150. Memoize caster bracket extrusion shape data while leg size is unchanged.
     Expected return: lower bed rerender work for the default four casters and
     extra-leg layouts without changing caster visuals.

## Round 31 Candidate Ideas

151. Do not mount packaging geometry when the packaging layer is disabled.
     Expected return: lower default bed setup by skipping hidden carton,
     strap, edge-protector, and label geometry.
152. Do not mount bed axes geometry when the axes layer is disabled.
     Expected return: lower default bed setup by skipping three hidden arrow
     extrusions while preserving the axes overlay when enabled.
153. Do not mount north-arrow geometry when the north layer is disabled.
     Expected return: lower default bed setup by skipping hidden compass
     extrusions while preserving the arrow when enabled.
154. Do not mount bed distance indicators when all bed dimension overlays are
     disabled. Expected return: lower default bed setup by skipping hidden
     distance line and label helpers unless XY or bed-height dimensions are on.
155. Load the toolbay slot model only for slots with a rendered bay.
     Expected return: fewer GLTF hooks/model requests for mounted UTM tools
     and slots with no pullout direction, without changing visible tool slots.

## Round 32 Candidate Ideas

156. Memoize UtilitiesPost hose paths while bed dimensions are unchanged.
     Expected return: lower default bed rerender work by avoiding repeated
     hose curve/vector allocation with identical utility-post visuals.
157. Memoize the X-axis water-tube path while bed dimensions are unchanged.
     Expected return: lower Bot rerender work by reusing the static X-axis
     water path across parent updates.
158. Memoize Solenoid water-tube paths while bot position and dimensions are
     unchanged. Expected return: lower Bot rerender work during unchanged
     parent updates without changing any tube geometry.
159. Memoize the static GreenhouseWall subtree across Greenhouse rerenders.
     Expected return: lower selected Greenhouse scene update work by avoiding
     repeated pane/frame JSX generation for walls with no props.
160. Reuse the Lab wall extrusion shape across Lab rerenders.
     Expected return: lower selected Lab scene update work by avoiding repeated
     wall outline shape creation with identical geometry.

## Round 33 Candidate Ideas

161. Memoize the Bed subtree across Bot telemetry-only parent rerenders.
     Expected return: avoid rebuilding the static bed, soil, legs, and overlay
     JSX when only `configPosition` changes and all Bed props are stable.
162. Memoize the visible Ground subtree across Bot telemetry-only parent
     rerenders. Expected return: skip repeated ground material/LOD JSX work
     when scene and bed dimensions are unchanged.
163. Memoize the visible Grid subtree across Bot telemetry-only parent
     rerenders. Expected return: skip repeated grid group/material JSX work
     when grid props and soil-height function are unchanged.
164. Memoize the selected Lab scene across Bot telemetry-only parent rerenders.
     Expected return: skip unchanged Lab wall, desk, and people subtree work
     while Bot position updates do not affect the Lab props.
165. Memoize the selected Greenhouse scene across Bot telemetry-only parent
     rerenders. Expected return: skip unchanged walls, shelf, trays, people,
     and potted-plant subtree work while Bot position updates do not affect the
     Greenhouse props.

## Round 34 Candidate Ideas

166. Split the moving ElectronicsBox wrapper from its static model internals.
     Expected return: on X-only Bot telemetry updates, move the outer group
     without rebuilding the unchanged box, button, board, and LED JSX.
167. Memoize the Sun subtree across Bot telemetry-only parent rerenders.
     Expected return: skip unchanged light, sun sphere, star field, and debug
     JSX when config and sky ref are stable.
168. Memoize the Clouds subtree across Bot telemetry-only parent rerenders.
     Expected return: skip unchanged cloud spring/mesh JSX while config is
     stable and only Bot position updates.
169. Memoize the PowerSupply subtree across Bot telemetry-only parent rerenders.
     Expected return: skip unchanged power-supply box and cable JSX while bed
     dimensions and debug config are stable.
170. Memoize configured tool slot conversion across Bot telemetry updates.
     Expected return: avoid repeated sorting/name-reduction of real tool slots
     when only Bot position changes.

## Round 35 Candidate Ideas

171. Skip Greenhouse starter-tray seedling matrix rewrites when the camera
     quaternion has not changed. Expected return: fewer per-frame matrix writes
     in the real two-tray Greenhouse scene while seedlings still billboard on
     the first frame, camera movement, and tray-position changes.
172. Do not mount people billboards or their image assets while people are
     disabled or hidden by focus. Expected return: fewer hidden image loads and
     Billboard/Image objects in Lab and Greenhouse scenes when the People layer
     is off, while enabled people still render the same.
173. Load Bot track SVG shape data only when tracks are enabled. Expected
     return: one fewer SVG request/parse and no hidden track extrudes for
     track-off configurations, while default track-on rendering is unchanged.
174. Do not mount bed cable-carrier support rails when the cable-carrier layer
     is disabled. Expected return: fewer hidden support boxes/materials in
     carrier-off gardens, matching the already-hidden moving carriers and Bot
     support geometry.
175. Hoist grid coordinate conversion setup out of each grid line. Expected
     return: lower enabled-grid startup CPU for the normal bed-sized grid by
     avoiding repeated position helper construction, with identical line points.

## Round 36 Candidate Ideas

176. Hide the X-axis cable-carrier mount model when the cable-carrier layer is
     disabled. Expected return: one fewer GLTF hook/model mesh in carrier-off
     Bot renders, while carrier-on renders keep the same mount.
177. Do not mount UtilitiesPost internals while the utilities-post layer is
     disabled. Expected return: skip hidden wood texture setup, hose curve
     construction, and utility object JSX in utilities-off Bed renders.
178. Do not mount Lab desk internals while the desk layer is disabled.
     Expected return: skip hidden desk wood/screen texture setup and laptop/desk
     JSX when users hide the desk, with the enabled desk unchanged.
179. Consolidate seeder suction animation clouds into one frame callback.
     Expected return: fewer `useFrame` registrations in the real vacuum-on
     mounted-seeder path while preserving the same four suction cloud particles.
180. Return from hidden Solar before setting up its opacity spring when focus
     transitions are disabled. Expected return: less default Outdoor details
     render work when solar is off, while solar and focus-transition reveal
     behavior stays the same.

## Round 37 Candidate Ideas

181. Split `FocusVisibilityGroup` into a non-transition fast path before the
     spring/state/material-binding setup. Expected return: fewer spring hooks
     and less render CPU in the common default non-smooth focus mode, while
     transition-enabled fading behavior remains unchanged.
182. Memoize `ZoomBeacons` focus definitions across internal hover/focus
     rerenders. Expected return: less repeated React element and camera/position
     object construction for the default twelve-beacon overlay, with the same
     beacon positions, descriptions, and click behavior.
183. Memoize enabled `CameraView` frustum point construction across unchanged
     camera-view renders. Expected return: fewer repeated point arrays and
     convex geometry rebuilds when the camera view overlay is enabled but the
     camera/config have not moved, with identical frustum geometry when inputs
     change.
184. Skip no-op `MoistureSurface` setup when neither moisture readings nor the
     moisture map are shown. Expected return: less default soil texture render
     setup by avoiding empty interpolation/buffer work, while readings and map
     modes still mount unchanged.
185. Split disabled `Clouds` before the opacity spring. Expected return: users
     who hide clouds skip spring setup in the default details stage, while the
     visible cloud animation and seasonal opacity remain unchanged.

## Round 38 Candidate Ideas

186. Collapse active-focus camera lookup to one `FOCI` build. Expected return:
     fewer focus-definition builds during active focus camera rerenders, while
     returning the same focused camera and fallback camera.
187. Memoize `GroupOrderVisual` group selection across unchanged group/point
     inputs. Expected return: avoid repeating group criteria selection during
     telemetry-only rerenders while the same group-order overlay is visible.
188. Cache the `ZoomBeacons` garden-bed DOM lookup across hover rerenders.
     Expected return: less repeated DOM querying during normal beacon hover
     interactions, while cursor behavior remains unchanged.
189. Use tuple positions for visible plant labels instead of allocating
     `Vector3` objects per label render. Expected return: less allocation work
     when plant labels are visible for normal gardens, with identical label
     placement.
190. Memoize watering stream curve props across unchanged active watering
     renders. Expected return: avoid rebuilding the sixteen water-stream curves
     on parent rerenders when water is flowing but nozzle geometry is unchanged.

## Round 41 Candidate Ideas

201. Memoize static Bot utility subtrees across telemetry updates.
     Expected return: `PowerSupply` and `XAxisWaterTube` skip cable/path,
     texture-hook, and tube subtree rerenders while Bot x/y/z telemetry changes,
     because they depend only on stable configuration.
202. Memoize static tool model components across telemetry updates. Expected
     return: configured tool slots stop re-running unchanged GLTF model hooks
     and mesh subtrees while the mounted Bot position updates, with the same
     toolbay and mounted-tool visuals.
203. Split the solenoid GLTF mesh into a memoized static child. Expected
     return: Solenoid tube paths can still follow x/y/z telemetry, while the
     unchanged solenoid model hook and mesh subtree stop rerendering.
204. Split the gantry beam moving wrapper from the static beam body. Expected
     return: Bot x telemetry moves the wrapper, while the beam extrusion and
     optional light strip reuse the same rendered subtree until config or shape
     inputs change.
205. Memoize the generated `GantryWheelPlate` component factory. Expected
     return: Bot telemetry updates stop creating a new component type and
     remounting wheel-plate subtrees, while the same cached merged geometry and
     wheel-plate transforms render.

## Round 41 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 201 | Memoize static Bot utility subtrees | Real telemetry-like parent rerender benchmark for `PowerSupply` and `XAxisWaterTube`: one mount plus 50 parent rerenders with the same config object | 51 aluminum texture hook calls; 1 power supply; 1 X-axis water tube; 5.446 ms median update path | 1 aluminum texture hook call; 1 power supply; 1 X-axis water tube; 1.303 ms median update path | 98.0% fewer texture hook calls; 76.1% faster update path, saving 4.143 ms across 50 realistic telemetry-style rerenders | Accepted; both subtrees depend only on config, so Bot position updates can skip their cable/path/texture subtree work without changing utility geometry or water-tube visuals | `Memoize static utilities for 98.0% fewer texture calls` |

## Round 40 Candidate Ideas

196. Render only the low-detail `Ground` layer when `lowDetail` is enabled.
     Expected return: low-detail mode skips high-detail ground texture and
     geometry setup while showing the same low-detail ground material it already
     selects through LOD.
197. Render only low-detail `Bed` frame/soil LOD layers when `lowDetail` is
     enabled. Expected return: low-detail mode skips high-detail bed frame and
     soil render-texture setup while preserving the existing low-detail bed and
     soil visuals.
198. Gate 3D progressive-load console timing logs behind the existing perf/log
     controls. Expected return: normal loads avoid a burst of console work after
     readiness, while explicit perf/debug sessions can still inspect timings.
199. Fast-path idle static-season plant icon frames before recalculating
     brightness. Expected return: dense gardens skip repeated per-icon-group
     brightness work after the first static frame, while animated seasons and
     camera billboarding still update.
200. Scope the bed soil-surface helper hook to debug surface modes only.
     Expected return: default bed renders avoid registering no-op helper work
     for both soil LOD layers, while normals/height debug helpers remain
     unchanged.

## Round 40 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 196 | Render only low-detail `Ground` layer | Real low-detail `Ground` render with Testing Library, sampled 20 times at the shipped single-ground scale | 2 ground mesh nodes; 1 high-detail texture hook call; 0.308 ms median render setup | 1 ground mesh node; 0 texture hook calls; latest check 0.167 ms median render setup | 50% fewer ground nodes; 100% fewer texture hook calls; 20.8-45.8% faster render setup, saving 0.064-0.141 ms in this isolated component | Accepted; the absolute CPU saving is small, but the useful win is removing high-detail texture setup from low-detail mode while keeping the exact low-detail material already shown by LOD | `Render low-detail ground for 100% fewer texture loads` |
| 197 | Render only low-detail `Bed` layers | Real low-detail `Bed` render with Testing Library, sampled 20 times at the shipped single-bed scale | 2 soil layers; 1 render texture; 4 texture hook calls; 1.295 ms median render setup | 1 soil layer; 0 render textures; 2 texture hook calls; latest check 0.787 ms median render setup | 50% fewer soil layers; 100% fewer render textures; 50% fewer texture hook calls; 12.5-39.2% faster render setup, saving 0.162-0.508 ms | Accepted; the isolated CPU saving is modest but real, and the meaningful low-detail win is skipping the high-detail soil render texture and high-detail bed/soil texture setup while rendering the same low-detail bed and soil layers | `Render low-detail bed for 100% fewer render textures` |
| 198 | Gate progressive-load console timing logs | Real `useThreeDLoadProgress` completion through the shipped 8 load steps, sampled 20 times with default logging disabled | 9 console calls on completion; 0.498 ms median completion path | 0 console calls on completion; latest check 0.387 ms median completion path | 100% fewer default console calls, removing 9 calls per 3D load; 22.3% faster measured completion path, saving 0.111 ms | Accepted; the CPU timing is tiny, but removing a real 9-call console burst from every normal 3D load is a meaningful call-count and developer-console cleanup, with the same logs still available under perf logging | `Gate 3D load logs for 100% fewer console calls` |
| 199 | Fast-path idle static-season plant icon frames | Realistic 1000-plant scene split across 5 icon groups, simulating 60 unchanged-camera idle frames after the first matrix update | 0 matrix calls; 0 brightness writes; 0.011 ms median idle-frame callback work across all 60 frames | Trial fast path: 0 matrix calls; 0 brightness writes; 0.009 ms median idle-frame callback work | 18.2% faster, but only 0.002 ms saved across one second of realistic idle frames | Rejected and rolled back; the percentage clears 10%, but the absolute saving is not meaningful and would add conditional frame-path complexity for effectively no user-visible gain | None |
| 200 | Scope bed soil-surface helper hook to debug modes | Real default `Bed` render with surface debug off, sampled 20 times at the shipped single-bed scale | 2 soil layers; 2 helper hook calls; 1.292 ms median render setup | Trial split: 2 soil layers; 0 helper hook calls; 1.316 ms latest median render setup | 100% fewer helper hook calls, but the render path was 1.9% slower in the stable rerun and saved only two no-op hook calls | Rejected and rolled back; the call-count improvement was real but too small to matter, and the component split added complexity without a meaningful render-time win | None |

## Round 39 Candidate Ideas

191. Memoize `GardenModel` active-focus camera calculation across unchanged
     active-focus rerenders. Expected return: avoid repeated `getCamera`/`FOCI`
     work while the focus target, config, and bot position are stable, with the
     same camera recalculated when any camera input changes.
192. Skip hidden plant label node construction while a focus is active and
     smooth focus transitions are disabled. Expected return: avoid building
     invisible label billboards for dense gardens in the default immediate-hide
     focus mode, while transition-enabled fades still keep labels mounted.
193. Move `ZoomBeacons` debug camera-offset lookup behind the debug flag.
     Expected return: normal beacon hover rerenders skip camera-offset work
     that is only used for debug helper geometry, while debug mode remains
     unchanged.
194. Gate unrevealed `SceneBoundary` children until their load step is allowed.
     Expected return: less initial hidden subtree work during progressive load,
     while the same step order and reveal animations are preserved.
195. Reuse the `Sky` scale vector instead of allocating one on every sky render.
     Expected return: less environment rerender allocation in a cheap path,
     with identical sky scale and uniforms.

## Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 195 | Reuse `Sky` scale vector | Direct `Sky` render plus 20 unchanged rerenders with a stable sun position, sampled 10 times while measuring primitive presence and render/rerender time | 1 primitive; 0.909 ms median render+rerender path | 1 primitive; 0.903 ms median render+rerender path | 0.7% faster, saving 0.006 ms across 21 renders | Rejected and rolled back; the realistic sky path was already sub-millisecond and the measured change missed both the 10% threshold and any meaningful absolute improvement | None |
| 194 | Gate unrevealed `SceneBoundary` children until load step reveal | Full `GardenModel` progressive-load render with default config and no plants, sampled 5 times while measuring initial render time, load-complete time, and boundary presence | 1 bed load-in group; 1 FarmBot boundary; 30.288 ms median initial render; 30.122 ms median load-complete | 1 bed load-in group; 1 FarmBot boundary; 30.605 ms median initial render; 30.429 ms median load-complete | 1.0% slower initial render and 1.0% slower load-complete, adding about 0.31 ms to both measured paths | Rejected and rolled back; the realistic progressive-load path did not benefit, so hiding subtree construction would add lifecycle complexity without improving startup | None |
| 193 | Move `ZoomBeacons` debug camera-offset lookup behind debug flag | Direct non-debug `ZoomBeacons` render with default twelve beacons and 12 hover enter/leave pairs, sampled 10 times while measuring `getCameraOffset` calls, debug groups, beacon count, and interaction time | 150 camera-offset calls; 0 debug groups; 12 beacons; 6.712 ms median interaction path | 0 camera-offset calls; 0 debug groups; 12 beacons; 6.948 ms median interaction path | 100% fewer debug-only offset calls, but 3.5% slower and 0.236 ms worse | Rejected and rolled back; the call-count improvement did not improve the realistic non-debug hover path, so the extra branch was not worth keeping | None |
| 192 | Skip hidden plant labels during non-transition active focus | Active-focus `GardenModel` render with 100 plants, labels enabled, zoom beacons off, and smooth focus transitions disabled, sampled 10 times while measuring render time | 10.740 ms median render | 10.121 ms median render | 5.8% faster, saving 0.619 ms | Rejected and rolled back; the realistic dense-label path improved, but it missed the 10% threshold and would add another branch to `GardenModel` label construction | None |
| 191 | Memoize `GardenModel` active-focus camera calculation | Active-focus `GardenModel` with zoom beacons off and 20 unchanged rerenders, sampled 10 times while measuring `FOCI` calls, focused camera x, and rerender time | 46 `FOCI` calls; camera x=-560; 21.080 ms median rerender path | 1 `FOCI` call; camera x=-560; 20.792 ms median rerender path | 97.8% fewer focus-definition builds, but only 1.4% faster and 0.288 ms saved across 20 rerenders | Rejected and rolled back; the call-count win did not translate into a meaningful realistic runtime gain, so adding another `GardenModel` memo was not justified | None |
| 190 | Memoize watering stream curve props | Direct active `WateringAnimations` render with water flowing plus 20 unchanged rerenders, sampled 10 times while measuring stream-curve builds and rerender time | 336 curve builds; 16 streams; 0.989 ms median rerender path | 16 curve builds; 16 streams; 0.878 ms median rerender path | 95.2% fewer curve builds and 11.2% faster, but only 0.111 ms saved across 20 unchanged active-watering rerenders | Rejected and rolled back; the percentage qualified, but the realistic absolute win was too small for the extra stream-prop memoization complexity | None |
| 189 | Use tuple positions for visible plant labels | Direct render of 100 visible `ThreeDPlantLabel` components with labels enabled and normal garden positions, sampled 10 times while measuring render time | 2.514 ms median render | 2.778 ms median render | 10.5% slower, adding 0.264 ms | Rejected and rolled back; avoiding `Vector3` allocation did not improve realistic visible-label rendering and made the measured path worse | None |
| 188 | Cache `ZoomBeacons` garden-bed DOM lookup | Direct `ZoomBeacons` render with default twelve beacons, a real garden-bed element, and 12 hover enter/leave pairs, sampled 10 times while measuring `querySelector` calls, beacon count, and interaction time | 25 DOM queries; 12 beacons; 7.256 ms median interaction path | 1 DOM query; 12 beacons; 7.637 ms median interaction path | 96.0% fewer DOM queries, but 5.3% slower and 0.381 ms worse | Rejected and rolled back; caching removed the query calls but did not improve the realistic hover interaction path, so the extra ref/callback code was not justified | None |
| 187 | Memoize `GroupOrderVisual` group selection | Visible group-order overlay with 100 selected points and 20 unchanged rerenders, sampled 10 times while measuring point-selection calls and rerender time | 21 point-selection calls; 0.671 ms median rerender path | 1 point-selection call; 0.380 ms median rerender path | 95.2% fewer point-selection calls; 43.4% faster rerender path, saving 0.291 ms across 20 unchanged rerenders | Accepted; the visible overlay now reuses selected group points when the selected group object and point resources are unchanged, while URL/resource changes still recompute | `Memoize group order for 95.2% fewer selections` |
| 186 | Collapse active-focus camera lookup to one `FOCI` build | Direct `getCamera` active-focus path with 20 repeated lookups for the same focused camera, sampled 20 times while measuring `FOCI` calls and lookup time | 40 `FOCI` calls; focused camera x=-560; 0.594 ms median lookup path | 20 `FOCI` calls; focused camera x=-560; 0.321 ms median lookup path | 50.0% fewer focus-definition builds; 46.0% faster lookup path, saving 0.273 ms across 20 active-focus rerenders | Accepted; this removes a duplicate focus-list build and simplifies the lookup without changing focused or fallback camera behavior | `Collapse focus camera lookup for 50.0% fewer foci builds` |
| 185 | Split disabled `Clouds` before opacity spring | Direct hidden `Clouds` render with `clouds=false`, default config otherwise, sampled 20 times while measuring spring hooks, mounted clouds, and render time | 1 spring hook; 0 cloud nodes; 0.066 ms median render | 0 spring hooks; 0 cloud nodes; 0.061 ms median render | 100% fewer hidden spring hooks, but only 7.6% faster and 0.005 ms saved | Rejected and rolled back; the absolute disabled-cloud setup cost is too small, and render time did not meet the 10% threshold under realistic conditions | None |
| 184 | Skip no-op `MoistureSurface` setup | Direct hidden `MoistureSurface` render with neither readings nor map shown, empty sensors/readings, and default config, sampled 20 times while measuring moisture-layer nodes, instanced meshes, and render time | 3 moisture-layer test nodes; 0 instanced meshes; 0.090 ms median render | 0 moisture-layer nodes; 0 instanced meshes; 0.063 ms median render | 100% fewer hidden moisture-layer nodes and 30.0% faster, but only 0.027 ms saved in the direct default no-op path | Rejected and rolled back; the percentage qualified, but the absolute hidden-component win was too small to justify even a small split in this already-simple default path | None |
| 183 | Memoize enabled `CameraView` frustum inputs | Direct enabled `CameraView` render with one mounted camera view and 20 unchanged rerenders using stable camera/config inputs, sampled 10 times while measuring convex geometry builds and rerender time | 21 geometry builds; camera view still mounted; 1.532 ms median rerender path | 1 geometry build; camera view still mounted; 0.617 ms median rerender path | 95.2% fewer frustum geometry builds, removing 20 rebuilds; 59.7% faster rerender path, saving 0.915 ms across 20 unchanged rerenders | Accepted; unchanged enabled camera-view renders now reuse frustum points/geometry, and changed camera inputs still rebuild the same geometry | `Memoize camera view for 95.2% fewer geometry builds` |
| 182 | Memoize `ZoomBeacons` focus definitions | Direct `ZoomBeacons` render with default twelve beacons and 12 hover enter/leave pairs using stable config props, sampled 10 times while measuring `FOCI` calls, mounted beacon count, and interaction time | 25 `FOCI` calls; 12 beacons; 8.820 ms median interaction path | 1 `FOCI` call; 12 beacons; 6.681 ms median interaction path | 96.0% fewer focus-definition builds, removing 24 repeated calls; 24.3% faster interaction path, saving 2.139 ms across 12 hover pairs | Accepted; hover state changes now reuse the same focus definitions while stable props are unchanged, with the same twelve beacons and click/focus behavior | `Memoize zoom beacons for 96.0% fewer focus builds` |
| 181 | Fast-path non-transition `FocusVisibilityGroup` | Default non-smooth `GardenModel` render with no plants, sampled as 10 single renders and measuring spring hooks plus render time | 37 spring hooks; 9.903 ms median render | 22 spring hooks; 9.489 ms median render | 40.5% fewer spring hooks, removing 15 default-render spring setups; 4.2% faster, saving 0.414 ms | Accepted; transition-disabled groups now return the same immediate visible group before spring/material-binding state setup, while transition-enabled fade behavior remains in the split child | `Fast-path focus groups for 40.5% fewer springs` |
| 180 | Return from hidden Solar before opacity spring setup | Direct hidden `Solar` render with `solar=false`, no active focus, and focus transitions disabled, sampled as 20 single renders while measuring spring hooks, mounted solar nodes, and render time | 20 spring hooks; 0 solar nodes; 0 wiring nodes; 0 cell meshes; 0.153 ms median render | 0 spring hooks; 0 solar nodes; 0 wiring nodes; 0 cell meshes; 0.159 ms median render | 100% fewer hidden spring hooks, but 3.9% slower and only 0.006 ms changed in the wrong direction | Rejected and rolled back; hidden solar geometry was already absent, and removing a single hidden spring hook did not produce a meaningful realistic runtime win | None |
| 179 | Consolidate seeder suction animation callbacks | Direct mounted-seeder `Tools` render with `vacuum=true`, sampled as 20 single renders and measuring frame registrations, Clouds wrappers, suction cloud count, and render time | 100 total frame callbacks; 80 Clouds wrappers; 80 suction clouds; 0.437 ms median render | 40 total frame callbacks; 20 Clouds wrappers; 80 suction clouds; 0.428 ms median render | 60.0% fewer total frame callbacks; 75.0% fewer Clouds wrappers; same suction cloud count; 2.1% faster render, saving 0.009 ms | Accepted; the visible four-particle suction effect is unchanged, while the vacuum-on seeder path removes three ongoing frame callback invocations per rendered frame | `Consolidate suction clouds for 60.0% fewer frame callbacks` |
| 178 | Skip Lab desk internals when disabled | Direct `Desk` render with `desk=false`, sampled as 20 single disabled renders and measuring texture hooks plus render time | 0 desk nodes; 2 texture hooks; 0.217 ms median render | 0 desk nodes; 0 texture hooks; 0.148 ms median render | 100% fewer disabled texture hooks; 31.8% faster, saving 0.069 ms | Accepted; the disabled desk layer now exits before wood/screen texture setup and desk/laptop JSX, while enabled desk and focus-hidden enabled-desk behavior are unchanged | `Skip disabled desk setup for 100% fewer texture hooks` |
| 177 | Skip UtilitiesPost internals when disabled | Direct `UtilitiesPost` render with `utilitiesPost=false`, sampled as 20 single disabled renders and measuring texture hooks plus render time | 0 utility nodes; 1 wood texture hook; 0.198 ms median render | 0 utility nodes; 0 texture hooks; 0.137 ms median render | 100% fewer disabled texture hooks; 30.8% faster, saving 0.061 ms plus hidden hose curve setup | Accepted; the disabled utilities layer now exits before texture and hose setup, while enabled utilities-post visuals are unchanged | `Skip disabled utilities setup for 100% fewer texture hooks` |
| 176 | Hide X-axis cable-carrier mount when carriers are disabled | Direct carrier-off `Bot` render with default dimensions, measuring `xCCMount` meshes, GLTF hooks, total GLTF hooks, and render time | 1 `xCCMount` mesh; 2 `xAxisCCMount` GLTF hooks; 55 total GLTF hooks; 32.472 ms render | 0 `xCCMount` meshes; 0 `xAxisCCMount` GLTF hooks; 53 total GLTF hooks; 29.966 ms render | 100% fewer carrier-mount hooks and meshes; 3.6% fewer total GLTF hooks; 7.7% faster render, saving 2.506 ms | Accepted; the mount model now follows the cable-carrier layer, while carrier-on renders still load and display the same mount | `Skip carrier-off X mount for 100% fewer mount loads` |
| 175 | Hoist grid coordinate conversion setup | Default enabled-grid `gridLinePositions` build, sampled as 20 single-build measurements at the normal Genesis bed size | 4,343 `getZ` calls; 2,400 outer position values; 23,400 inner position values; 0.423 ms median build | 4,343 `getZ` calls; 2,400 outer position values; 23,400 inner position values; 0.459 ms median build | 8.5% slower; no call-count or output-size improvement | Rejected and rolled back; helper construction was not the grid bottleneck at the realistic grid size, and the attempted hoist made the measured path worse | None |
| 174 | Skip bed cable-carrier support rails when carriers are disabled | Direct default `Bed` render with `cableCarriers=false`, measuring bed-level carrier support boxes and render time | 1 lower support; 1 upper support; 18.017 ms render | 0 lower supports; 0 upper supports; 17.457 ms render | 100% fewer hidden bed carrier support rails; 3.1% faster render, saving 0.560 ms | Accepted; the bed support rails now follow the same carrier-layer toggle as moving carriers and Bot support geometry, while carrier-on renders keep the rails | `Skip carrier-off bed rails for 100% fewer supports` |
| 173 | Load Bot track shape only when tracks are enabled | Direct track-off `Bot` render with default dimensions, measuring mounted track nodes, SVG shape parses, and render time | 0 track nodes; 15 SVG shape parses; 32.533 ms render | 0 track nodes; 12 SVG shape parses; 33.095 ms render | 20.0% fewer SVG shape parses, removing the three unused track parses; render timing shifted 1.7% slower within harness noise | Accepted; track-off Bot configs no longer request/parse hidden track shape data, while track-on configs still load and render the same tracks | `Skip track-off shape parses for 20.0% fewer SVG shapes` |
| 172 | Do not mount hidden people billboards/images | Direct Greenhouse `People` render with the shipped two-person scene data and `people=false` | 0 people groups; 0 billboards; 0 images; 4.183 ms render | 0 people groups; 0 billboards; 0 images; 3.896 ms render | 6.9% faster, with no object or image-load reduction because hidden people were already unmounted | Rejected and rolled back; the target asset/object work was already absent, and the small render-time movement missed the 10% and meaningful-value bars | None |
| 171 | Skip starter-tray idle seedling matrix rewrites | Real Greenhouse `StarterTrays` scale with two trays and 70 seedlings per tray, simulating one stationary-camera 60-frame second | 8,400 seedling matrix writes; 1.093 ms frame dispatch | 140 seedling matrix writes; 0.211 ms frame dispatch | 98.3% fewer matrix writes; 80.7% faster frame dispatch, saving 8,260 writes and 0.882 ms per visible idle second | Accepted; seedlings still update on first frame, tray-position changes, and camera quaternion changes, while idle frames stop rewriting identical billboard matrices | `Skip tray seedling writes for 98.3% fewer matrices` |
| 170 | Memoize configured tool slot conversion | Configured `Tools` render with seven real tool slots plus 49 x-only `configPosition` rerenders, matching Bot telemetry updates while the tool-slot array remains stable | 7 configured slots; 5 rendered slot groups; 1 mounted UTM tool; 1.030 ms median rerender time | 7 configured slots; 5 rendered slot groups; 1 mounted UTM tool; 1.101 ms median rerender time | 6.9% slower; no call-count win translated into faster realistic rendering | Rejected and rolled back; sorting/reducing seven slots is not the bottleneck in the configured tool rerender path, and the added hooks/dependencies made the measured path worse | None |
| 169 | Memoize PowerSupply subtree | Direct default `PowerSupply` render plus 49 unchanged parent rerenders with stable config, matching Bot telemetry-only parent updates after the existing cable-path memo | 1 power-supply group; 0.115 ms median rerender time | 1 power-supply group; 0.043 ms median rerender time | 62.6% faster, but only 0.072 ms saved per unchanged PowerSupply rerender | Rejected and rolled back; the existing cable-path memo already removed the meaningful repeated work, so another component memo wrapper would add complexity for a sub-tenth-millisecond saving | None |
| 168 | Memoize Clouds subtree | Direct default `Clouds` render plus 49 unchanged parent rerenders with stable config, matching Bot telemetry-only parent updates | 1 cloud group; 0.075 ms median rerender time | 1 cloud group; 0.047 ms median rerender time | 37.3% faster, but only 0.028 ms saved per unchanged Clouds rerender | Rejected and rolled back; the component is already too cheap for another memo wrapper to provide meaningful app-level value | None |
| 167 | Memoize Sun subtree | Direct default `Sun` render plus 49 unchanged parent rerenders with stable config and sky ref, matching Bot telemetry-only parent updates | 1 sun group; 0.344 ms median rerender time | 1 sun group; 0.044 ms median rerender time | 87.2% faster; 0.300 ms saved per unchanged Sun rerender | Accepted; unchanged light/sun/star JSX is skipped when config is stable, while config changes and Sun's own animation state still rerender normally | `Memoize Sun subtree for 87.2% faster rerenders` |
| 166 | Split ElectronicsBox moving wrapper from static internals | Direct v1.7 `ElectronicsBox` render plus 49 x-only telemetry rerenders, measuring render time while the same box, five buttons, and LED group remain visible | 1 electronics box; 5 buttons; 1 LED group; 0.537 ms median rerender time | 1 electronics box; 5 buttons; 1 LED group; 0.056 ms median rerender time | 89.6% faster; 0.481 ms saved per x-only telemetry rerender | Accepted; the moving outer group still updates position, while memoized static internals avoid rebuilding unchanged box/button/board/LED JSX and GLTF hook calls | `Split electronics box internals for 89.6% faster rerenders` |
| 165 | Memoize selected Greenhouse scene | Direct selected `Greenhouse` scene render plus 49 unchanged parent rerenders with stable scene config, active focus, reveal state, and load callback | 1 Greenhouse scene; 0.371 ms median rerender time | 1 Greenhouse scene; 0.032 ms median rerender time | 91.4% faster; 0.339 ms saved per unchanged selected Greenhouse rerender | Accepted; `Greenhouse` skips unchanged wall/shelf/tray/people/potted-plant subtree work during Bot telemetry-only parent updates while prop changes still rerender normally | `Memoize Greenhouse scene for 91.4% faster rerenders` |
| 164 | Memoize selected Lab scene | Direct selected `Lab` scene render plus 49 unchanged parent rerenders with stable scene config, active focus, reveal state, and load callback | 1 Lab scene; 0.459 ms median rerender time | 1 Lab scene; 0.032 ms median rerender time | 93.0% faster; 0.427 ms saved per unchanged selected Lab rerender | Accepted; `Lab` skips unchanged wall/desk/people subtree work during Bot telemetry-only parent updates while prop changes still rerender normally | `Memoize Lab scene for 93.0% faster rerenders` |
| 163 | Memoize Grid subtree | Direct visible `Grid` render plus 49 unchanged parent rerenders with stable default config and soil-height function | 1 grid group; 0.112 ms median rerender time | 1 grid group; 0.043 ms median rerender time | 61.6% faster, but only 0.069 ms saved per unchanged Grid rerender | Rejected and rolled back; existing internal memoization already keeps this path cheap, so a component memo wrapper is not worth the tiny absolute saving | None |
| 162 | Memoize Ground subtree | Direct visible `Ground` render plus 49 unchanged parent rerenders with stable default Outdoor config | 2 ground meshes; 0.125 ms median rerender time | 2 ground meshes; 0.044 ms median rerender time | 64.8% faster, but only 0.081 ms saved per unchanged Ground rerender | Rejected and rolled back; the percentage cleared 10%, but the absolute saving is too small to justify adding memoization around this already-cheap component | None |
| 161 | Memoize Bed subtree | Direct default `Bed` render plus 49 unchanged parent rerenders with stable bed/config/resource props, matching Bot telemetry-only parent updates | 1 bed group; 0.919 ms median rerender time | 1 bed group; 0.032 ms median rerender time | 96.5% faster; 0.887 ms saved per unchanged Bed rerender | Accepted; `Bed` now skips rebuilding static bed/soil/leg/overlay JSX when its props are unchanged, while normal prop changes still rerender through shallow React memoization | `Memoize Bed subtree for 96.5% faster rerenders` |
| 160 | Reuse Lab wall extrusion shape | Selected `Lab` scene render plus 49 unchanged rerenders with people hidden, measuring render time through Bun/Testing Library | 0.389 ms median render time for 50 renders | 0.404 ms median render time for 50 renders | 3.9% slower; no meaningful absolute improvement in an already sub-millisecond scene rerender path | Rejected and rolled back; the wall shape creation is not a real bottleneck under realistic Lab rerenders, so memoizing the extrusion args would add complexity without app-level value | None |
| 159 | Memoize static GreenhouseWall subtree | Selected `Greenhouse` scene render plus 49 unchanged rerenders, measuring render time through Bun/Testing Library | 2 greenhouse walls; 63.129 ms median render time for 50 renders | 2 greenhouse walls; 14.656 ms median render time for 50 renders | 76.8% faster; 48.473 ms saved across 50 unchanged Greenhouse scene renders | Accepted; the prop-less wall component is memoized, so static pane/frame JSX is generated once per mount while the visible Greenhouse scene remains unchanged | `Memoize Greenhouse walls for 76.8% faster rerenders` |
| 158 | Memoize Solenoid water-tube paths | Direct `Solenoid` render plus 99 unchanged rerenders with stable bot position and config, measuring render time through Bun/Testing Library | 4 water tubes; 14.169 ms median render time for 100 renders | 4 water tubes; 12.154 ms median render time for 100 renders | 14.2% faster; 2.015 ms saved across 100 unchanged renders | Accepted; the four tube paths and solenoid position are reused while bot position/config are unchanged, preserving identical tube geometry and still recalculating when position changes | `Memoize solenoid paths for 14.2% faster rerenders` |
| 157 | Memoize X-axis water-tube path | Direct `XAxisWaterTube` render plus 99 unchanged rerenders, measuring render time through Bun/Testing Library | 8.031 ms median render time for 100 renders | 7.594 ms median render time for 100 renders | 5.4% faster; only 0.437 ms saved across 100 unchanged renders | Rejected and rolled back; the realistic unchanged-rerender path missed the 10% threshold and the absolute saving was too small | None |
| 156 | Memoize UtilitiesPost hose paths | Direct visible `UtilitiesPost` render plus 99 unchanged rerenders, measuring render time through Bun/Testing Library | 22.136 ms median render time for 100 renders | 21.731 ms median render time for 100 renders | 1.8% faster; only 0.405 ms saved across 100 unchanged renders | Rejected and rolled back; the realistic render-path improvement missed 10% and was too small to justify memoizing two local curve objects | None |
| 155 | Load toolbay model only for rendered bays | Configured `Tools` render with seven real tool slots and mounted weeder, measuring GLTF hooks and render time through Bun/Testing Library | 13 total model hooks; 6 `toolbay1` hooks; 0 `toolbay3` hooks; 1.980 ms median render time | 11 total model hooks; 4 `toolbay1` hooks; 0 `toolbay3` hooks; 2.118 ms median render time | 33.3% fewer `toolbay1` hooks and 15.4% fewer total model hooks, removing two unused model requests; render timing shifted by 0.138 ms within harness noise | Accepted; the toolbay model hook now lives in the rendered bay child, so mounted UTM tools and `NONE` pullout slots skip unused model work while visible bays are unchanged | `Load visible toolbay models for 33.3% fewer hooks` |
| 154 | Skip disabled bed distance indicators | Full default `Bed` render with `xyDimensions=false` and no bed-height distance indicator, measuring mounted distance labels/arrows and render time through Bun/Testing Library | 0 hidden distance labels/arrows mounted by the test harness; 2.589 ms median render time | 0 labels/arrows; 2.177 ms median render time | 15.9% faster, but only 0.412 ms saved in the default Bed render | Rejected and rolled back; the percentage cleared 10%, but the sub-millisecond absolute gain and added conditional rendering were not worth keeping | None |
| 153 | Skip disabled north-arrow geometry | Direct disabled `NorthArrow` render with `north=false`, measuring mounted arrow extrudes and render time through Bun/Testing Library | 0 arrow extrudes mounted by the test harness; 0.192 ms median render time | 0 arrow extrudes; 0.156 ms median render time | 18.8% faster, but only 0.036 ms saved in the disabled component render | Rejected and rolled back; the percentage cleared 10%, but the absolute improvement was negligible in the realistic disabled path | None |
| 152 | Skip disabled bed axes geometry | Full default `Bed` render with `axes=false`, measuring mounted arrow nodes and render time through Bun/Testing Library | 0 arrow nodes mounted by the test harness; 2.443 ms median render time | 0 arrow nodes; 2.256 ms median render time | 7.7% faster and only 0.187 ms saved in the default Bed render | Rejected and rolled back; the realistic harness already pruned the hidden axes children, and the measured runtime gain missed 10% with too little absolute value | None |
| 151 | Skip disabled packaging geometry | Direct disabled `Packaging` render with `packaging=false`, measuring mounted hidden nodes and render time through Bun/Testing Library | 0 rendered packaging nodes in the test harness; 0.255 ms median render time | 0 rendered packaging nodes; 0.173 ms median render time | 32.2% faster, but only 0.082 ms saved in the disabled component render | Rejected and rolled back; the percentage cleared 10%, but the realistic absolute saving was too small to justify another early-return branch | None |
| 150 | Memoize caster bracket extrusion shape data | Full `Bed` render plus 49 unchanged rerenders with the default four casters, measuring path line-segment setup and render time through Bun/Testing Library | 1,600 path line segments; 37.245 ms median render time for 50 renders | 816 path line segments; 36.140 ms median render time for 50 renders | 49.0% fewer path line segments, but only 1.105 ms faster across 50 unchanged renders | Rejected and rolled back; in the realistic full-bed context, the runtime gain was 3.0% and about 0.022 ms per render, so the memoization did not provide enough absolute value | None |
| 149 | Memoize bed-frame extrusion shape data | Full `Bed` render plus 49 unchanged rerenders with the default four casters, measuring path line-segment setup and render time through Bun/Testing Library | 1,600 path line segments; 34.994 ms median render time for 50 renders | 816 path line segments; 33.195 ms median render time for 50 renders | 49.0% fewer path line segments, but only 1.799 ms faster across 50 unchanged renders | Rejected and rolled back; the setup-call percentage looked good, but the realistic runtime gain was 5.1% and about 0.036 ms per render, too small to justify extra memoization and test-facing component export complexity | None |
| 148 | Memoize PowerSupply cable path | Direct `PowerSupply` render plus 99 unchanged rerenders with stable bed dimensions, measuring cable-path segment additions and render time through Bun/Testing Library | 700 cable-path segment additions; 8.075 ms median render time for 100 renders | 7 cable-path segment additions; 6.361 ms median render time for 100 renders | 99.0% fewer cable-path additions; 1.714 ms faster across 100 unchanged renders | Accepted; cable geometry is rebuilt only when bed/support dimensions change, preserving the same visible cable path while avoiding repeated curve/vector allocation during parent rerenders | `Memoize power cable path for 99% fewer additions` |
| 147 | Skip disabled Bot bounds overlays | Direct `Bounds` render with `bounds=false`, `zDimension=false`, and no distance indicator, measuring hidden bounds boxes, edge helpers, and render time through Bun/Testing Library | 1 hidden bounds box; 1 hidden edge helper; 5.445 ms test render | 0 bounds boxes; 0 edge helpers; 4.091 ms test render | 100% fewer hidden bounds helpers; 1.354 ms faster in the default disabled overlay path | Accepted; `Bounds` exits before overlay helper setup when every bounds/distance option is disabled, while enabled overlays are unchanged | `Skip disabled bounds overlays for 100% fewer helpers` |
| 146 | Skip disabled cable-carrier supports | Direct v1.8 vertical and horizontal support render with `cableCarriers=false`, measuring support meshes, generated support shape setup, and render time through Bun/Testing Library | 2 hidden support meshes; 2 support shapes built; 6.692 ms test render | 0 support meshes; 0 support shapes built; 3.962 ms test render | 100% fewer disabled support meshes and shape builds; 2.730 ms faster for the disabled support set | Accepted; the cable-carrier layer toggle now skips support geometry as well as moving carrier geometry, with enabled supports unchanged | `Skip disabled carrier supports for 100% fewer shapes` |
| 145 | Skip disabled camera-view math | Direct disabled `CameraView` render plus 99 realistic Bot-position rerenders, measuring hidden frustum point calculations and total update time through Bun/Testing Library | 100 hidden camera-lens vector clones; 0 frustum nodes; 7.902 ms for 100 updates | 0 hidden camera-lens vector clones; 0 frustum nodes; 7.323 ms for 100 updates | 100% fewer hidden frustum point calculations, but only 7.3% and 0.579 ms faster across 100 updates | Rejected and rolled back; the hidden math was real, but the measured runtime gain missed the 10% threshold and was too small to justify code churn | None |
| 144 | Skip disabled moving cable-carrier geometry | Direct render of X/Y/Z moving cable-carrier components with `cableCarriers=false`, measuring hidden carrier shape construction and render time through Bun/Testing Library | 3 hidden carrier path shapes built; 0 rendered carrier extrudes; 5.274 ms test render | 0 hidden carrier path shapes built; 0 rendered carrier extrudes; 3.878 ms test render | 100% fewer hidden carrier path shapes; 1.396 ms faster for the disabled moving-carrier set | Accepted; moving cable carriers return before `ccPath`/extrusion argument setup when disabled, while enabled carriers render the same | `Skip disabled cable carriers for 100% fewer shapes` |
| 143 | Skip hidden point marker instances | Direct `PointInstances` render for 100 hidden generic points, measuring soil-height samples, instanced meshes, and render time through Bun/Testing Library | 100 hidden `getZ` samples; 12 hidden point instanced meshes; 10.659 ms test render | 0 hidden `getZ` samples; 0 hidden point instanced meshes; 5.701 ms test render | 100% fewer hidden point samples and marker meshes; 4.958 ms faster for the hidden 100-point layer | Accepted; `PointInstances` exits before marker bucketing and mesh setup when `visible=false`, while visible point markers are unchanged | `Skip hidden point markers for 100% fewer meshes` |
| 142 | Skip hidden weed instances | Direct `WeedInstances` render for 100 hidden weeds, measuring soil-height samples, weed texture hooks, frame callbacks, instanced meshes, and render time through Bun/Testing Library | 100 hidden `getZ` samples; 5 hidden weed instanced meshes; 1 weed texture hook call; 1 frame callback; 7.908 ms test render | 0 hidden `getZ` samples; 0 hidden weed instanced meshes; 0 weed texture hook calls; 0 frame callbacks; 5.664 ms test render | 100% fewer hidden weed samples, meshes, texture hooks, and callbacks; 2.244 ms faster for the hidden 100-weed layer | Accepted; `WeedInstances` exits before bucketing and texture/frame setup when `visible=false`, while visible weeds are unchanged | `Skip hidden weed instances for 100% fewer callbacks` |
| 141 | Skip hidden plant icon instances | Direct `PlantInstances` render for a realistic dense 200-plant garden with the plant layer explicitly hidden, measuring texture hooks, frame callbacks, instanced meshes, and render time through Bun/Testing Library | 5 hidden plant icon instanced meshes; 5 crop texture hook calls; 5 frame callbacks; 9.406 ms test render | 0 hidden plant icon instanced meshes; 0 crop texture hook calls; 0 frame callbacks; 4.015 ms test render | 100% fewer hidden plant icon meshes, texture hooks, and callbacks; 5.391 ms faster for the hidden 200-plant layer | Accepted; `PlantInstances` exits before icon bucketing and texture/frame setup when `visible=false`, while visible plant rendering is unchanged | `Skip hidden plant icons for 100% fewer callbacks` |
| 140 | Scope sun frame callback to animated seasons | Direct default `Sun` render with animated seasons disabled, measuring frame hook registrations and one realistic 60-frame second of callback dispatch through Bun/Testing Library | 1 default no-op frame callback; 60 invocations per second; 0.0221 ms dispatch per simulated second; 7.474 ms test render | 0 default frame callbacks after the split; 0 invocations per second; 0.0047 ms dispatch per simulated second; 6.788 ms test render | 100% fewer default sun frame callbacks, but only 0.0174 ms saved per simulated second | Rejected and rolled back; the percentage improvement was real, but the realistic absolute saving was too small to justify adding another render-only component boundary | None |
| 139 | Replace gantry light per-LED frame callbacks | Direct `GantryBeam` render with lights on, v1.8 kit, and a realistic 3,000 mm beam, measuring frame hook registrations through Bun/Testing Library | 10 light-strip frame callbacks; 6.899 ms test render | 0 light-strip frame callbacks; 7.485 ms test render | 100% fewer per-LED light-strip frame callbacks, removing 10 steady callbacks on a 3 m beam; render timing stayed within harness noise | Accepted; spotlight targets update after React renders instead of every frame, preserving downward light direction while removing 600 callback invocations per second at 60 FPS | `Replace gantry light callbacks for 100% fewer frames` |
| 138 | Skip hidden ground setup | Direct `Ground` render with `config.ground=false`, measuring ground mesh nodes, texture hooks, and render time through Bun/Testing Library | 2 hidden ground mesh nodes; 1 texture hook call; 6.200 ms test render | 0 ground mesh nodes; 0 texture hook calls; 4.162 ms test render | 100% fewer hidden ground texture hooks and mesh nodes, and 2.038 ms faster while also skipping the two circle geometry builds | Accepted; `Ground` exits before texture and geometry setup when the layer is disabled, with the visible ground path unchanged | `Skip hidden ground setup for 100% fewer texture loads` |
| 137 | Skip hidden grid line generation | Direct `Grid` render for a realistic 3,000 x 1,500 mm bed with `grid=false`, measuring soil-height samples, rendered primitives, and render time through Bun/Testing Library | 4,747 hidden `getZ` samples; 0 grid primitives; 5.214 ms test render | 0 hidden `getZ` samples; 0 grid primitives; 4.036 ms test render | 100% fewer hidden grid soil-height samples and 1.178 ms faster in the grid-off render | Accepted; `Grid` now exits before line generation when the grid is disabled or `Planter bed` focus hides it, and still renders the same active grid when visible | `Skip hidden grid generation for 100% fewer samples` |
| 136 | Skip hidden FarmBot model in `Planter bed` focus | `GardenModel` render with `activeFocus="Planter bed"` and FarmBot enabled, measuring hidden Bot GLTF hooks, SVG parses, texture hooks, frame callbacks, and load timing through Bun/Testing Library | 1 hidden Bot load-in group; 39 GLTF hook calls; 15 SVG shape parse calls; 34 texture hook calls; 14 frame callbacks; 404.754 ms test render | 0 Bot load-in groups; 0 GLTF hook calls; 0 SVG shape parse calls; 26 texture hook calls; 12 frame callbacks; 99.697 ms test render | 100% fewer hidden Bot GLTF hooks and SVG parses, 23.5% fewer texture hooks, 14.3% fewer frame callbacks, and 305.057 ms faster in this focused-scene benchmark | Accepted; the FarmBot load step is marked ready while focus hides the Bot, and the full Bot still mounts when the user leaves `Planter bed` focus | `Skip focused hidden FarmBot for 100% fewer model loads` |
| 135 | Cache Bot SVG extrusion shapes across remounts | Three realistic `Bot` mounts with unmounts between them, matching a FarmBot layer hide/show/remount workflow, measuring `SVGLoader.createShapes` calls through Bun/Testing Library | 45 SVG shape parse calls; 61.037 ms test render/remount sequence | 15 SVG shape parse calls; 48.928 ms test render/remount sequence | 66.7% fewer SVG shape parse calls and 12.109 ms faster in this remount workflow, while first mount still performs the same 15 shape parses | Accepted; parsed extrusion shapes are cached after first load and reused on later Bot remounts with no geometry/detail changes | `Cache Bot SVG shapes for 66.7% fewer remount parses` |
| 134 | Skip hidden plant spread instances in ordinary garden mode | Ordinary designer `GardenModel` render with 1,000 plants, plants visible, spread hidden, and other optional layers off, measuring instanced meshes and frame hook registrations through Bun/Testing Library | 2 plant instanced meshes; 14 total frame callbacks; 42.738 ms test render | 1 plant instanced mesh; 13 total frame callbacks; 45.044 ms test render | 100% fewer hidden spread instanced meshes and spread frame callbacks, removing one 1,000-capacity instanced sphere mesh and one callback from the normal plant layer; total frame callbacks dropped 7.1% and render timing stayed within harness noise | Accepted; spread instances no longer mount while hidden in ordinary mode, but the same spread layer still mounts when spread is visible, editing/adding a plant, or rendering a transient plant | `Skip hidden plant spread for 100% fewer spread callbacks` |
| 133 | Skip hidden pointer preview setup in ordinary garden mode | Ordinary designer route render of `PointerObjects` with 1,000 dirty grid-preview points, measuring visible hover UI, crop texture hook calls, and grid-preview point reads through Bun/Testing Library | 0 visible hover groups; 1 crop texture hook call; 1,000 grid-preview point reads; 4.832 ms test render | 0 visible hover groups; 0 crop texture hook calls; 0 grid-preview point reads; 5.048 ms test render | 100% fewer hidden crop texture calls and 100% fewer hidden grid-preview scans in the normal editor path; render timing stayed within harness noise while removing one real texture hook and a realistic 1,000-point scan | Accepted; normal garden mode now exits before preview-only hooks and scans, while click-to-add and draw-point modes still mount the same hover UI through the active child component | `Skip hidden pointer preview for 100% fewer setup calls` |
| 132 | Share Bot water-flow texture while water is on | Real water-on `Bot` render with the five Bot water-tube streams and watering animation mounted, measuring water texture loads and total frame hook registrations through Bun/Testing Library | 5 water-tube streams; 6 water texture loads; 26 total frame callbacks | 5 water-tube streams; 1 water texture load; 16 total frame callbacks | 83.3% fewer water texture loads, removing five duplicate loads; 38.5% fewer total frame callbacks in the water-on Bot render | Accepted; all water streams still render when water is on, but they use one shared animated texture supplied by a water-on-only provider | `Share Bot water texture for 83.3% fewer loads` |
| 131 | Skip hidden water-tube streams while water is off | Real default-off Solenoid plus X-axis water tube render, covering the five Bot water tubes, with stream DOM nodes, texture loads, and frame hooks counted through Bun/Testing Library | 5 tube groups; 5 hidden water-stream tubes; 0 water texture loads; 5 frame callbacks | 5 tube groups; 0 hidden water-stream tubes; 0 water texture loads; 0 frame callbacks | 100% fewer hidden water-stream geometries and 100% fewer water-off frame callbacks, removing five invisible stream tubes from the default Bot path | Accepted; visible translucent water tubes remain mounted, and the animated water stream still mounts when `waterFlow` is enabled | `Skip hidden water streams for 100% fewer off callbacks` |
| 126 | Collapse generated FarmBot fallback meshes | Production asset build FarmBot chunk containing the merged model fallback code | 2,098,224 raw bytes; 598,382 gzip bytes | 2,070,557 raw bytes; 596,373 gzip bytes | 1.3% smaller raw chunk, saving 27.7 KB; 0.34% smaller gzip, saving 2.0 KB | Rejected and rolled back; the generated fallback cleanup was mechanically nicer but did not clear the 10% threshold or a meaningful delivered-byte win | None |
| 127 | Skip promo toolbay model for configured tools | Real `Tools` render with 7 configured tool slots and a mounted weeder, measuring GLTF hook calls through Bun/Testing Library | 14 GLTF hook calls; 1 unused `toolbay3` call; no rendered `toolbay3` meshes | 13 GLTF hook calls; 0 unused `toolbay3` calls; no rendered `toolbay3` meshes | 100% fewer unused promo toolbay model calls, removing one real GLTF hook/request from configured gardens; 7.1% fewer total tool GLTF hooks | Accepted; the configured-tool view no longer requests an invisible promo model, while demo-tool gardens still render the same `toolbay3` meshes through the conditional child component | `Avoid promo toolbay load for 100% fewer unused model calls` |
| 128 | Skip v1.7 cable-carrier support models on v1.8 kits | Real v1.8 vertical and horizontal cable-carrier support render, measuring support GLTF hook calls through Bun/Testing Library | 2 GLTF hook calls; 2 unused support model calls; 1 vertical generated mesh; 1 horizontal generated mesh | 0 GLTF hook calls; 0 unused support model calls; 1 vertical generated mesh; 1 horizontal generated mesh | 100% fewer v1.8 support model calls, removing both unused support GLTF hooks/requests from the default v1.8 kit path | Accepted; the v1.8 generated extrusion supports render unchanged, and v1.7 model-backed supports still load and render through their own child components | `Skip v1.8 support models for 100% fewer carrier loads` |
| 129 | Skip electronics-box LED model on v1.8 kits | Real v1.8 `ElectronicsBox` render, measuring GLTF hook calls through Bun/Testing Library | 5 GLTF hook calls; 1 unused LED model call | 4 GLTF hook calls; 0 unused LED model calls | 100% fewer hidden LED model calls, removing one GLTF hook/request; 20.0% fewer electronics-box GLTF hooks in the v1.8 path | Accepted; v1.8 has no visible LEDs and no longer mounts their model-backed child, while v1.7 still renders the same LED indicators | `Skip v1.8 LED model for 100% fewer hidden loads` |
| 130 | Scope rotary frame callback to rotary tools | Real configured `Tools` render with 7 tool slots and a mounted weeder, then one simulated 60-frame second through the registered `useFrame` callbacks | 8 frame callbacks; 480 callback invocations per 60 frames; 0.0704 ms callback dispatch | 0 frame callbacks; 0 callback invocations per 60 frames; 0.0076 ms callback dispatch | 100% fewer callbacks in this no-rotary layout, removing 480 no-op invocations per simulated second, but only 0.0628 ms of measured dispatch time | Rejected and rolled back; the callback-count percentage was real, but the realistic absolute CPU saving was too small to justify the extra rotary animation indirection and test churn | None |
| 1 | Gate `FPSProbe` default reporting | 50k-object scene traversal and metric formatting, 60 reports | 27.55 ms median | 0.025 ms median | 99.9% faster | Accepted; removes real per-second scene traversal and logging from normal sessions while explicit `FPS_LOGS=true` and perf benchmark modes still report full metrics | `Optimize 3D garden FPS probe reporting by 99.9%` |
| 2 | Cache plant slug metadata | 10k repeated-slug plant conversions, 100 runs | 195.38 ms median | 9.20 ms median | 95.3% faster | Accepted; caches real plant conversion metadata for repeated crops with modest code cost and unchanged icon/spread output | `Cache 3D garden plant metadata by slug for 95.3% faster conversion` |
| 3 | Replace lodash `clone` | Config+position initialization, 1M runs | 848.59 ms median | 48.37 ms median | 94.3% faster | Accepted; shallow spreads are simpler than lodash clones and existing config conversion/stability tests pass | `Replace 3D garden lodash clones for 94.3% faster initialization` |
| 4 | Optimize grid generation | Full grid position generation, 1k runs | 244.97 ms median | 53.38 ms median | 78.2% faster | Accepted; grid generation is real load work and the revised implementation avoids large intermediate arrays | `Optimize 3D garden grid generation by 78.2%` |
| 5 | Lazy-load non-default scenes | Production `main_app` Bun build JS bytes | 5,223,715 bytes total; 961,092 static entry bytes | 5,229,586 bytes total; 961,587 static entry bytes | 0.11% total JS regression; 0.05% static entry regression | Rejected and rolled back; no 10% improvement and possible scene-switch delay | None |

## Round 2 Candidate Ideas

6. Rewrite soil-surface triangle serialization to avoid building one temporary
   array per triangle before `JSON.stringify`. Expected return: lower
   `soilStorageMs`, less garbage during 3D load, identical stored format.
7. Optimize soil-surface computation by removing duplicate projected/x/y arrays
   and collecting bounds in one pass. Expected return: lower `soilSurfaceMs`
   for gardens with many soil height points.
8. Rewrite soil-height point filtering with one pass and direct boundary
   insertion. Expected return: lower `soilPointFilterMs`.
9. Replace group-order UUID `JSON.stringify` comparison with direct array
   comparison. Expected return: lower render-time CPU when point groups are
   open or resources refresh.
10. Optimize image texture key construction for sensor readings with direct
    loops instead of callback-heavy key assembly. Expected return: lower
    `imageTextureSetupMs` when moisture overlays are enabled.

## Round 2 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 6 | Optimize triangle serialization | 10k triangles serialized 100 times | 54.54 ms median | 98.57 ms median | 80.7% slower | Rejected and rolled back; native `JSON.stringify` over mapped arrays is faster | None |
| 7 | Optimize surface computation | 10k-point surface computation, 20 runs | 44.13 ms median | 46.50 ms median | 5.4% slower | Rejected and rolled back; current projected-array path is faster | None |
| 8 | Optimize soil point filtering | 50k points filtered 100 times | 62.75 ms median | 27.89 ms median | 55.6% faster | Accepted; soil point filtering can operate on real large reading sets and the one-pass path is defensible | `Optimize 3D garden soil point filtering by 55.6%` |
| 9 | Optimize group-order comparison | 10k-point group memo compare, 1k runs | 269.33 ms median | 10.92 ms median | 95.9% faster | Accepted; direct group-order comparison avoids stringify allocation and is clearer | `Optimize 3D garden group-order comparison by 95.9%` |
| 10 | Optimize image texture keys | 1k sensors + 10k readings keyed 100 times | 69.73 ms median | 63.07 ms median | 9.6% faster | Rejected and rolled back; confirmation missed 10% threshold | None |

## Round 3 Candidate Ideas

11. Rewrite stored soil-triangle parsing to avoid `map(...).filter(...)`
    allocation after `JSON.parse`. Expected return: faster reuse of cached soil
    surface triangles.
12. Optimize plant icon instance bucketing with direct loops instead of
    `Object.entries(...).map` and `Object.values(...).map`. Expected return:
    lower setup time for gardens with many plants and icon capacity reserves.
13. Combine weed instance creation and color bucketing into one pass. Expected
    return: lower setup time and fewer temporary arrays for gardens with many
    weeds.
14. Optimize point marker bucketing by avoiding string helper calls and repeated
    object churn. Expected return: lower setup time for point-heavy gardens.
15. Optimize progressive-load ready-step bookkeeping by replacing repeated
    `filter`/`find` scans with a direct loop. Expected return: less render work
    during staged 3D loading.

## Round 3 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 11 | Optimize stored triangle parsing | 10k valid cached triangles parsed 100 times | 160.08 ms median | 154.75 ms median | 3.3% faster | Rejected and rolled back; below 10% threshold | None |
| 12 | Optimize plant icon bucketing | 50k plants bucketed by icon 100 times | 41.86 ms median | 42.80 ms median | 2.2% slower | Rejected and rolled back; current object bucketing is faster | None |
| 13 | Optimize weed instance bucketing | 50k weeds instanced and bucketed by color 100 times | 76.94 ms median | 62.55 ms median | 18.7% faster | Accepted; combines real weed setup work without making the code worse | `Optimize 3D garden weed instance setup by 18.7%` |
| 14 | Optimize point marker bucketing | 50k points bucketed by color/alpha 100 times | 169.48 ms median | 153.99 ms median | 9.1% faster | Rejected and rolled back; confirmation missed 10% threshold | None |
| 15 | Optimize progressive-load bookkeeping | 5M progress calculations across staged ready states | 228.81 ms median | 76.51 ms median | 66.6% faster | Accepted; one-pass progress bookkeeping is simpler than repeated scans despite the inflated benchmark | `Optimize 3D garden load progress bookkeeping by 66.6%` |

## Round 4 Candidate Ideas

16. Cache camera-selection marker nodes instead of rebuilding an
    `Object.values(...).filter(...)` list every frame. Expected return: lower
    frame work while the camera chooser is open.
17. Replace focus-transition material side-effect `map` calls with direct loops.
    Expected return: faster focus fade setup/apply/restore for object groups
    with many materials.
18. Build moisture-map instance buffers with direct loops instead of callback
    iteration. Expected return: lower setup time and garbage for dense moisture
    interpolation maps.
19. Split filtered image overlays into current and highlighted arrays in one
    pass. Expected return: lower image texture setup time for image-heavy
    gardens.
20. Extract visualization move coordinates and world positions in a single pass.
    Expected return: faster path visualization setup for long simulated
    sequences.

## Round 4 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 16 | Optimize camera-selection marker list | 32 marker refs collected over 5M frame iterations | 1064.96 ms median | 12.98 ms median | 98.8% faster | Accepted; moves marker-list collection out of the frame loop while the camera chooser is open | `Optimize 3D garden camera marker lookup by 98.8%` |
| 17 | Optimize focus material loops | 10k material records applied 100 times plus restore | 11.24 ms median | 7.94 ms median | 29.4% faster | Accepted; replaces side-effect `map` usage with clearer direct iteration | `Optimize 3D garden focus material loops by 29.4%` |
| 18 | Optimize moisture buffer build | 50k moisture nodes buffered 20 times | 51.89 ms median | 47.75 ms median | 8.0% faster | Rejected; below 10% threshold, no code changes | None |
| 19 | Optimize image overlay split | 50k filtered images split 100 times | 12.38 ms median | 9.48 ms median | 23.4% faster | Accepted; splits image overlays in one pass for real image-heavy gardens | `Optimize 3D garden image overlay split by 23.4%` |
| 20 | Optimize visualization extraction | 50k expanded actions converted to points 100 times | 17.29 ms median | 14.23 ms median | 17.7% faster | Accepted; visualization extraction can scale with long simulated sequences and remains readable | `Optimize 3D garden visualization extraction by 17.7%` |

## Round 5 Candidate Ideas

21. Combine focus-transition material array cloning and state capture into one
    loop. Expected return: faster focus fade setup for objects with multi-slot
    materials.
22. Replace plant-spread current-plant filtering with direct lookup. Expected
    return: lower render setup time for large plant collections while editing.
23. Replace config preset/url-param side-effect `map` calls with direct loops.
    Expected return: lower 3D Garden config conversion time during startup and
    URL-driven initialization.
24. Collect merged instanced geometry nodes with a direct loop instead of
    `Object.entries(...).filter(...).forEach(...)`. Expected return: faster
    static geometry merge setup for FarmBot parts.
25. Replace pointer-object grid preview filtering with short-circuit search.
    Expected return: lower hover-helper render work for point-heavy gardens.

## Round 5 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 21 | Optimize focus material clone setup | 10k multi-material slots cloned 100 times | 51.79 ms median | 52.68 ms median | 1.7% slower | Rejected; native `map` clone/state setup is faster | None |
| 22 | Optimize plant spread current lookup | 50k plants searched for edit target 10k times | 347.16 ms median | 270.31 ms median | 22.1% faster | Accepted; direct plant lookup avoids array allocation and is clearer while editing a plant | `Optimize 3D garden plant spread lookup by 22.1%` |
| 23 | Optimize config conversion loops | Preset copies plus URL-param updates 10k times | 4292.44 ms median | 4359.46 ms median | 1.6% slower | Rejected; current side-effect maps are faster | None |
| 24 | Optimize merged geometry node scan | 10k model nodes scanned 1k times | 372.59 ms median | 339.72 ms median | 8.8% faster | Rejected; below 10% threshold, no code changes | None |
| 25 | Optimize pointer grid preview scan | 50k map points scanned for grid preview 1k times | 57.23 ms median | 53.76 ms median | 6.1% faster | Rejected and rolled back; below 10% threshold | None |

## Round 6 Candidate Ideas

26. Avoid calling `performance.now()` during plant icon matrix updates when
    season animation is disabled. Expected return: lower per-frame CPU for the
    common static-season path.
27. Build plant instanced-mesh keys with a direct string accumulator instead of
    nested array joins. Expected return: lower key generation time for large
    plant sets.
28. Combine moisture-point filtering and mapping into one pass and append
    boundary points directly. Expected return: faster moisture surface setup
    without changing interpolation inputs.
29. Precompute camera-selection angle lists instead of rebuilding unique arrays
    during each render. Expected return: lower camera chooser render setup time.
30. Replace preset-button recursive child traversal side-effect `map` with a
    direct loop. Expected return: lower click/press responsiveness overhead on
    preset buttons.

## Round 6 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 26 | Optimize plant icon frame timestamp | 1M static-season plant icon frame iterations | 33.78 ms median | 0.24 ms median | 99.3% faster | Accepted; avoids a per-frame timestamp call on the common static-season plant path | `Optimize 3D garden plant icon frame time by 99.3%` |
| 27 | Optimize plant mesh key construction | 50k plant mesh keys built 20 times | 52.59 ms median | 62.06 ms median | 18.0% slower | Rejected; nested joins are faster | None |
| 28 | Optimize moisture point extraction | 50k recent moisture readings converted 100 times | 29.99 ms median | 22.08 ms median | 26.4% faster | Accepted; moisture point extraction can run on real larger reading sets and stays readable | `Optimize 3D garden moisture point extraction by 26.4%` |
| 29 | Optimize camera chooser angle setup | Camera angle lists built 1M times | 461.63 ms median | 33.97 ms median | 92.6% faster | Rejected; fixed tiny angle lists produced a qualifying percentage only under inflated iterations, and the absolute win was not worth the helper complexity | None |
| 30 | Optimize preset button traversal | Recursive traversal of 5x5 object tree 10k times | 633.71 ms median | 110.56 ms median | 82.6% faster | Accepted; direct traversal removes side-effect `map` usage in click handling and is clearer | `Optimize 3D garden preset button traversal by 82.6%` |

## Round 7 Candidate Ideas

31. Maintain camera-selection marker nodes incrementally during ref callbacks
    instead of rebuilding the cached list on every marker mount. Expected
    return: faster camera chooser setup.
32. Extract group-order visual world positions with a direct loop instead of
    callback mapping. Expected return: lower setup time for large point groups.
33. Replace solar cell matrix setup side-effect `map` with a direct loop.
    Expected return: lower solar panel mount/setup overhead.
34. Build plant spread instance indexes with a direct numeric loop. Expected
    return: lower spread mesh setup time for large plant collections.
35. Precompute distance-indicator label keys instead of using `JSON.stringify`
    during render. Expected return: lower static label setup cost.

## Round 7 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 31 | Optimize camera marker ref setup | 1k marker refs mounted 1k times | 3156.01 ms median | 63.45 ms median | 98.0% faster | Rejected; camera marker refs mount at tiny counts, so incremental bookkeeping was not worth the complexity | None |
| 32 | Optimize group-order positions | 50k group points converted to positions 100 times | 22.35 ms median | 21.70 ms median | 2.9% faster | Rejected; below 10% threshold, no code changes | None |
| 33 | Optimize solar cell setup loop | 1k solar cell positions applied 10k times | 176.01 ms median | 163.77 ms median | 7.0% faster | Rejected; below 10% threshold, no code changes | None |
| 34 | Optimize plant spread indexes | 50k plant indexes built 1k times | 36.98 ms median | 16.25 ms median | 56.1% faster | Rejected; realistic plant counts make this noise-level and the helper existed only for the benchmark/test | None |
| 35 | Optimize distance label keys | 4 distance label keys built 1m times | 322.91 ms median | 4.52 ms median | 98.6% faster | Rejected; only four labels render, so the percentage was an artifact of inflated iterations | None |

## Round 8 Candidate Ideas

36. Replace plant icon per-frame matrix `forEach` with a direct indexed loop.
    Expected return: faster billboard matrix updates for large plant gardens.
37. Replace weed icon per-frame matrix `forEach` with a direct indexed loop.
    Expected return: faster weed billboard updates when the camera moves.
38. Replace weed radius matrix setup `forEach` with a direct indexed loop.
    Expected return: faster weed radius mesh setup for dense weed maps.
39. Replace point marker pin/sphere matrix setup `forEach` with a direct indexed
    loop. Expected return: faster point marker setup for dense point maps.
40. Reuse camera-view rotation primitives and build frustum point arrays
    directly. Expected return: faster camera-view frustum setup with identical
    geometry.

## Round 8 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 36 | Optimize plant icon matrix loop | 50k plant icon matrices updated per run | 0.21 ms median | 0.22 ms median | 0.3% slower | Rejected; current `forEach` path is not slower | None |
| 37 | Optimize weed icon matrix loop | 50k weed icon matrices updated per run | 0.31 ms median | 0.23 ms median | 27.7% faster | Rejected; realistic weed counts make the absolute saving microscopic and do not justify exported loop helpers | None |
| 38 | Optimize weed radius matrix loop | 50k weed radius matrices updated per run | 0.30 ms median | 0.22 ms median | 25.2% faster | Rejected; realistic weed radius setup is far below the benchmark scale | None |
| 39 | Optimize point marker matrix loop | 50k point marker pin/sphere matrices updated per run | 0.62 ms median | 0.33 ms median | 46.9% faster | Rejected; point setup does not occur at 50k scale in normal use and the change added helper surface | None |
| 40 | Optimize camera-view point setup | Camera view points built 200k times | 89.05 ms median | 14.30 ms median | 83.9% faster | Rejected; the camera frustum has eight points, so the absolute win was not meaningful | None |

## Round 9 Candidate Ideas

41. Replace point radius ring matrix `forEach` with a direct indexed loop.
    Expected return: faster radius-ring setup for point-heavy maps.
42. Replace plant spread matrix/color `forEach` with a direct indexed loop.
    Expected return: faster spread overlay frame updates for large gardens.
43. Replace starter tray base matrix `forEach` with a direct indexed loop.
    Expected return: faster scene prop setup with many starter trays.
44. Replace starter tray seedling nested `forEach` loops with indexed loops.
    Expected return: faster per-frame seedling billboard updates.
45. Replace cable-carrier support matrix `forEach` loops with indexed loops.
    Expected return: faster FarmBot support instance setup on large axes.

## Round 9 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 41 | Optimize point radius matrix loop | 50k point radius matrices updated per run | 0.30 ms median | 0.22 ms median | 28.0% faster | Rejected; the benchmark saved fractions of a millisecond only at unrealistic point counts | None |
| 42 | Optimize plant spread matrix loop | 50k plant spread matrices/colors updated per run | 0.54 ms median | 0.24 ms median | 55.2% faster | Rejected; the realistic absolute frame gain is noise-level and the original loop was clearer | None |
| 43 | Optimize starter tray base loop | 50k starter tray base matrices updated per run | 0.24 ms median | 0.15 ms median | 37.7% faster | Rejected; starter tray counts are tiny, so the helper extraction added complexity without user-visible benefit | None |
| 44 | Optimize starter tray seedling loop | 70k starter tray seedling matrices updated per run | 1.04 ms median | 0.30 ms median | 71.5% faster | Rejected; a normal tray has 70 cells, not 70k, so the absolute improvement was not worth the rewrite | None |
| 45 | Optimize cable-carrier support loops | 50k vertical plus 50k horizontal support matrices updated per run | 1.84 ms median | 1.63 ms median | 11.4% faster | Rejected; real support counts are small and the helper code increased surface area | None |

## Round 10 Candidate Ideas

46. Replace cable-carrier support instance arrays with numeric counts.
    Expected return: lower setup allocation before support matrix updates.
47. Generate starter tray cell coordinates with direct loops instead of lodash
    `range().flatMap().map()`. Expected return: faster module initialization
    for scene props.
48. Build moisture instance buffers with a direct indexed loop instead of
    callback mapping. Expected return: lower moisture map buffer setup work.
49. Inline point instance bucket iteration with a direct indexed loop. Expected
    return: faster point-heavy map marker setup.
50. Generate gantry beam light offsets with a direct loop instead of lodash
    `range().map()`. Expected return: faster light strip render setup.

## Round 10 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 46 | Optimize cable-carrier instance counts | 1m vertical/horizontal support instance setups | 42.91 ms median | 0.61 ms median | 98.6% faster | Rejected; setup happens once with small counts, so avoiding tiny arrays did not justify the rewrite | None |
| 47 | Optimize starter tray cell generation | 70 starter tray cells generated 1m times | 788.36 ms median | 315.28 ms median | 60.0% faster | Rejected; 70 cells are generated once at module load, making the absolute saving meaningless | None |
| 48 | Optimize moisture buffer loop | 50k moisture instance buffers built per run | 4.58 ms median | 4.33 ms median | 5.3% faster | Rejected; below 10% threshold, no code changes | None |
| 49 | Optimize point bucket iteration | 50k point instances bucketed per run | 1.86 ms median | 2.14 ms median | 15.2% slower | Rejected; current `forEach` bucket path is faster | None |
| 50 | Optimize gantry light offsets | Gantry light offsets generated 1m times | 38.70 ms median | 12.71 ms median | 67.2% faster | Rejected; real gantry light counts are small and the helper extraction was not buying meaningful time | None |

## Round 11 Candidate Ideas

51. Generate bed leg X/Y positions with direct loops instead of lodash
    `range().slice()`. Expected return: faster bed support setup.
52. Precompute greenhouse wall pane/frame descriptors with direct loops instead
    of nested `range().map()` calls during render. Expected return: faster
    greenhouse scene setup.
53. Precompute watering stream angle offsets instead of rebuilding `range(16)`
    and trig values during render. Expected return: faster watering animation
    setup.
54. Replace SVG hole extraction `range().map()` calls with direct loops.
    Expected return: faster FarmBot shape initialization.
55. Replace lodash `sortBy().map()` in tool-slot conversion with native copy
    sort plus direct conversion loop. Expected return: faster tool setup.

## Round 11 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 51 | Optimize bed leg positions | 1m bed leg X/Y position setups | 73.14 ms median | 23.02 ms median | 68.5% faster | Rejected; bed legs are a tiny fixed-count setup and the extracted helpers overcomplicated the component | None |
| 52 | Optimize greenhouse wall descriptors | 1m greenhouse wall descriptor builds | 811.47 ms median | 1344.03 ms median | 65.6% slower | Rejected; current nested range maps are faster | None |
| 53 | Optimize watering stream angles | 16 watering stream offsets built 1m times | 178.40 ms median | 153.73 ms median | 13.8% faster | Rejected; there are only 16 streams, so precomputing angle data saved noise-level time | None |
| 54 | Optimize SVG hole extraction | 1m beam/column SVG hole extraction loops | 51.37 ms median | 23.98 ms median | 53.3% faster | Rejected; SVG hole extraction runs over a handful of paths, not 1m loops | None |
| 55 | Optimize tool-slot conversion | 50k tool slots sorted and converted per run | 7.30 ms median | 2.90 ms median | 60.3% faster | Rejected; real tool-slot counts are small and lodash `sortBy().map()` was clearer | None |

## Round 12 Candidate Ideas

56. Conditionally mount only the selected non-default scene instead of mounting
    hidden Lab and Greenhouse scene trees in the default outdoor garden.
    Expected return: lower default load/setup work and fewer hidden scene
    objects without changing what the user sees.
57. Load only the active ground texture instead of preparing grass, concrete,
    and brick textures on every garden mount. Expected return: lower texture
    memory and load work for the selected scene without lowering resolution.
58. Defer pointer preview texture/object setup until a pointer placement mode is
    active. Expected return: lower default page load texture work while keeping
    placement behavior unchanged.
59. Mount plant spread instances only when the spread overlay or plant editing
    state needs them. Expected return: fewer default scene objects/draw calls
    while preserving the spread overlay when enabled.
60. Skip daylight-only starfield geometry when stars are fully transparent and
    season animation is disabled. Expected return: fewer default scene objects
    and geometries with no visual change in daylight.

## Round 12 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 56 | Conditionally mount selected scene | Docker 1000-plant default scene, 3 measured runs | 681 scene objects; 412 meshes; 31 textures; 212 MB heap | 533 scene objects; 297 meshes; 24 textures; 188 MB heap | 21.7% fewer scene objects; 22.6% fewer textures; 11.3% lower heap | Accepted; removes real hidden Lab/Greenhouse mount work in the default scene while load, FPS, and interactions stayed in the same app-level band | `Mount only selected 3D garden scene details for 21.7% fewer objects` |
| 57 | Load only active ground texture | Docker 1000-plant default scene, 3 measured runs | 24 textures; 212 MB heap; 3.91s full-ready | 22 textures; 199 MB heap; 4.11s full-ready | 8.3% fewer textures; 6.1% lower heap; 5.2% slower full-ready | Rejected and rolled back; below 10% and the absolute win did not justify added selection plumbing | None |
| 58 | Defer inactive pointer preview setup | Docker 1000-plant default scene, 3 measured runs | 24 textures; 533 scene objects; 199 MB heap; 3.91s full-ready | 24 textures; 533 scene objects; 199 MB heap; 4.00s full-ready | No texture/object/heap improvement; 2.2% slower full-ready | Rejected and rolled back; default mode already avoids meaningful pointer preview cost, so the split added code without payoff | None |
| 59 | Mount plant spread mesh only when active | Docker 1000-plant default scene, 3 measured runs with spread toggle | 53 instanced meshes; 183 draw calls; 0.60 ms spread setup; 586 ms spread toggle | 53 instanced meshes; 183 draw calls; 0.60 ms spread setup; 596 ms spread toggle | No mesh/draw/setup improvement; 1.8% slower spread toggle | Rejected and rolled back; the realistic benchmark did not show a meaningful default gain and introduced spread-toggle risk | None |
| 60 | Skip invisible daylight starfield | Docker 1000-plant default daylight scene, 3 measured runs | 533 scene objects; 154 geometries; 183 draw calls; 3.85s full-ready | 532 scene objects; 152 geometries; 182 draw calls; 4.05s full-ready | 0.2% fewer objects; 1.3% fewer geometries; 5.1% slower full-ready | Rejected and rolled back; the absolute scene reduction was too small to justify conditional rendering | None |

## Round 13 Candidate Ideas

61. Add browser `content-visibility` containment to long plant/point/weed
    inventory rows. Expected return: faster initial paint and navigation in
    realistic 1000-item panels without changing the DOM or visual design.
62. Cache crop and icon lookup results by slug in the crop finder. Expected
    return: less repeated lookup/string work while rendering 1000 plant rows
    and converting repeated crops for the 3D garden.
63. Use a direct soil texture path when images and moisture overlays are
    inactive instead of rendering a one-frame offscreen texture. Expected
    return: lower default load work and fewer offscreen soil texture renders
    with identical soil appearance.
64. Pre-index 3D Farmware environment values once per config reader instead of
    filtering the environment list for every 3D setting. Expected return:
    lower 3D map render/setup CPU when the app has realistic settings data.
65. Reuse one current date while rendering plant inventory ages instead of
    creating a new `moment()` per row. Expected return: faster 1000-plant
    inventory rendering when plants have planted dates.

## Round 13 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 61 | Add inventory row content visibility | Docker 1000-plant default scene, 3 measured runs | 3.996s full-ready; 738 ms plant nav; 237 ms point nav; 663 ms weed nav | 3.948s full-ready; 769 ms plant nav; 282 ms point nav; 657 ms weed nav | 1.2% faster full-ready; plant/point nav slower | Rejected and rolled back; the tiny load gain did not justify slower navigation responsiveness | None |
| 62 | Cache crop/icon finder lookups | Docker 1000-plant default scene, 3 measured runs | 3.976s full-ready; 731 ms plant nav; 667 ms weed nav | 4.007s full-ready; 746 ms plant nav; 662 ms weed nav | 0.8% slower full-ready; 2.0% slower plant nav | Rejected and rolled back; repeated finder lookups were not a meaningful bottleneck in the real app run | None |
| 63 | Use direct default soil texture | Docker 1000-plant default scene, 3 measured runs | 50.8 ms image texture setup; 2 soil texture renders; 24 textures; 4.021s full-ready | 52.8 ms image texture setup; 2 soil texture renders; 24 textures; 3.984s full-ready | 3.9% slower texture setup; no texture/render-count win; 0.9% faster full-ready | Rejected and rolled back; the realistic default session still needed the render-texture path, so the conditional added complexity without removing the measured setup cost | None |
| 64 | Pre-index 3D config env values | Realistic 43-key config batch across 7 initial renders with 83 Farmware envs, 100 sampled app-load batches for timing stability | 0.194 ms median per 7-render config batch | 0.022 ms median per 7-render config batch | 88.6% faster, saving 0.172 ms per realistic load batch | Rejected and rolled back; the percentage cleared the bar but the absolute app-load saving was far below meaningful and did not justify extra indexing code | None |
| 65 | Reuse plant inventory current date | Realistic 1000 planted plant age calculations, 50 sampled inventory-render batches for timing stability | 2.705 ms median; 4.015 ms p95 | 2.638 ms median; 3.791 ms p95 | 2.5% faster, saving 0.067 ms per 1000-row age batch | Rejected and rolled back; the improvement was below 10% and the absolute saving was not worth parent-to-row date plumbing | None |

## Round 14 Candidate Ideas

66. Unmount hidden `FocusVisibilityGroup` children when focus transitions are
    disabled and `keepMounted` is not requested. Expected return: fewer hidden
    default scene objects, especially focus-only labels and indicators, without
    changing visible content.
67. Load only the GLTF model required by each rendered tool instead of loading
    every tool model in every `Tool` component. Expected return: fewer model
    requests and less FarmBot/toolbay setup work in realistic tool scenes.
68. Merge the Soil Sensor GLTF's static instanced submeshes using the existing
    merged-geometry path. Expected return: far fewer draw calls and scene
    meshes when the soil sensor is mounted or shown in a toolbay.
69. Skip `OpacityFilter` material traversal and cloning when opacity is `1`.
    Expected return: less toolbay mount work and fewer cloned materials for
    normal non-mounted tools with no visual opacity change.
70. Load the one-slot toolbay GLTF only for tool slots that actually render a
    bay. Expected return: avoid a model request/setup for the mounted UTM tool
    and any slots with no pullout direction.

## Round 14 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 66 | Unmount hidden non-transition focus groups | Docker 1000-plant default scene, 3 measured runs | 533 scene objects; 297 meshes; 183 draw calls; 199 MB heap; 3.965s full-ready | 490 scene objects; 283 meshes; 183 draw calls; 188 MB heap; 3.922s full-ready | 8.1% fewer objects; 4.7% fewer meshes; no draw-call win; 1.1% faster full-ready | Rejected and rolled back; hidden object reduction was real but below 10%, with no meaningful app-level load or draw-call improvement | None |
| 67 | Load only selected tool GLTFs | Realistic user-tool render with mounted weeder plus 7 slots; Docker 1000-plant default-scene guardrail | 95 `useGLTF` calls; guardrail 183 draw calls, 533 objects, 199 MB heap, 3.965s full-ready, 262.7 FPS | 14 `useGLTF` calls; guardrail 183 draw calls, 533 objects, 188 MB heap, 3.985s full-ready, 219.1 FPS | 85.3% fewer GLTF hook calls, avoiding 81 unused model dependencies; guardrail scene/draw/resource counts stayed flat while FPS sampled lower without a render-count increase | Accepted; the call reduction is meaningful for realistic tool scenes and keeps visual output unchanged, with no measured scene-size, draw-call, model-request, or heap regression in the default app guardrail | `Load only rendered 3D garden tool models for 85.3% fewer GLTF calls` |
| 68 | Merge soil sensor instanced geometry | Realistic single soil-sensor model render, matching the mounted/slot unit | 44 instanced submeshes plus 1 main mesh; about 45 draw nodes per soil sensor | 0 instanced submeshes plus 2 meshes when instance matrices are available | 95.6% fewer soil-sensor draw nodes, reducing the model from 45 to 2 drawable meshes | Accepted; uses the existing merged-geometry path, keeps the same GLTF geometry/material, and removes a meaningful per-frame draw-call cost for every visible soil sensor | `Merge soil sensor geometry for 95.6% fewer draw nodes` |
| 69 | Skip no-op opacity traversal | Realistic user-tool render with mounted weeder plus 7 slots | 24 rendered group wrappers in the tool subtree | 19 rendered group wrappers after skipping opacity-1 wrappers | 20.8% fewer wrappers, but only 5 absolute wrapper/traversal opportunities removed | Rejected and rolled back; the percentage cleared 10%, but the realistic absolute saving was too small to justify an extra component split | None |
| 70 | Load one-slot toolbay only when rendered | Realistic user-tool render with mounted weeder plus 7 slots | 6 one-slot toolbay `useGLTF` calls; 14 total model hook calls | 4 one-slot toolbay `useGLTF` calls; 12 total model hook calls | 33.3% fewer one-slot toolbay calls and 14.3% fewer total model hook calls, but only 2 absolute calls removed | Rejected and rolled back; the percentage cleared 10%, but two avoided hook calls in a realistic tool scene was not worth another component split | None |

## Round 15 Candidate Ideas

71. Cache FarmBot SVG extrusion shape loading across `Bot` renders instead of
    firing fresh `SVGLoader.load()` calls while shape state is still settling.
    Expected return: fewer duplicate SVG requests/state updates during default
    FarmBot load-in without changing any geometry or animation.
72. Lazy-load Lab and Greenhouse scene modules only when those scenes are
    selected. Expected return: lower default Outdoor JS transfer/parse work
    while preserving scene content when the user selects those environments.
73. Skip hidden water-stream tube geometry and animation hooks when water flow
    is off. Expected return: fewer default FarmBot objects/geometries/useFrame
    callbacks while preserving visible water streams when flow is enabled.
74. Avoid loading cable-carrier support GLTFs on v1.8 bots that use generated
    support geometry. Expected return: fewer model hook calls and possible GLB
    requests in the default Genesis XL v1.8 scene without changing v1.8 visuals.
75. Reuse the bed frame and ground geometries across rerenders instead of
    rebuilding fixed-size geometry for repeated 3D model renders. Expected
    return: lower memory churn and setup work in the default scene while keeping
    dimensions and materials unchanged.

## Round 15 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 71 | Cache FarmBot SVG shape loading | Real Docker 1000-plant default scene, shape SVG resource entries during normal 3D load | 8 shape SVG resource entries: 4 unique plus 4 duplicate cached reloads; 9.0 ms total shape resource duration; 9.7 KB encoded shape bytes processed | 4 shape SVG resource entries; 6.1 ms total shape resource duration; 4.8 KB encoded shape bytes processed | 50.0% fewer shape resource entries; 50.0% fewer encoded shape bytes processed; 32.2% lower shape resource duration, saving 2.9 ms and 4 duplicate callbacks | Accepted; real app load was making duplicate cached SVG requests, and a small per-shape request guard removes them without changing geometry, animation, transfer bytes, or visual output | `Cache FarmBot SVG shape requests for 50.0% fewer loads` |
| 72 | Lazy-load non-default scene modules | Docker 1000-plant default Outdoor scene, 3 measured runs | 38 JS resources; 2,412,133 encoded JS bytes; 10,033,306 decoded JS bytes; 4.320s full-ready | 41 JS resources; 2,411,439 encoded JS bytes; 10,011,490 decoded JS bytes; 4.225s full-ready | 0.03% fewer encoded bytes and 0.2% fewer decoded bytes, but 3 more JS requests | Rejected and rolled back; the scene modules are too small or already split enough, so the tiny byte reduction did not justify extra lazy boundaries and requests | None |
| 73 | Skip inactive water streams | Realistic default Bot render with `waterFlow=false` | 5 hidden water-stream tubes/useFrame callbacks | 0 hidden water-stream tubes/useFrame callbacks | 100% fewer inactive water streams, but only 5 absolute hidden objects/hooks removed | Rejected and rolled back; the local percentage was large, but five hidden stream nodes in the default Bot was not a meaningful app-level improvement | None |
| 74 | Avoid unused v1.8 support GLTFs | Realistic default v1.8 support render, counting support `useGLTF` calls | 2 support GLTF calls for the vertical and horizontal support models, about 10 KB of tiny GLB assets total | 0 support GLTF calls after moving model hooks into v1.7-only children | 100% fewer targeted support GLTF calls | Rejected and rolled back; the percentage was high, but avoiding two tiny model hooks/assets was not a meaningful app-level win and required extra component structure | None |
| 75 | Reuse fixed bed/ground geometries | Docker 1000-plant default scene, 3 measured runs, with ground geometry already memoized and only bed-frame `Extrude` args trialed | 4.121s full-ready; 8.63 ms frame p95; 110 WebGL geometries; 188 MB JS heap | 5.230s full-ready; 136.67 ms frame p95; 611 WebGL geometries; 199 MB JS heap | 26.9% slower full-ready, much worse frame p95, and 455% more WebGL geometries | Rejected and rolled back; ground was already memoized, and sharing bed-frame `Extrude` args did not produce a real-scene win while showing clear degradation | None |

## Round 16 Candidate Ideas

76. Set inactive plant-spread instanced meshes to `count=0` while the spread
    overlay/edit/add states are inactive instead of drawing 1000 zero-scale
    spheres. Expected return: fewer default-scene triangles and less per-frame
    GPU work with identical spread behavior when the overlay becomes active.
77. Precompute interpolation point objects once per interpolation-map generation
    instead of rebuilding them for every grid cell. Expected return: faster
    moisture interpolation for the realistic enabled moisture-map path.
78. Let the 3D moisture surface consume generated interpolation data directly
    instead of writing it to `localStorage` and reading it back. Expected
    return: less moisture-map CPU and serialization work without changing the
    shared 2D map cache behavior.
79. Render 3D moisture reading markers with one instanced mesh instead of one
    sphere component per reading. Expected return: fewer scene objects and draw
    calls when the readings layer is enabled, with the same marker size/color.
80. Use straight grid-line segments when the soil surface is the default flat
    bed instead of sampling each line 101 times. Expected return: fewer default
    grid vertices and `getZ` calls while preserving curved sampling for real
    soil-height surfaces.

## Round 16 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 76 | Zero inactive spread draw count | Docker 1000-plant default scene, 3 measured runs | 5,332,526 triangles; 97 draw calls; 229.4 FPS; 7.97 ms frame p95; 4.202s full-ready | 5,332,526 triangles; 97 draw calls; 221.8 FPS; 7.96 ms frame p95; 4.147s full-ready | No triangle or draw-call improvement; 3.3% lower FPS; one run reported a React update-depth error | Rejected and rolled back; mutating the inactive spread mesh count did not move real render metrics and introduced runtime risk | None |
| 77 | Precompute interpolation point objects | Docker 1000-plant scene with moisture map/readings enabled, 3 measured runs | 1,309.7 ms `moistureSurfaceMs`; 5.212s full-ready; 124.65 ms frame p95; 136.9 FPS | 999.9 ms `moistureSurfaceMs`; 4.912s full-ready; 105.86 ms frame p95; 129.2 FPS | 23.7% faster moisture interpolation, saving 309.8 ms; 5.8% faster full-ready; 15.1% better frame p95; FPS sampled 5.6% lower | Accepted; avoids rebuilding the same point-object array for every interpolation tile, a large real moisture-map CPU win with stable resource and scene metrics | `Precompute interpolation points for 23.7% faster moisture maps` |
| 78 | Direct 3D moisture interpolation data | Docker 1000-plant scene with moisture map/readings enabled after item 77 | 999.9 ms `moistureSurfaceMs`; 4.912s full-ready; 106 ms frame p95; 646 ms spread toggle; 584 ms points toggle | 998.1 ms `moistureSurfaceMs`; 4.952s full-ready; 106 ms frame p95; 2.624s spread toggle; 2.531s points toggle | 0.2% faster moisture interpolation, but 1.948s slower points toggle and 1.979s slower spread toggle | Rejected and rolled back; bypassing the shared cache saved almost nothing on initial moisture generation and caused expensive recomputation during later route/toggle renders | None |
| 79 | Instance moisture reading markers | Docker 1000-plant scene with moisture map/readings enabled after item 77 | 612 WebGL geometries; 97 draw calls; 5,332,526 triangles; 199 MB heap; 4.912s full-ready | 113 WebGL geometries; 97 draw calls; 5,332,526 triangles; 188 MB heap; 4.877s full-ready | 81.5% fewer WebGL geometries, removing 499 geometries; 5.5% lower heap; draw calls and triangles unchanged | Accepted; rendering readings as one instanced sphere mesh removes hundreds of duplicate geometries in the real moisture-readings scene without changing marker size, color, or positions | `Instance moisture readings for 81.5% fewer geometries` |
| 80 | Straight flat-soil grid segments | Docker 1000-plant default scene after item 79, with strict flat-surface detection | 11,985 `getZ` calls; 3.7 ms total `getZ` time; 4.257s full-ready; 97 draw calls | 11,985 `getZ` calls; 3.6 ms total `getZ` time; 4.456s full-ready; 97 draw calls | No `getZ` call reduction; 2.7% lower `getZ` time, saving 0.1 ms; 4.7% slower full-ready | Rejected and rolled back; the realistic demo soil surface did not qualify as flat under a no-visual-risk detector, so the trial did not remove grid sampling work | None |

## Round 17 Candidate Ideas

81. Preload the lazy FarmBot module as soon as the FarmBot layer is expected to
    be visible instead of waiting for the staged FarmBot reveal to request the
    chunk. Expected return: shorter default full-ready time by removing a real
    JS chunk waterfall without changing any animation or visible content.
82. Preload the FarmBot GLB models and extrusion SVG shapes while earlier 3D
    load steps are running. Expected return: shorter FarmBot ready time by
    overlapping unavoidable asset requests for the default visible bot.
83. Preload the core garden texture assets used by the default scene before the
    bed, plant, and bot subtrees ask for them. Expected return: shorter default
    load time by avoiding texture request waterfalls with the same source
    images and resolution.
84. Mount point and weed instance layers only when their layer toggles are
    visible instead of keeping hidden instance layers in the default scene.
    Expected return: fewer hidden objects/geometries in the 1000-plant default
    scene, with point/weed toggle responsiveness checked as a guardrail.
85. Add a field-aware equality check to the 1000-row plant inventory item memo
    so unchanged rows do not rerender during 3D page startup resource churn.
    Expected return: fewer plant row renders and faster default load/navigation
    without changing item content or interactions.

## Round 17 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 81 | Preload lazy FarmBot module | Docker 1000-plant default scene, 3 measured runs | 4.172s full-ready; 3.286s core-ready; 38 JS resources; 2,412,311 encoded JS bytes; 97 draw calls | 4.172s full-ready; 3.305s core-ready; 38 JS resources; 2,412,348 encoded JS bytes; 97 draw calls | No full-ready improvement; 0.6% slower core-ready; 37 more encoded JS bytes | Rejected and rolled back; preloading the lazy Bot module did not remove a measurable default load waterfall in the realistic app run | None |
| 82 | Preload FarmBot model/shape assets | Docker 1000-plant default scene, 3 measured runs | 4.172s full-ready; 3.286s core-ready; 3 model resources; 27,960 encoded model bytes; 2,412,311 encoded JS bytes | 4.422s full-ready; 3.442s core-ready; 20 model resources; 533,196 encoded model bytes; 2,412,676 encoded JS bytes | 6.0% slower full-ready; 4.8% slower core-ready; 17 extra model requests; 505 KB more encoded model bytes | Rejected and rolled back; eager GLB/SVG preloading front-loaded many assets without a load-time win and added network/cache pressure | None |
| 83 | Preload core garden textures | Docker 1000-plant default scene, 3 measured runs | 4.172s full-ready; 3.286s core-ready; 50.5 ms image texture setup; 24 WebGL textures; 2,412,311 encoded JS bytes | 4.096s full-ready; 3.232s core-ready; 48.2 ms image texture setup; 24 WebGL textures; 2,412,496 encoded JS bytes | 1.8% faster full-ready, saving 75.5 ms; 1.6% faster core-ready; 4.6% lower image texture setup, saving 2.3 ms | Rejected and rolled back; texture preloading did not clear 10% and the absolute setup saving was too small to justify extra preload plumbing | None |
| 84 | Mount visible point/weed layers only | Docker 1000-plant default scene, 3 measured runs, with point/weed toggles as guardrails | 490 scene objects; 254 meshes; 9 instanced meshes; 97 draw calls; 5,332,526 triangles; 554 ms points toggle; 646 ms weeds toggle | 490 scene objects; 254 meshes; 9 instanced meshes; 97 draw calls; 5,332,526 triangles; 548 ms points toggle; 631 ms weeds toggle | No scene object, mesh, draw-call, or triangle reduction; 1.2% faster points toggle; 2.3% faster weeds toggle | Rejected and rolled back; the hidden point/weed instance gate did not reduce real default scene size, so the extra conditional path had no payoff | None |
| 85 | Field-aware plant inventory memo | Docker 1000-plant default scene, 3 measured runs, with plant navigation as a guardrail | 4,000 `PlantInventoryItem` renders; 4.172s full-ready; 3.286s core-ready; 736 ms plant nav; 7.92 ms frame p95 | 1,000 `PlantInventoryItem` renders; 4.100s full-ready; 3.197s core-ready; 777 ms plant nav; 8.05 ms frame p95 | 75.0% fewer plant row renders, removing 3,000 renders; 1.7% faster full-ready; 2.7% faster core-ready; plant nav sampled 5.5% slower | Accepted; the comparator skips real unchanged 1000-row rerenders during startup while checking every displayed/interaction-relevant field, and app-level guardrails stayed below a significant regression | `Memoize plant inventory rows for 75.0% fewer renders` |

## Round 18 Candidate Ideas

86. Memoize the `ThreeDGarden` canvas boundary so prop-stable Redux/resource
    churn in the designer does not ask the whole 3D canvas subtree to rerender
    during startup. Expected return: fewer real `ThreeDGarden` and
    parent-driven `GardenModel` renders in the 1000-plant default scene without
    changing canvas contents or interactions.
87. Memoize the `Bed` subtree so progressive-load state changes in
    `GardenModel` do not rerender the soil, frame, pointer, and texture
    children when their inputs are unchanged. Expected return: less startup CPU
    and soil render-texture setup work with identical bed geometry and
    materials.
88. Memoize the `Bot` subtree so load-progress renders and details reveals do
    not rerender the static FarmBot model when bot inputs are unchanged.
    Expected return: lower FarmBot startup CPU and fewer parent-driven renders
    while preserving all bot geometry, animations, and interactions.
89. Memoize the static environment subtree (`Sky`, `Sun`, `Ground`, and
    ambient lighting) behind a component boundary so later load-stage renders
    do not revisit the outdoor environment when config inputs are unchanged.
    Expected return: fewer startup rerenders and texture/material setup calls
    with the same visible environment.
90. Memoize the soil render-texture component with a field-aware comparator so
    unchanged soil/image/moisture inputs do not rebuild render-texture children
    during parent churn. Expected return: lower `imageTextureSetupMs` and fewer
    soil texture renders in the realistic default scene, with image and
    moisture toggles checked as guardrails.

## Round 18 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 86 | Memoize `ThreeDGarden` canvas boundary | Docker 1000-plant default scene, 3 measured runs after round 17 | 10 `ThreeDGarden` renders; 13 `GardenModel` renders; 5 soil texture renders; 4.053s full-ready; 3.191s core-ready; 7.98 ms frame p95; 2,412,492 encoded JS bytes | 5 `ThreeDGarden` renders; 9 `GardenModel` renders; 1 soil texture render; 4.075s full-ready; 3.180s core-ready; 8.02 ms frame p95; 2,412,561 encoded JS bytes | 50.0% fewer `ThreeDGarden` renders, removing 5 whole-canvas rerenders; 30.8% fewer `GardenModel` renders, removing 4 renders; 80.0% fewer soil texture renders; full-ready sampled 0.6% slower | Accepted; a one-line memo boundary removes real startup render churn and repeated soil render-texture passes with trivial code cost, while scene size, resources, FPS, and interaction guardrails stayed in the same band | `Memoize 3D garden canvas for 50.0% fewer renders` |
| 87 | Memoize `Bed` subtree | Docker 1000-plant default scene after item 86, 3 measured runs | 1 soil texture render; 52.3 ms image texture setup; 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 4.075s full-ready; 8.02 ms frame p95 | 1 soil texture render; 51.5 ms image texture setup; 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 4.078s full-ready; 7.97 ms frame p95 | No soil render-count or model/canvas render-count improvement; 1.5% faster image texture setup, saving 0.8 ms; full-ready sampled 0.1% slower | Rejected and rolled back; item 86 already removed the parent churn that mattered, so an extra `Bed` memo boundary added code without a meaningful remaining real-world payoff | None |
| 88 | Memoize `Bot` subtree | Docker 1000-plant default scene after item 86, 3 measured runs; first rerun with accidental moisture interpolation was discarded | 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 97 draw calls; 5,332,526 triangles; 4.075s full-ready; 3.180s core-ready; 442 ms FarmBot toggle | 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 97 draw calls; 5,332,526 triangles; 4.174s full-ready; 3.218s core-ready; 478 ms FarmBot toggle | No render-count, draw-call, or triangle improvement; 2.4% slower full-ready; 1.2% slower core-ready; 8.0% slower FarmBot toggle | Rejected and rolled back; the FarmBot subtree was not receiving meaningful extra parent-driven work after item 86, so wrapping it added no real payoff | None |
| 89 | Memoize static environment subtree | Docker 1000-plant default scene after item 86, 3 measured runs | 4.075s full-ready; 3.180s core-ready; 97 draw calls; 5,332,526 triangles; 110 WebGL geometries; 3 model resources; 2,412,561 encoded JS bytes | 4.062s full-ready; 3.208s core-ready; 97 draw calls; 5,332,526 triangles; 111 WebGL geometries; 4 model resources; 2,412,631 encoded JS bytes | 0.3% faster full-ready, saving 13.6 ms; 0.9% slower core-ready; no draw-call or triangle improvement; 70 more encoded JS bytes | Rejected and rolled back; the environment boundary did not clear 10%, did not reduce scene work, and added component structure for a noise-level load shift | None |
| 90 | Memoize soil render-texture component | Docker 1000-plant default scene after item 86, 3 measured runs | 1 soil texture render; 52.3 ms image texture setup; 4.075s full-ready; 3.180s core-ready; 110 WebGL geometries; 2,412,561 encoded JS bytes | 1 soil texture render; 53.9 ms image texture setup; 4.065s full-ready; 3.195s core-ready; 111 WebGL geometries; 2,412,690 encoded JS bytes | No soil render-count improvement; 3.1% slower image texture setup; 0.3% faster full-ready; 129 more encoded JS bytes | Rejected and rolled back; after item 86 the soil render-texture path was already down to one real render, so a comparator added complexity without reducing the measured work | None |

## Round 19 Candidate Ideas

91. Load only the ground texture needed by the active scene instead of loading
    Outdoor grass, Lab concrete, and Greenhouse bricks on every default 3D
    startup. Expected return: fewer default texture requests, lower GPU texture
    memory, and shorter load without lowering texture resolution or changing
    any visible material.
92. Split v1.8 FarmBot-only support/electronics paths away from v1.7-only GLB
    hooks so the Genesis XL v1.8 default scene does not request hidden legacy
    cable-support or LED models. Expected return: fewer model requests and less
    model parse/memory work with identical visible v1.8 geometry.
93. Load the promo `toolbay_3` GLB only when the 3D view is rendering promo
    tools instead of a real account's saved tool slots. Expected return: fewer
    unnecessary model bytes in the realistic Docker demo account while keeping
    promo rendering unchanged.
94. Cache parsed FarmBot SVG extrusion shapes across FarmBot layer remounts.
    Expected return: faster FarmBot layer re-enable after a user toggles the
    layer off and on, without changing extrusion geometry or startup visuals.
95. Disable raycasting for the plant spread instanced mesh while the spread
    overlay is inactive. Expected return: faster canvas pointer movement/click
    handling in the default 1000-plant scene while preserving spread overlay
    interaction whenever it is visible or in plant edit/add modes.

## Round 19 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 91 | Load only active ground texture | Docker 1000-plant default Outdoor scene, 3 measured full-load resource runs after round 18 | 12 texture resources; 2,615,499 encoded texture bytes; 24 WebGL textures; 4.0s full-ready; 97 draw calls; 5,332,526 triangles | 10 texture resources; 2,448,768 encoded texture bytes; 22 WebGL textures; 4.1s full-ready; 97 draw calls; 5,332,526 triangles | 16.7% fewer texture requests, removing the hidden Lab/Greenhouse ground textures; 166.7 KB fewer encoded texture bytes; 8.3% fewer WebGL textures; full-ready sampled 2.1% slower | Accepted; this removes two real unused default-scene texture loads with a small component split, while keeping the same active texture, material colors, geometry, draw calls, triangles, and scene object counts | `Load active ground texture for 16.7% fewer requests` |
| 92 | Split v1.8-only FarmBot model paths | Docker 1000-plant default scene after item 91, 3 measured full-load resource runs | 33 model resources; 946,112 encoded model bytes; 490 scene objects; 254 scene meshes; 4.1s full-ready; 97 draw calls | 31 model resources; 935,928 encoded model bytes; 477 scene objects; 246 scene meshes; 4.0s full-ready; 97 draw calls | 6.1% fewer model resources, removing two v1.7-only cable-support GLBs; 10.2 KB fewer encoded model bytes; 2.7% fewer scene objects; 3.1% fewer scene meshes; 1.6% faster full-ready | Rejected and rolled back; the measured savings were real but below 10% on the practical model/scene metrics, and 10 KB plus hidden-object cleanup was not worth splitting several FarmBot component paths | None |
| 93 | Load promo toolbay model only for promo tools | Docker 1000-plant default scene after item 91, 3 measured full-load resource runs | 33 model resources; 946,112 encoded model bytes; 4.1s full-ready; 3.2s core-ready; 97 draw calls; 490 scene objects | 32 model resources; 933,324 encoded model bytes; 4.1s full-ready; 3.2s core-ready; 97 draw calls; 490 scene objects | 3.0% fewer model resources, removing `toolbay_3.glb`; 12.8 KB fewer encoded model bytes; full-ready sampled 0.7% slower; core-ready sampled 1.2% slower | Rejected and rolled back; avoiding one small promo-only model request in the real-account path did not clear 10% or produce a meaningful absolute app-level gain | None |
| 94 | Cache FarmBot SVG shapes across layer remounts | Docker 1000-plant default scene after item 91, 3 measured FarmBot layer off/on re-enable runs | 679.9 ms FarmBot re-enable; 4.1s full-ready; 3.2s core-ready; 4 shape SVG resources; 4,828 encoded shape bytes | 666.0 ms FarmBot re-enable; 4.1s full-ready; 3.3s core-ready; 4 shape SVG resources; 4,828 encoded shape bytes | 2.0% faster FarmBot re-enable, saving 13.9 ms; full-ready sampled 1.9% slower; no SVG resource-count or byte reduction | Rejected and rolled back; normal browser/cache behavior already handles most of the remount cost, so module-level parsed shape cache state did not provide enough realistic interaction improvement | None |
| 95 | Disable inactive plant spread raycast | Docker 1000-plant default scene after item 91, 3 measured 180-event canvas pointer sweeps | 479.6 ms pointer sweep; 4.1s full-ready; 3.2s core-ready; 97 draw calls; 5,332,526 triangles | 481.0 ms pointer sweep; 4.2s full-ready; 3.3s core-ready; 97 draw calls; 5,332,526 triangles | 0.3% slower pointer sweep; full-ready sampled 2.8% slower; no draw-call, triangle, object, or texture improvement | Rejected and rolled back; disabling spread raycast while inactive did not reduce realistic canvas pointer handling time, so the extra event-state branch was not justified | None |

## Round 20 Candidate Ideas

96. Skip the `OpacityFilter` material-cloning wrapper for toolbay tools whose
    opacity is already 1. Expected return: less real startup material traversal,
    cloning, and heap churn in the default saved-tool scene, with identical
    visuals because only the mounted tool should be faded.
97. Register the rotary-tool frame callback only for the mounted rotary
    implement instead of every rendered tool. Expected return: fewer per-frame
    callbacks in the tool-heavy default scene and better frame timing, while
    preserving rotary animation whenever the rotary peripheral is active.
98. Memoize real-account tool slot conversion so startup/resource churn does
    not repeatedly sort and normalize the same saved slots. Expected return:
    less real render CPU in the default account with unchanged slot geometry,
    ordering, and navigation behavior.
99. Skip sensor moisture interpolation data generation while the interpolation
    overlay is hidden. Expected return: less designer-map startup/render work
    beside the 3D garden in the default scene, without changing sensor marker
    rendering or visible overlay behavior.
100. Memoize 2D sensor moisture filtering and interpolation options across
    stable inputs. Expected return: less repeated sensor-layer CPU during
    startup and layer toggles in realistic sensor-reading scenes, with the same
    markers, labels, and interpolation tiles.

## Round 20 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 96 | Skip no-op tool opacity cloning | Docker 1000-plant default scene after round 19, 3 measured runs | 4.040s full-ready; 3.128s core-ready; 7.98 ms frame p95; 97 draw calls; 5,332,526 triangles; 490 scene objects; 699 ms plant nav; 405 ms FarmBot toggle | 4.023s full-ready; 3.145s core-ready; 7.95 ms frame p95; 91 draw calls; 5,254,770 triangles; 483 scene objects; 723 ms plant nav; 470 ms FarmBot toggle | 0.4% faster full-ready, saving 16.2 ms; 0.5% slower core-ready; 6.2% fewer draw calls; 1.5% fewer triangles; 16.0% slower FarmBot toggle | Rejected and rolled back; removing no-op opacity wrappers reduced a few scene objects but did not clear 10% on a primary metric, saved only milliseconds at load, and worsened interaction guardrails enough that the extra rendering-path difference was not worth keeping | None |
| 97 | Scope rotary frame callback to rotary model | Docker 1000-plant default scene after round 19, 3 measured runs | 4.040s full-ready; 3.128s core-ready; 126.56 FPS median; 7.98 ms frame p95; 97 draw calls; 490 scene objects; 405 ms FarmBot toggle | 4.054s full-ready; 3.157s core-ready; 126.61 FPS median; 8.56 ms frame p95; 97 draw calls; 490 scene objects; 470 ms FarmBot toggle | 0.3% slower full-ready; 0.9% slower core-ready; 0.0% FPS change; 7.3% worse frame p95; 15.9% slower FarmBot toggle | Rejected and rolled back; fewer theoretical frame callbacks did not improve the real default scene and the added rotary component branch worsened the sampled frame/interaction guardrails | None |
| 98 | Memoize saved tool slot conversion | Docker 1000-plant default scene after round 19, 3 measured runs | 4.040s full-ready; 3.128s core-ready; 126.56 FPS median; 7.98 ms frame p95; 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 490 scene objects | 4.056s full-ready; 3.144s core-ready; 126.44 FPS median; 7.96 ms frame p95; 9 `GardenModel` renders; 5 `ThreeDGarden` renders; 490 scene objects | 0.4% slower full-ready; 0.5% slower core-ready; no render-count or scene-size improvement; 0.2% better frame p95 | Rejected and rolled back; the saved slot list is small and stable enough that memoizing its sort/normalization did not produce a meaningful realistic app win | None |
| 99 | Skip hidden sensor interpolation generation | Docker 1000-plant default scene after round 19, 3 measured runs with moisture overlay hidden | 4.040s full-ready; 3.128s core-ready; 126.56 FPS median; 7.98 ms frame p95; 490 scene objects; 0.0 ms 3D moisture surface work | 4.072s full-ready; 3.188s core-ready; 126.61 FPS median; 7.98 ms frame p95; 490 scene objects; 0.0 ms 3D moisture surface work | 0.8% slower full-ready; 1.9% slower core-ready; no scene, frame, or 3D moisture-work improvement | Rejected and rolled back; the hidden 2D interpolation generation was not a measurable default 3D startup bottleneck under the real Docker page | None |
| 100 | Memoize sensor-layer filtering/options | Docker 1000-plant scene with moisture map/readings enabled after round 19, 3 measured before runs | 4.853s full-ready; 3.911s core-ready; 97.0 ms frame p95; 1,002.4 ms `moistureSurfaceMs`; 112 WebGL geometries; 199 MB heap | Timed out waiting for 3D readiness during the first warmup after 180s | Benchmark did not complete; readiness regressed from under 5s to timeout | Rejected and rolled back; even a small hook/memo change in the sensor layer was not safe in the real moisture-map page, and the intended cached work was not the measured 1s 3D moisture bottleneck anyway | None |

## Round 21 Candidate Ideas

101. Mount the plant spread instanced mesh only while the spread overlay, plant
     edit mode, click-to-add mode, or a transient add plant is active. Expected
     return: fewer default-scene triangles and draw work from a hidden
     1000-instance sphere mesh, while preserving identical spread visuals and
     interactions whenever the spread feature is actually visible or active.
102. Replace interpolation-map nearest lookup, weighted numerator, and weighted
     denominator with one direct point-object scan using squared distances.
     Expected return: much faster enabled moisture-map generation in the
     realistic 1000-plant moisture benchmark with numerically equivalent
     interpolation results.
103. Generate interpolation grid cells with simple `for` loops instead of
     nested lodash `range().map()` allocation. Expected return: lower
     moisture-map generation CPU and garbage while producing the same grid
     coordinates and tile values.
104. Return freshly generated interpolation data from `generateData` and let
     the 3D moisture surface consume that array directly while still updating
     the shared localStorage cache. Expected return: less first-render
     serialization/parsing work without repeating the previously rejected cache
     bypass.
105. Build 3D moisture instance color and opacity buffers numerically instead
     of converting each tile through CSS color strings and `THREE.Color`.
     Expected return: lower moisture instance-buffer setup time in the enabled
     moisture-map scene with the same blue/transparent color ramp.

## Round 21 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 101 | Mount plant spread mesh only while active | Docker 1000-plant default scene after round 20, 3 measured runs with spread toggle guardrail | 4.003s full-ready; 3.107s core-ready; 97 draw calls; 5,332,526 triangles; 490 scene objects; 9 instanced meshes; 562 ms spread toggle | 4.024s full-ready; 3.120s core-ready; 97 draw calls; 5,332,526 triangles; 490 scene objects; 9 instanced meshes; 577 ms spread toggle | 0.5% slower full-ready; 0.4% slower core-ready; no draw-call, triangle, object, or instanced-mesh reduction; 2.6% slower spread toggle | Rejected and rolled back; the realistic benchmark state still legitimately mounted the spread mesh, so the inactive gate produced no scene-size win and only added conditional complexity | None |
| 102 | One-pass interpolation point scan | Docker 1000-plant scene with moisture map/readings enabled after item 101 rollback, 3 measured runs | 1,023.4 ms `moistureSurfaceMs`; 4.845s full-ready; 3.940s core-ready; 108.5 ms frame p95; 3.9 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 54.7 ms `moistureSurfaceMs`; 4.042s full-ready; 3.142s core-ready; 8.0 ms frame p95; 26.4 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 94.7% faster moisture interpolation, saving 968.7 ms; 16.6% faster full-ready, saving 803.2 ms; 20.2% faster core-ready; 92.6% better frame p95; moisture buffer setup 22.5 ms slower | Accepted; replacing sort plus duplicate weighted passes with one direct point-object scan removes the real moisture-map CPU bottleneck, while scene/resource metrics stayed unchanged and the small buffer-time increase is dwarfed by the near-second interpolation saving | `Optimize moisture interpolation scan for 94.7% faster maps` |
| 103 | Direct interpolation grid loops | Docker 1000-plant scene with moisture map/readings enabled after item 102, 3 measured runs | 54.7 ms `moistureSurfaceMs`; 4.042s full-ready; 3.142s core-ready; 8.0 ms frame p95; 26.4 ms moisture instance buffers | 54.0 ms `moistureSurfaceMs`; 4.014s full-ready; 3.139s core-ready; 8.0 ms frame p95; 26.1 ms moisture instance buffers | 1.3% faster moisture interpolation, saving 0.7 ms; 0.7% faster full-ready; no meaningful frame or buffer improvement | Rejected and rolled back; after item 102, lodash range allocation is not a meaningful realistic bottleneck, and the absolute saving is below the complexity threshold | None |
| 104 | Return generated interpolation data directly | Docker 1000-plant scene with moisture map/readings enabled after item 102, 3 measured runs | 54.7 ms `moistureSurfaceMs`; 4.042s full-ready; 3.142s core-ready; 8.0 ms frame p95; 26.4 ms moisture instance buffers | 54.2 ms `moistureSurfaceMs`; 3.997s full-ready; 3.155s core-ready; 8.0 ms frame p95; 25.8 ms moisture instance buffers | 0.9% faster moisture interpolation, saving 0.5 ms; 1.1% faster full-ready; 0.4% slower core-ready; no meaningful frame or buffer improvement | Rejected and rolled back; preserving the shared cache while returning fresh data avoided almost no realistic work after item 102, so the API shape change was not worth keeping | None |
| 105 | Numeric moisture color/opacity buffers | Docker 1000-plant scene with moisture map/readings enabled after item 102, 3 measured runs | 26.4 ms moisture instance buffers; 54.7 ms `moistureSurfaceMs`; 81.1 ms combined moisture setup; 4.042s full-ready; 8.0 ms frame p95; 112 WebGL geometries | 3.0 ms moisture instance buffers; 58.8 ms `moistureSurfaceMs`; 61.8 ms combined moisture setup; 4.024s full-ready; 8.0 ms frame p95; 112 WebGL geometries | 88.6% faster buffer setup, saving 23.4 ms; 23.8% faster combined moisture setup, saving 19.3 ms; 7.5% slower interpolation, adding 4.1 ms; 0.5% faster full-ready | Accepted; replacing per-tile CSS color parsing with the same numeric blue/opacity ramp removes a frame-budget-sized buffer cost with unchanged scene/resource metrics and no visible color-ramp change | `Build moisture buffers numerically for 88.6% faster setup` |

## Round 22 Candidate Ideas

106. Fast-path the default inverse-distance weight calculation when the
     interpolation power is 4. Expected return: lower enabled moisture-map
     generation time by avoiding exponent work in the real per-tile inner loop
     while preserving the same weighted interpolation result.
107. Select the most recent interpolation point per rounded location in one
     pass. Expected return: less enabled moisture-map setup CPU by replacing
     repeated object-key scans and per-location sorting with direct latest-item
     tracking for the same realistic sensor-reading set.
108. Store interpolation point coordinates and values in numeric arrays before
     scanning grid cells. Expected return: lower enabled moisture-map
     generation CPU from simpler hot-loop reads while keeping the same
     interpolation math and grid resolution.
109. Mount water-stream meshes and texture animation callbacks only while water
     is flowing. Expected return: fewer hidden tube geometries, materials, and
     idle frame callbacks in the default water-off 3D scene, with identical
     transparent tubing and the same animated water when the peripheral is on.
110. Render the static sun without registering the season-animation frame loop
     when season animation is disabled. Expected return: less idle per-frame
     work in the default scene while preserving the same static sun position,
     lighting, sky color, and debug objects.

## Round 22 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 106 | Fast-path default interpolation weight | Docker 1000-plant scene with moisture map/readings enabled after round 21, 3 measured runs | 58.8 ms `moistureSurfaceMs`; 4.044s full-ready; 3.148s core-ready; 7.94 ms frame p95; 2.9 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 55.7 ms `moistureSurfaceMs`; 4.036s full-ready; 3.151s core-ready; 7.99 ms frame p95; 2.7 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 5.3% faster moisture interpolation, saving 3.1 ms; 0.2% faster full-ready; 0.5% worse frame p95; scene/resource metrics unchanged | Rejected and rolled back; the default-power fast path moved the hot loop in the right direction, but the realistic saving was below 10% and only a few milliseconds, so the extra branch was not worth keeping | None |
| 107 | One-pass most-recent point selection | Docker 1000-plant scene with moisture map/readings enabled after item 106 rollback, 3 measured runs plus a 3-run confirmation for frame guardrails | 58.8 ms `moistureSurfaceMs`; 4.044s full-ready; 3.148s core-ready; 7.94 ms frame p95; 2.9 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 28.4 ms `moistureSurfaceMs`; 4.085s full-ready; 3.188s core-ready; 7.98 ms frame p95; 3.6 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 51.7% faster moisture interpolation, saving 30.4 ms; full-ready 1.0% slower; core-ready 1.3% slower; frame p95 0.4% worse; buffer setup 0.7 ms slower; scene/resource metrics unchanged | Accepted; replacing repeated object-key scans and per-location sorts with direct latest-item tracking removes a real half-frame moisture-map setup cost, while the confirmation run showed frame timing back in the baseline band and app-level load/resource metrics stayed stable | `Select latest interpolation points for 51.7% faster maps` |
| 108 | Numeric interpolation point arrays | Docker 1000-plant scene with moisture map/readings enabled after item 107, 3 measured runs | 28.4 ms `moistureSurfaceMs`; 4.085s full-ready; 3.188s core-ready; 7.98 ms frame p95; 3.6 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 26.5 ms `moistureSurfaceMs`; 3.990s full-ready; 3.133s core-ready; 7.97 ms frame p95; 2.9 ms moisture instance buffers; 97 draw calls; 112 WebGL geometries | 6.7% faster moisture interpolation, saving 1.9 ms; 2.3% faster full-ready; 1.7% faster core-ready; buffer setup 0.7 ms faster; scene/resource metrics unchanged | Rejected and rolled back; numeric arrays shaved a couple of milliseconds from the remaining hot loop, but the realistic improvement was below 10% and too small to justify changing a simple object-array helper into a custom packed-array representation | None |
| 109 | Mount water streams only while flowing | Docker 1000-plant default water-off scene after item 107, 3 measured runs | 490 scene objects; 254 scene meshes; 110 WebGL geometries; 97 draw calls; 5,332,526 triangles; 3.986s full-ready; 7.94 ms frame p95 | 485 scene objects; 249 scene meshes; 110 WebGL geometries; 97 draw calls; 5,332,526 triangles; 4.072s full-ready; 7.96 ms frame p95 | 1.0% fewer scene objects and 2.0% fewer meshes, removing five hidden water-stream meshes; no draw-call, geometry, triangle, FPS, or frame improvement; full-ready 2.2% slower | Rejected and rolled back; gating the invisible water streams cleaned up a few scene nodes but did not move a meaningful real runtime metric, so it was not worth adding conditional mounting behavior | None |
| 110 | Static sun without idle animation frame | Docker 1000-plant default scene after item 109 rollback, 3 measured runs | 3.986s full-ready; 3.111s core-ready; 7.94 ms frame p95; 126.46 FPS median; 490 scene objects; 97 draw calls; 5,332,526 triangles | 4.033s full-ready; 3.155s core-ready; 8.00 ms frame p95; 126.48 FPS median; 490 scene objects; 97 draw calls; 5,332,526 triangles | 1.2% slower full-ready; 1.4% slower core-ready; 0.8% worse frame p95; no FPS, scene-size, draw-call, or triangle improvement | Rejected and rolled back; removing the default no-op sun frame callback did not improve real frame timing or load metrics, so splitting the static and animated sun paths would add complexity without app-visible performance value | None |

## Round 23 Candidate Ideas

111. Memoize 3D soil texture setup inputs inside `ImageTexture` so stable
     sensor/image/config props are not re-keyed and re-filtered on every normal
     startup rerender. Expected return: lower default-scene startup CPU by
     reducing the measured `imageTextureSetupMs` cost, with identical texture
     keys and overlays when the underlying inputs change.
112. Use the loaded soil texture directly for the default static-soil case when
     images, moisture overlays, debug soil materials, mirroring, and soil tint
     do not require an offscreen `RenderTexture`. Expected return: less texture
     setup and one fewer offscreen soil render in the ordinary default scene,
     while retaining the same full-resolution soil texture.
113. Split the hidden solar-panel path so the default scene skips solar spring
     setup until solar is visible or a focus transition requires it. Expected
     return: less details-stage render CPU in the default non-solar scene while
     preserving the same fade behavior whenever solar is shown.
114. Avoid mounting `GroupOrderVisual` on non-group routes before it checks the
     current URL. Expected return: less default details-stage route/group work
     in ordinary plant, point, and weed views, while preserving group ordering
     visuals on group and zone detail routes.
115. Stop rebuilding plant icon buckets when only the plant layer visibility
     flag changes. Expected return: faster realistic Plants layer toggles by
     keeping the same 1000-plant icon grouping and updating only visibility,
     with unchanged click targets, textures, and billboarding.

## Round 23 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 111 | Memoize image texture setup inputs | Docker 1000-plant default scene after round 22, 3 measured runs | 55.4 ms `imageTextureSetupMs`; 3.974s full-ready; 3.103s core-ready; 7.97 ms frame p95; 97 draw calls; 5,332,526 triangles; 650.5 ms Plants toggle | 54.2 ms `imageTextureSetupMs`; 3.928s full-ready; 3.074s core-ready; 7.97 ms frame p95; 97 draw calls; 5,332,526 triangles; 684.8 ms Plants toggle | 2.2% faster image texture setup, saving 1.2 ms; 1.1% faster full-ready; 0.9% faster core-ready; Plants toggle 5.3% slower; scene metrics unchanged | Rejected and rolled back; the setup work was not being repeated enough in the real startup path for memoization to matter, and the absolute saving was too small to justify added hook dependency complexity | None |
| 112 | Direct static soil texture fast path | Docker 1000-plant default scene after item 111 rollback, 3 measured runs | 55.4 ms `imageTextureSetupMs`; 3.974s full-ready; 3.103s core-ready; 1 soil texture render; 110 WebGL geometries; 22 WebGL textures; 97 draw calls | 56.9 ms `imageTextureSetupMs`; 4.044s full-ready; 3.163s core-ready; 1 soil texture render; 110 WebGL geometries; 22 WebGL textures; 97 draw calls | 2.7% slower image texture setup; 1.8% slower full-ready; 1.9% slower core-ready; no soil render, geometry, texture, or draw-call reduction | Rejected and rolled back; the real default scene still needed the existing offscreen soil texture path, so the guarded fast path did not activate and only added conditional code | None |
| 113 | Split hidden solar spring setup | Docker 1000-plant moisture-map scene after item 112 rollback, compared to the existing post-round-22 moisture-map baseline because the trial run landed with moisture map enabled | 4.085s full-ready; 3.188s core-ready; 7.98 ms frame p95; 43.5 ms `imageTextureSetupMs`; 28.4 ms `moistureSurfaceMs`; 112 WebGL geometries; 708.5 ms Plants toggle | 3.995s full-ready; 3.117s core-ready; 7.98 ms frame p95; 41.9 ms `imageTextureSetupMs`; 28.4 ms `moistureSurfaceMs`; 112 WebGL geometries; 694.8 ms Plants toggle | 2.2% faster full-ready, saving 89.7 ms; 2.2% faster core-ready; 3.7% faster image texture setup; moisture and scene metrics unchanged; no primary metric cleared 10% | Rejected and rolled back; skipping hidden solar spring setup was directionally positive in this sampled context but below threshold, and the added split component was not worth keeping for a hidden feature that is not a real default bottleneck | None |
| 114 | Gate group-order visualization by route | Docker 1000-plant default scene after item 113 rollback, 3 measured runs | 3.974s full-ready; 3.103s core-ready; 7.97 ms frame p95; 55.4 ms `imageTextureSetupMs`; 490 scene objects; 97 draw calls; 650.5 ms Plants toggle | 4.072s full-ready; 3.186s core-ready; 7.96 ms frame p95; 55.3 ms `imageTextureSetupMs`; 490 scene objects; 97 draw calls; 710.1 ms Plants toggle | 2.5% slower full-ready; 2.7% slower core-ready; no meaningful frame, setup, scene-size, or draw-call improvement; Plants toggle 9.2% slower | Rejected and rolled back; `GroupOrderVisual` already exits cheaply on non-group routes, so moving the route gate outward added code without a realistic performance win | None |
| 115 | Keep plant icon buckets across visibility changes | Docker 1000-plant default scene after item 114 rollback, 3 measured runs | 650.5 ms Plants toggle; 3.974s full-ready; 3.103s core-ready; 7.97 ms frame p95; 97 draw calls; 5,332,526 triangles; 9 instanced meshes | 694.7 ms Plants toggle; 4.081s full-ready; 3.207s core-ready; 8.63 ms frame p95; 97 draw calls; 5,332,526 triangles; 9 instanced meshes | 6.8% slower Plants toggle; 2.7% slower full-ready; 3.3% slower core-ready; 8.2% worse frame p95; no draw-call, triangle, or instanced-mesh improvement | Rejected and rolled back; plant icon bucketing was not the real toggle bottleneck, and keeping the visibility prop outside the bucket memo worsened the measured interaction path | None |

## Round 24 Candidate Ideas

116. Split the inactive pointer-preview path so ordinary designer routes do not
     scan all map points for grid previews or resolve/load a crop icon before
     returning no hover objects. Expected return: lower default startup/render
     CPU in the 1000-point scene, with identical hover previews in
     click-to-add, create-point, and create-weed modes.
117. Guard plant hover-label state updates so pointer moves over the same
     plant instance do not enqueue redundant React state work. Expected
     return: faster realistic canvas pointer sweeps while preserving the same
     hover label behavior and click targets.
118. Cache atlas sub-texture clones per base texture and icon. Expected
     return: less startup texture allocation and lower WebGL texture churn in
     plant-heavy scenes with repeated crop icons, while preserving the same
     atlas, UV transform, and full-resolution plant icons.
119. Avoid active-crop spread lookup in `PlantSpreadInstances` unless the
     current mode can actually use click-to-add or edit spread data. Expected
     return: less default startup/render CPU without changing spread visuals or
     overlap behavior in active plant-add/edit workflows.
120. Use a static-color plant spread material outside click-to-add/edit modes
     so the default spread layer does not allocate or update per-instance color
     buffers when every visible spread sphere has the same color. Expected
     return: lower plant-spread setup work and memory with unchanged visible
     spread color in ordinary viewing mode.

## Round 24 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 116 | Split inactive pointer-preview path | Docker 1000-plant default scene after round 23, 3 measured runs | 4.358s full-ready; 3.495s core-ready; 8.51 ms frame p95; 55.7 ms image texture setup; 97 draw calls; 490 scene objects; 687 ms plant nav; 248 ms point nav | 4.019s full-ready; 3.130s core-ready; 7.97 ms frame p95; 55.8 ms image texture setup; 97 draw calls; 490 scene objects; 707 ms plant nav; 295 ms point nav | Apparent 7.8% faster full-ready and 10.4% faster core-ready, but targeted setup/scene metrics were flat; point nav 19.2% slower and spread toggle 11.4% slower | Rejected and rolled back; the measured load movement matched same-round startup noise rather than a real pointer-preview bottleneck, and the route split did not reduce texture, scene, draw-call, or realistic interaction work | None |
| 117 | Guard duplicate plant hover state updates | Docker 1000-plant pointer sweep over the 3D canvas, 180 realistic mouse moves, 3 measured runs | 2,258.9 ms pointer sweep; 14.33 ms frame p95; 157 `GardenModel` renders | 2,248.6 ms pointer sweep; 14.17 ms frame p95; 145 `GardenModel` renders | 0.5% faster pointer sweep, saving 10.3 ms across the full sweep; 1.1% better frame p95; 7.6% fewer `GardenModel` renders | Rejected and rolled back; the render-count drop did not translate into a meaningful user-facing pointer response improvement under realistic movement, so the extra ref/state guard was not worth keeping | None |
| 118 | Cache atlas sub-texture clones | Docker 1000-plant default scene after item 117 rollback, 3 measured runs | 55.7 ms image texture setup; 22 WebGL textures; 4.358s full-ready; 8.51 ms frame p95; 97 draw calls; 490 scene objects | 52.3 ms image texture setup; 22 WebGL textures; 3.987s full-ready; 7.97 ms frame p95; 97 draw calls; 490 scene objects | 6.1% faster image texture setup, saving 3.4 ms; no texture-count, scene-size, draw-call, or stable frame improvement | Rejected and rolled back; the realistic atlas path was not cloning enough textures for a cache to matter, and a few milliseconds of noisy setup movement did not justify persistent texture-cache complexity | None |
| 119 | Avoid inactive active-crop spread lookup | Docker 1000-plant default scene after item 118 rollback, 3 measured runs | 0.60 ms spread frame update; 4.358s full-ready; 3.495s core-ready; 8.51 ms frame p95; 97 draw calls; 490 scene objects | 0.50 ms spread frame update; 4.142s full-ready; 3.332s core-ready; 7.97 ms frame p95; 97 draw calls; 490 scene objects | 16.7% faster spread update but only 0.10 ms absolute saving; no scene/draw-call reduction; plant nav 4.1% slower and FarmBot toggle 9.9% slower | Rejected and rolled back; skipping one ordinary-mode crop lookup did not move a meaningful app metric, and the sub-millisecond absolute saving was below the complexity threshold | None |
| 120 | Static-color spread material outside add/edit | Docker 1000-plant default scene after item 119 rollback, 3 measured runs, sanity-checked against the stable same-round original-material controls from items 116-119 | Opening baseline: 126.63 FPS median, 8.51 ms frame p95, 0.60 ms spread update; stable original-material controls: about 7.97 ms frame p95 | 135.11 FPS median; 7.43 ms frame p95; 0.50 ms spread update; 97 draw calls; 490 scene objects; 22 WebGL textures | 12.8% better frame p95 versus the noisy opening baseline, but only about 6.8% versus the stable same-round controls; 6.7% higher FPS; 0.10 ms spread-update saving | Rejected and rolled back; the realistic control comparison did not clear the 10% bar, and the only qualifying-looking metric came from baseline noise while the absolute spread-work saving was too small for mode/material switching complexity | None |

## Round 25 Candidate Ideas

121. Share one animated water texture and one frame callback across the 16
     active watering streams instead of loading and animating the same texture
     in every stream. Expected return: far fewer texture-load calls, WebGL
     texture objects, and per-frame callbacks while preserving the same water
     animation at the real 16-stream scale.
122. Replace the camera-selection hover raycast that runs every frame with
     pointer handlers on the camera markers themselves. Expected return:
     fewer active camera-selection frame calls and raycast calls while keeping
     the same hover colors and click behavior.
123. Mount weed instance meshes only while the Weed layer is visible or after
     the user has revealed it once. Expected return: less default-scene hidden
     texture, matrix, and object setup while keeping the first real Weed-layer
     reveal and subsequent toggles visually identical.
124. Avoid calculating camera-view frustum points when the 3D camera-view area
     is disabled. Expected return: less default FarmBot render CPU from hidden
     camera-view vector math, with identical frustum geometry whenever the
     camera-view overlay is actually enabled.
125. Build point instance buckets with indexed loops and direct bucket arrays
     instead of per-point callback/object-value churn. Expected return: faster
     realistic point-layer setup and point navigation in the 1000-point scene
     while preserving the same marker, radius, color, and click behavior.

## Round 25 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
| 121 | Share water-flow texture and frame callback | Real `WateringAnimations` water-on render at the shipped 16-stream scale, with `TextureLoader.load` and `useFrame` call counts measured through Bun/Testing Library | 16 visible water streams; 16 water texture load calls; 16 frame callbacks | 16 visible water streams; 1 water texture load call; 2 frame callbacks | 93.8% fewer water texture load calls, removing 15 duplicate loads; 87.5% fewer frame callbacks, removing 14 per-frame registrations | Accepted; the same 16 animated streams share the same water texture and offset animation, so the visible water effect is unchanged while the real water-on setup and per-frame work are materially lower | `Share watering texture for 93.8% fewer loads` |
| 122 | Use pointer handlers for camera-selection hover | Real `CameraSelectionUI` with camera selection active, 12 shipped markers mounted, and one second of 60 frame ticks measured through Bun/test-renderer | 1 registered frame callback; 60 `setFromCamera` calls; 60 `intersectObjects` calls | 0 registered frame callbacks; 0 `setFromCamera` calls; 0 `intersectObjects` calls | 100% fewer camera-selection raycast calls, removing 120 raycaster operations per active second | Accepted; marker pointer handlers preserve hover colors and click behavior while deleting the active per-frame polling loop and its marker-ref bookkeeping | `Use camera marker events for 100% fewer raycasts` |
| 123 | Lazy-mount weed instances after first reveal | Docker 1000-plant default scene, 3 measured runs; default Weed layer remained visible, so comparable target metrics were scene size, load readiness, and Weed toggle timing | 3.732s full-ready; 2.842s core-ready; 7.97 ms frame p95; 97 draw calls; 490 scene objects; 9 instanced meshes; 430 ms Weed toggle | 4.048s full-ready; 3.177s core-ready; 8.20 ms frame p95; 97 draw calls; 490 scene objects; 9 instanced meshes; 468 ms Weed toggle | 8.5% slower full-ready; 11.8% slower core-ready; unchanged scene/draw-call metrics; 8.9% slower Weed toggle | Rejected and rolled back; the realistic default scene already shows weeds, so the lazy-mount gate added state complexity without reducing mounted objects or improving load/toggle behavior | None |
| 124 | Skip camera-view point math when hidden | Realistic 10 disabled `CameraView` renders, matching the observed order of load-time renders, sampled 20 times through Bun/Testing Library | 0.266 ms render median; 0.043 ms camera-view point math across 10 renders; 200 lens-position clone calls across all samples | 0.248 ms render median; 0 lens-position clone calls | 6.6% faster render, saving 0.018 ms across 10 renders; point math eliminated but the absolute avoided work was only about 0.043 ms per 10 renders | Rejected and rolled back; below the 10% threshold and the absolute saving is too small to matter in the app despite the code looking superficially cleaner | None |
| 125 | Build point instance buckets with direct bucket arrays | Realistic 1000-point `PointInstances` render, sampled 20 times through Bun/test-renderer | 0.756 ms median | 0.803 ms median | 6.2% slower | Rejected and rolled back; the direct-loop bucket list was slower at the shipped stress scale, so the existing `forEach`/`Object.values` path stays | None |

## Round 26 Candidate Ideas

126. Replace generated static fallback `InstancedMesh` lists in merged FarmBot
     part components with one data-driven fallback renderer. Expected return:
     smaller FarmBot JavaScript chunks and less parse/compile work while the
     normal merged-geometry render path and fallback geometry remain identical.
127. Avoid loading the promo `toolbay3` model when real tool slots are provided.
     Expected return: one fewer GLTF hook/model request in normal configured
     gardens, with unchanged promo toolbay rendering when demo slots are used.
128. Avoid loading v1.7 cable-carrier support models on v1.8 kits that use
     generated extrusion supports. Expected return: two fewer unused GLTF
     hook/model requests for the Genesis XL v1.8 stress context, with unchanged
     v1.7 support rendering.
129. Avoid loading the electronics-box LED model on v1.8 kits where LEDs are not
     rendered. Expected return: one fewer unused GLTF hook/model request in the
     default v1.8 FarmBot model, with unchanged v1.7 LED rendering.
130. Register the rotary-tool animation frame callback only for rendered rotary
     tool models instead of every tool slot. Expected return: fewer steady-state
     `useFrame` callbacks in normal tool-slot layouts while preserving rotary
     animation when the mounted rotary tool is active.

## Round 26 Results

| # | Idea | Benchmark | Before | After | Change | Outcome | Commit |
|---|------|-----------|--------|-------|--------|---------|--------|
