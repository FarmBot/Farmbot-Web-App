import { chromium } from "playwright";
import { mkdir, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { basename, join, resolve, sep } from "node:path";
import {
  DEFAULT_SCENE_OBJECT, SCENE_OBJECT_CATALOG_SCENES,
  sceneObjectThumbnailFilename,
} from "../frontend/three_d_garden/scenes/scene_object_data";

const ROOT = resolve(import.meta.dir, "..");
const PUBLIC = join(ROOT, "public");
const OUTPUT = join(PUBLIC, "app-resources", "img", "scene_objects");
const ENTRYPOINT = join(import.meta.dir, "scene_object_thumbnail_renderer.tsx");
const ROTATED_SHAPES = new Set(["astronaut", "hab", "rover"]);
const requestedThumbnail = process.argv[2]?.toLowerCase().replace(/\.png$/, "");

const targets = [
  {
    scene: "custom",
    sceneObjects: [{ ...DEFAULT_SCENE_OBJECT, name: "Custom Scene Object" }],
  },
  {
    scene: "greenhouse",
    sceneObjects: SCENE_OBJECT_CATALOG_SCENES.greenhouse,
  },
  { scene: "lab", sceneObjects: SCENE_OBJECT_CATALOG_SCENES.lab },
  { scene: "outdoor", sceneObjects: SCENE_OBJECT_CATALOG_SCENES.outdoor },
  { scene: "mars", sceneObjects: SCENE_OBJECT_CATALOG_SCENES.mars },
];

const filenames = targets.flatMap(target =>
  target.sceneObjects.map(sceneObject =>
    sceneObjectThumbnailFilename(sceneObject.name)));
if (new Set(filenames).size != filenames.length) {
  throw new Error("Scene object names must produce unique thumbnail filenames.");
}

const renderTargets = targets.flatMap(target =>
  target.sceneObjects.map((sceneObject, index) => ({
    index,
    scene: target.scene,
    sceneObject,
    filename: sceneObjectThumbnailFilename(sceneObject.name),
  })))
  .filter(target => !requestedThumbnail || [
    target.sceneObject.name.toLowerCase(),
    target.filename.toLowerCase().replace(/\.png$/, ""),
  ].includes(requestedThumbnail));

if (renderTargets.length == 0) {
  throw new Error(`Unknown scene object thumbnail: ${process.argv[2]}`);
}

const temporaryDirectory = await mkdtemp(join(tmpdir(), "scene-object-renderer-"));
const build = await Bun.build({
  entrypoints: [ENTRYPOINT],
  outdir: temporaryDirectory,
  target: "browser",
  minify: true,
  define: { "process.env.NODE_ENV": JSON.stringify("production") },
});

if (!build.success || !build.outputs[0]) {
  build.logs.forEach(log => console.error(log));
  throw new Error("Unable to build the scene object thumbnail renderer.");
}

const bundle = build.outputs.find(output => output.path.endsWith(".js"));
if (!bundle) {
  throw new Error("The thumbnail renderer build did not produce JavaScript.");
}
const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <style>
      html, body, #root { width: 512px; height: 512px; margin: 0; }
      body { overflow: hidden; background: #f4f4f4; }
      canvas { display: block; }
    </style>
  </head>
  <body>
    <div id="root"></div>
    <script>globalThis.globalConfig = {};</script>
    <script type="module" src="/${basename(bundle.path)}"></script>
  </body>
</html>`;

const server = Bun.serve({
  port: 0,
  async fetch(request) {
    const pathname = decodeURIComponent(new URL(request.url).pathname);
    if (pathname == "/") {
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }
    if (pathname == `/${basename(bundle.path)}`) {
      return new Response(Bun.file(bundle.path));
    }
    const publicPath = resolve(PUBLIC, `.${pathname}`);
    if (publicPath.startsWith(`${PUBLIC}${sep}`)) {
      const file = Bun.file(publicPath);
      if (await file.exists()) {
        return new Response(file);
      }
    }
    return new Response("Not found", { status: 404 });
  },
});

if (!requestedThumbnail) {
  await rm(OUTPUT, { recursive: true, force: true });
}
await mkdir(OUTPUT, { recursive: true });
process.stdout.write(`Rendering ${renderTargets[0].filename}...`);
const browser = await chromium.launch({
  headless: false,
  args: ["--enable-webgl", "--use-gl=swiftshader"],
});
const page = await browser.newPage({ viewport: { width: 512, height: 512 } });

try {
  let first = true;
  for (const target of renderTargets) {
    if (!first) {
      process.stdout.write(`Rendering ${target.filename}...`);
    }
    first = false;
    const query = new URLSearchParams({
      scene: target.scene,
      index: `${target.index}`,
    });
    if (ROTATED_SHAPES.has(target.sceneObject.shape)) {
      query.set("rotation", "180");
    }
    await page.goto(`http://localhost:${server.port}/?${query}`, {
      waitUntil: "networkidle",
    });
    const canvas = page.locator("canvas");
    await canvas.waitFor({ state: "visible" });
    await page.waitForTimeout(250);
    await canvas.screenshot({ path: join(OUTPUT, target.filename) });
    console.log("done");
  }
} finally {
  await page.close();
  await browser.close();
  await server.stop(true);
  await rm(temporaryDirectory, { recursive: true, force: true });
}
