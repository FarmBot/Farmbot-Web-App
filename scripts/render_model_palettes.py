#!/usr/bin/env python3
r"""Render GLB geometry and its palette swatches or solid material groups.

Run from the project root:
    python3 scripts/render_model_palettes.py
    python3 scripts/render_model_palettes.py public/3D/models/cross_slide.glb
    python3 scripts/render_model_palettes.py --mesh 0 --azimuth 45

Requires DracoPy, numpy, Pillow, and matplotlib. To install analysis-only copies:
    python3 -m pip install --target .cache/model_palette_analysis/dependencies \
        DracoPy numpy Pillow matplotlib

Defaults to every GLB under public/3D/models, sorted by path.
Output defaults to .cache/model_palettes/. False colors identify zero-based palette
columns or solid material indices; they are not the original material colors.
The largest mesh is selected by default. Node transforms and GPU instances are omitted, so use --mesh to inspect
separate hardware meshes (for example, cross_slide.glb --mesh 0).
"""

import argparse
import io
import json
import math
import os
from pathlib import Path
import struct
import sys


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_MODELS = sorted((ROOT / "public/3D/models").rglob("*.glb"))


def read_glb(data: bytes) -> tuple[dict, bytes]:
    """Read embedded JSON and binary chunks from a GLB 2 file."""
    if len(data) < 12:
        raise ValueError("GLB header is truncated")
    magic, version, length = struct.unpack_from("<4sII", data)
    if magic != b"glTF" or version != 2:
        raise ValueError("Expected a GLB version 2 file")
    if length != len(data):
        raise ValueError("GLB length does not match its header")
    document = None
    binary = b""
    offset = 12
    while offset < length:
        if offset + 8 > length:
            raise ValueError("GLB chunk header is truncated")
        size, kind = struct.unpack_from("<I4s", data, offset)
        offset += 8
        end = offset + size
        if end > length:
            raise ValueError("GLB chunk data is truncated")
        if kind == b"JSON":
            document = json.loads(data[offset:end])
        elif kind == b"BIN\x00":
            binary = data[offset:end]
        offset = end
    if document is None:
        raise ValueError("GLB has no JSON chunk")
    if not binary:
        raise ValueError("GLB has no embedded binary chunk")
    return document, binary


def mesh_index(document: dict, requested: int | None = None) -> int:
    """Select an explicit mesh, or the one with the most triangle indices."""
    meshes = document.get("meshes", [])
    if not meshes:
        raise ValueError("GLB has no meshes")
    if requested is not None:
        if requested < 0 or requested >= len(meshes):
            raise ValueError(f"Mesh index must be between 0 and {len(meshes) - 1}")
        return requested
    accessors = document["accessors"]

    def size(mesh):
        return sum(
            accessors[primitive.get(
                "indices", primitive["attributes"]["POSITION"],
            )]["count"]
            for primitive in mesh["primitives"]
        )

    return max(range(len(meshes)), key=lambda index: size(meshes[index]))


def buffer_view(document: dict, binary: bytes, index: int) -> bytes:
    view = document["bufferViews"][index]
    if view.get("buffer", 0) != 0:
        raise ValueError("External buffers are not supported")
    start = view.get("byteOffset", 0)
    end = start + view["byteLength"]
    if start < 0 or end > len(binary):
        raise ValueError("Buffer view extends beyond the embedded binary chunk")
    return binary[start:end]


def palette_columns(document: dict, binary: bytes, material: dict) -> int:
    """Count four-pixel palette columns; zero means a solid material."""
    texture_info = material.get("pbrMetallicRoughness", {}).get("baseColorTexture")
    if texture_info is None:
        return 0
    from PIL import Image
    texture = document["textures"][texture_info["index"]]
    image_index = texture.get("source")
    if image_index is None:
        image_index = texture["extensions"]["EXT_texture_webp"]["source"]
    image_view = document["images"][image_index]["bufferView"]
    image = Image.open(io.BytesIO(buffer_view(document, binary, image_view)))
    if image.width % 4:
        raise ValueError("Expected a palette texture with four-pixel columns")
    return image.width // 4


