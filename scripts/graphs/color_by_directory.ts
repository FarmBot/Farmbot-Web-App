type DependencyGraph = Record<string, string[]>;

const quote = (value: string): string => JSON.stringify(value);

export const topLevelDirectoryOf = (
  filePath: string,
  target: string,
): string => {
  const segments = target
    .replaceAll("\\", "/")
    .split("/")
    .filter(Boolean);
  let outsideFrontend = false;
  filePath.replaceAll("\\", "/").split("/").forEach(segment => {
    if (segment === "..") {
      if (segments.length) {
        segments.pop();
      } else {
        outsideFrontend = true;
      }
    } else if (segment && segment !== ".") {
      segments.push(segment);
    }
  });
  return outsideFrontend
    ? "(outside frontend)"
    : segments[0] || "(frontend root)";
};

const hash = (value: string): number => {
  let result = 2166136261;
  for (const character of value) {
    result ^= character.codePointAt(0) || 0;
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
};

export const directoryColor = (directory: string): string => {
  const hue = (hash(directory) % 360) / 360;
  return `${hue.toFixed(3)} 0.35 0.95`;
};

const resolveHighlightedFile = (
  nodes: Set<string>,
  query: string | undefined,
  target: string,
): string | undefined => {
  if (!query) {
    return undefined;
  }
  const normalized = query.replaceAll("\\", "/").replace(/^\.\/+/, "");
  const targetMarker = `frontend/${target}/`;
  const markerIndex = normalized.lastIndexOf(targetMarker);
  const graphPath = markerIndex < 0
    ? normalized
    : normalized.slice(markerIndex + targetMarker.length);
  if (nodes.has(graphPath)) {
    return graphPath;
  }
  const matches = [...nodes].filter(node => node.endsWith(`/${graphPath}`));
  if (matches.length === 1) {
    return matches[0];
  }
  if (matches.length > 1) {
    throw new Error(
      `Ambiguous highlighted file "${query}": ${matches.join(", ")}`,
    );
  }
  throw new Error(`Highlighted file not found in graph: ${query}`);
};

export const toDot = (
  graph: DependencyGraph,
  target: string,
  highlightQuery?: string,
): string => {
  const nodes = new Set<string>();
  const targetDirectory = topLevelDirectoryOf(".", target);
  Object.entries(graph).forEach(([filePath, dependencies]) => {
    nodes.add(filePath);
    dependencies.forEach(dependency => nodes.add(dependency));
  });
  const highlightedFile = resolveHighlightedFile(
    nodes,
    highlightQuery,
    target,
  );

  const lines = [
    "digraph G {",
    "  graph [bgcolor=\"#111827\", outputorder=\"edgesfirst\",",
    "    overlap=\"prism\", K=\"1.4\", repulsiveforce=\"2.0\",",
    "    sep=\"+20\", esep=\"+8\"];",
    "  node [shape=\"box\", style=\"filled,rounded\", color=\"#374151\",",
    "    fontname=\"Arial\", fontsize=\"10\", fontcolor=\"#111827\"];",
    "  edge [color=\"#6b7280\", arrowsize=\"0.6\"];",
  ];

  [...nodes].sort().forEach(filePath => {
    const directory = topLevelDirectoryOf(filePath, target);
    lines.push(
      `  ${quote(filePath)} [fillcolor=${quote(directoryColor(directory))},` +
      ` tooltip=${quote(directory)}];`,
    );
  });

  Object.keys(graph).sort().forEach(filePath => {
    [...graph[filePath]].sort().forEach(dependency => {
      const sourceDirectory = topLevelDirectoryOf(filePath, target);
      const dependencyDirectory = topLevelDirectoryOf(dependency, target);
      const crossesTargetBoundary =
        (sourceDirectory === targetDirectory) !==
        (dependencyDirectory === targetDirectory);
      const connectsToHighlightedFile =
        filePath === highlightedFile || dependency === highlightedFile;
      const shouldHighlight = highlightedFile
        ? connectsToHighlightedFile
        : crossesTargetBoundary;
      const attributes = shouldHighlight
        ? " [color=\"#f59e0b\", penwidth=\"2.5\", arrowsize=\"0.9\"]"
        : "";
      lines.push(
        `  ${quote(filePath)} -> ${quote(dependency)}${attributes};`,
      );
    });
  });

  lines.push("}");
  return `${lines.join("\n")}\n`;
};

if (import.meta.main) {
  const [input, output, target, highlightFile] = Bun.argv.slice(2);
  if (!input || !output || !target) {
    throw new Error(
      "Usage: color_by_directory.ts INPUT.json OUTPUT.dot TARGET",
    );
  }
  const graph = JSON.parse(await Bun.file(input).text()) as DependencyGraph;
  await Bun.write(output, toDot(graph, target, highlightFile));
}
