import json
import struct
import unittest

from scripts.render_model_palettes import (
    DEFAULT_MODELS, ROOT, buffer_view, mesh_index, palette_columns, read_glb,
)


def glb_file(document, binary=b"1234"):
    encoded = json.dumps(document).encode()
    encoded += b" " * (-len(encoded) % 4)
    chunks = struct.pack("<I4s", len(encoded), b"JSON") + encoded
    chunks += struct.pack("<I4s", len(binary), b"BIN\x00") + binary
    return struct.pack("<4sII", b"glTF", 2, len(chunks) + 12) + chunks


class RenderModelPalettesTest(unittest.TestCase):
    def test_defaults_include_palette_and_solid_models(self):
        names = {path.name for path in DEFAULT_MODELS}
        self.assertTrue({"seeder.glb", "seed_bin.glb", "toolbay_1.glb"} <= names)
        self.assertEqual(DEFAULT_MODELS, sorted(DEFAULT_MODELS))
        self.assertTrue(all(path.is_relative_to(ROOT / "public/3D/models")
                            for path in DEFAULT_MODELS))

    def test_solid_material_does_not_need_a_palette_or_image(self):
        self.assertEqual(palette_columns({}, b"", {
            "pbrMetallicRoughness": {"baseColorFactor": [0.2, 0.2, 0.2, 1]},
        }), 0)

    def test_reads_embedded_chunks(self):
        document = {"asset": {"version": "2.0"}}
        self.assertEqual(read_glb(glb_file(document)), (document, b"1234"))

    def test_rejects_invalid_or_truncated_files(self):
        valid = glb_file({})
        samples = [b"", b"bad!" + valid[4:], valid[:-1]]
        for data in samples:
            with self.subTest(data=data), self.assertRaises(ValueError):
                read_glb(data)

    def test_rejects_missing_binary_chunk(self):
        with self.assertRaisesRegex(ValueError, "binary chunk"):
            read_glb(glb_file({}, b""))

    def test_rejects_chunk_overrun(self):
        data = bytearray(glb_file({}))
        struct.pack_into("<I", data, 12, len(data))
        with self.assertRaisesRegex(ValueError, "chunk data"):
            read_glb(data)

    def test_selects_largest_mesh_across_all_primitives(self):
        document = {
            "accessors": [{"count": 3}, {"count": 9}, {"count": 6}],
            "meshes": [
                {"primitives": [{"attributes": {"POSITION": 0}, "indices": 1}]},
                {"primitives": [
                    {"attributes": {"POSITION": 2}},
                    {"attributes": {"POSITION": 2}},
                ]},
            ],
        }
        self.assertEqual(mesh_index(document), 1)
        self.assertEqual(mesh_index(document, 0), 0)
        for index in (-1, 2):
            with self.assertRaises(ValueError):
                mesh_index(document, index)

    def test_rejects_no_meshes(self):
        with self.assertRaisesRegex(ValueError, "no meshes"):
            mesh_index({})

    def test_reads_buffer_view_with_and_without_offset(self):
        document = {"bufferViews": [
            {"byteLength": 2},
            {"byteOffset": 2, "byteLength": 2},
        ]}
        self.assertEqual(buffer_view(document, b"abcd", 0), b"ab")
        self.assertEqual(buffer_view(document, b"abcd", 1), b"cd")

    def test_rejects_external_or_out_of_bounds_buffer_views(self):
        for view in ({"buffer": 1, "byteLength": 2},
                     {"byteOffset": 3, "byteLength": 2}):
            with self.assertRaises(ValueError):
                buffer_view({"bufferViews": [view]}, b"abcd", 0)


if __name__ == "__main__":
    unittest.main()
