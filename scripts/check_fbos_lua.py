#!/usr/bin/env python3
"""Compare FROM_FBOS functions with ../farmbot_os/priv/lua (no Lua execution).

Usage: python3 scripts/check_fbos_lua.py [--diff] [--fbos-root PATH]
Exit codes: 0 = matches, 1 = differences/missing functions, 2 = input error.
Whitespace and comments are ignored; string contents and signatures are checked.
This compares source tokens, not behavioral equivalence.
"""

import argparse
from dataclasses import dataclass
import difflib
from pathlib import Path
import re
import sys


PROJECT_ROOT = Path(__file__).resolve().parent.parent
TOKEN = re.compile(
    r"(?P<space>\s+)"
    r"|(?P<long_comment>--\[(?P<ceq>=*)\[.*?\](?P=ceq)\])"
    r"|(?P<comment>--[^\n]*)"
    r"|(?P<long_string>\[(?P<seq>=*)\[.*?\](?P=seq)\])"
    r'''|(?P<string>"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')'''
    r"|(?P<word>[A-Za-z_][A-Za-z_0-9]*)"
    r"|(?P<number>(?:0[xX][0-9a-fA-F]+|\d+(?:\.\d+)?)(?:[eE][+-]?\d+)?)"
    r"|(?P<operator>\.\.\.|\.\.|==|~=|<=|>=|//|<<|>>|[^\s])",
    re.DOTALL,
)


@dataclass(frozen=True)
class Token:
    value: str
    start: int
    end: int


@dataclass(frozen=True)
class Function:
    name: str
    tokens: tuple[str, ...]
    text: str
    location: str


def read_template(path: Path) -> tuple[str, int]:
    source = path.read_text(encoding="utf-8")
    match = re.search(
        r"\bconst FROM_FBOS\s*=\s*`((?:\\[\s\S]|[^`\\])*)`\s*;",
        source,
    )
    if not match:
        raise ValueError(f"FROM_FBOS template not found in {path}")
    raw = match.group(1)
    if "${" in raw:
        raise ValueError("FROM_FBOS interpolation is unsupported")
    escapes = {"`": "`", "\\": "\\", "n": "\n", "r": "\r", "t": "\t"}

    def decode(escape: re.Match) -> str:
        char = escape.group(1)
        if char not in escapes:
            raise ValueError(f"Unsupported template escape: {escape.group(0)}")
        return escapes[char]

    text = re.sub(r"\\([\s\S])", decode, raw)
    return text, source.count("\n", 0, match.start(1))


def extract_functions(text: str, path: Path, line_offset: int = 0):
    """Track Lua blocks so nested functions stay inside their parent."""
    tokens = [
        Token(match.group(), match.start(), match.end())
        for match in TOKEN.finditer(text)
        if match.lastgroup not in {"space", "comment", "long_comment"}
    ]
    blocks = []
    functions = []
    active = None
    for index, token in enumerate(tokens):
        value = token.value
        if value == "function":
            if not blocks:
                signature = index + 1
                if signature >= len(tokens):
                    raise ValueError(f"Incomplete function in {path}")
                if tokens[signature].value == "(":
                    if index == 0 or tokens[index - 1].value != "return":
                        raise ValueError(f"Unsupported anonymous function in {path}")
                    name = path.stem
                else:
                    name = tokens[signature].value
                    signature += 1
                    if (signature >= len(tokens)
                            or tokens[signature].value != "("):
                        raise ValueError(f"Unsupported function declaration in {path}")
                active = (name, index, signature)
            blocks.append("function")
        elif value in {"if", "for", "while", "repeat"}:
            blocks.append(value)
        elif value == "do":
            # A for/while loop's do belongs to the existing loop block.
            if blocks and blocks[-1] in {"for", "while"}:
                blocks[-1] = "loop"
            else:
                blocks.append("do")
        elif value in {"end", "until"}:
            if not blocks:
                raise ValueError(f"Unbalanced {value} in {path}")
            block = blocks.pop()
            if (value == "until") != (block == "repeat"):
                raise ValueError(f"Unexpected {value} in {path}")
            if not blocks and active:
                name, start, signature = active
                line = line_offset + text.count("\n", 0, tokens[start].start) + 1
                functions.append(Function(
                    name=name,
                    tokens=("function",) + tuple(
                        t.value for t in tokens[signature:index + 1]
                    ),
                    text=(f"function {name}"
                          + text[tokens[signature].start:token.end]),
                    location=f"{path}:{line}",
                ))
                active = None
    if blocks:
        raise ValueError(f"Unclosed Lua block in {path}")
    return functions


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--fbos-root", type=Path,
                        default=PROJECT_ROOT.parent / "farmbot_os")
    parser.add_argument("--diff", action="store_true",
                        help="Show unified diffs for changed functions")
    args = parser.parse_args()
    try:
        local_path = PROJECT_ROOT / "frontend/demo/lua_runner/lua.ts"
        text, offset = read_template(local_path)
        local_functions = extract_functions(text, local_path, offset)
        if not local_functions:
            raise ValueError("FROM_FBOS contains no functions")
        upstream_dir = args.fbos_root.resolve() / "priv/lua"
        if not upstream_dir.is_dir():
            raise ValueError(f"Lua source directory not found: {upstream_dir}")
        upstream = {}
        # Only inspect the Lua source directory, excluding specs/configuration.
        for path in sorted(upstream_dir.glob("*.lua")):
            if path.is_symlink():
                raise ValueError(f"Refusing to follow source symlink: {path}")
            for function in extract_functions(path.read_text(encoding="utf-8"), path):
                if function.name in upstream:
                    raise ValueError(f"Duplicate upstream function: {function.name}")
                upstream[function.name] = function
        counts = {"MATCH": 0, "DIFFERENT": 0, "MISSING": 0}
        for local in local_functions:
            remote = upstream.get(local.name)
            if remote is None:
                status = "MISSING"
            elif local.tokens == remote.tokens:
                status = "MATCH"
            else:
                status = "DIFFERENT"
            counts[status] += 1
            print(f"{status:9} {local.name}")
            if status != "MATCH":
                print(f"  Demo: {local.location}")
                if remote:
                    print(f"  FBOS: {remote.location}")
            if args.diff and status == "DIFFERENT":
                print("\n".join(difflib.unified_diff(
                    remote.text.splitlines(), local.text.splitlines(),
                    fromfile=remote.location, tofile=local.location,
                    lineterm="",
                )))
        print(f"\n{len(local_functions)} functions: "
              f"{counts['MATCH']} match, {counts['DIFFERENT']} differ, "
              f"{counts['MISSING']} missing")
        return int(bool(counts["DIFFERENT"] or counts["MISSING"]))
    except (OSError, ValueError) as error:
        print(f"Error: {error}", file=sys.stderr)
        return 2


if __name__ == "__main__":
    sys.exit(main())