def render_model(path: Path, output_dir: Path, args) -> Path:
    import DracoPy
    import matplotlib.pyplot as plt
    from mpl_toolkits.mplot3d.art3d import Poly3DCollection
    import numpy as np

    document, binary = read_glb(path.read_bytes())
    selected = mesh_index(document, args.mesh)
    mesh = document["meshes"][selected]
    material = document["materials"][mesh["primitives"][0]["material"]]
    columns = palette_columns(document, binary, material)
    triangles = []
    swatches = []
    for primitive in mesh["primitives"]:
        compression = primitive.get("extensions", {}).get(
            "KHR_draco_mesh_compression",
        )
        if compression is None:
            raise ValueError("Expected Draco-compressed model geometry")
        decoded = DracoPy.decode(buffer_view(
            document, binary, compression["bufferView"],
        ))
        if columns:
            if decoded.tex_coord is None:
                raise ValueError("Mesh has no texture coordinates")
            slots = np.floor(
                decoded.tex_coord[decoded.faces, 0] * columns,
            ).astype(int)
            if np.any(slots.min(axis=1) != slots.max(axis=1)):
                raise ValueError("A triangle spans multiple palette swatches")
            if np.any(slots < 0) or np.any(slots >= columns):
                raise ValueError("Texture coordinates extend beyond the palette")
            face_swatches = slots[:, 0]
        else:
            face_swatches = np.full(len(decoded.faces), primitive["material"])
        triangles.append(decoded.points[decoded.faces] * 1000)
        swatches.append(face_swatches)
    triangles = np.concatenate(triangles)
    swatches = np.concatenate(swatches)
    used = np.unique(swatches)
    panel_columns = min(5, len(used) + 1)
    panel_rows = math.ceil((len(used) + 1) / panel_columns)
    figure = plt.figure(figsize=(panel_columns * 3.2, panel_rows * 3))
    colors = plt.colormaps["tab20"](np.linspace(0, 1, len(used)))
    face_colors = colors[np.searchsorted(used, swatches)]
    lower = triangles.min(axis=(0, 1))
    upper = triangles.max(axis=(0, 1))
    center = (lower + upper) / 2
    radius = max(float((upper - lower).max()) / 2, 1)
    try:
        for panel, swatch in enumerate([None, *used]):
            axis = figure.add_subplot(
                panel_rows, panel_columns, panel + 1, projection="3d",
            )
            visible = np.ones(len(swatches), dtype=bool)
            if swatch is not None:
                visible = swatches == swatch
            axis.add_collection3d(Poly3DCollection(
                triangles[visible], facecolors=face_colors[visible],
                edgecolors=(0, 0, 0, 0.08), linewidths=0.1,
            ))
            axis.set_xlim(center[0] - radius, center[0] + radius)
            axis.set_ylim(center[1] - radius, center[1] + radius)
            axis.set_zlim(center[2] - radius, center[2] + radius)
            axis.set_box_aspect([1, 1, 1])
            axis.view_init(elev=args.elevation, azim=args.azimuth)
            title = "All materials"
            if columns:
                title = "All swatches"
            if swatch is not None:
                title = f"Material {swatch}"
                if columns:
                    title = f"Swatch {swatch}"
            axis.set_title(title)
            axis.set_axis_off()
        figure.suptitle(f"{path.stem} — mesh {selected}", fontsize=18)
        figure.tight_layout()
        output = output_dir / f"{path.stem}_mesh_{selected}.png"
        figure.savefig(output, dpi=args.dpi)
    finally:
        plt.close(figure)
    return output


def main() -> None:
    parser = argparse.ArgumentParser(
        description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("models", nargs="*", type=Path, default=DEFAULT_MODELS)
    parser.add_argument("--output-dir", type=Path,
                        default=ROOT / ".cache/model_palettes")
    parser.add_argument("--mesh", type=int,
                        help="Mesh index; defaults to the largest mesh")
    parser.add_argument("--azimuth", type=float, default=-65)
    parser.add_argument("--elevation", type=float, default=30)
    parser.add_argument("--dpi", type=int, default=130)
    args = parser.parse_args()
    if args.dpi < 1:
        parser.error("--dpi must be positive")
    dependencies = ROOT / ".cache/model_palette_analysis/dependencies"
    if dependencies.is_dir():
        sys.path.insert(0, str(dependencies))
    os.environ.setdefault("MPLCONFIGDIR", str(ROOT / ".cache/matplotlib"))
    try:
        import matplotlib
        matplotlib.use("Agg")
        args.output_dir.mkdir(parents=True, exist_ok=True)
        for path in args.models:
            output = render_model(path, args.output_dir, args)
            display = output
            if output.is_relative_to(ROOT):
                display = output.relative_to(ROOT)
            print(display, flush=True)
    except ImportError as error:
        parser.error(f"Missing rendering dependency: {error}. See --help for setup.")
    except (OSError, ValueError, KeyError) as error:
        parser.error(str(error))


if __name__ == "__main__":
    main()
