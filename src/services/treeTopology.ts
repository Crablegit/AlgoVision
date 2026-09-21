import type { EdgeItem } from '../types';

type LooseEdge = Partial<EdgeItem> & Record<string, unknown>;

/** Extract an endpoint ID from the common shapes produced by the model. */
export function endpointId(value: unknown): string | undefined {
  if (value === null || value === undefined) return undefined;
  if (typeof value === 'string' || typeof value === 'number') {
    const id = String(value).trim();
    return id || undefined;
  }
  if (typeof value === 'object') {
    const endpoint = value as Record<string, unknown>;
    return endpointId(endpoint.id ?? endpoint.nodeId ?? endpoint.value ?? endpoint.label ?? endpoint.name);
  }
  return undefined;
}

function normalizeAlias(value: unknown): string {
  return String(value ?? '').trim().toLocaleLowerCase().replace(/\s+/g, ' ');
}

function nodeId(node: unknown, index: number): string | undefined {
  if (node && typeof node === 'object') {
    const item = node as Record<string, unknown>;
    return endpointId(item.id ?? item.nodeId ?? item.key ?? item.value ?? item.label ?? item.name);
  }
  return endpointId(node) ?? String(index + 1);
}

function nodeAliases(nodes: readonly unknown[]): Map<string, string> {
  const aliases = new Map<string, string>();

  nodes.forEach((node, index) => {
    const id = nodeId(node, index);
    if (!id) return;

    const item = node && typeof node === 'object' ? node as Record<string, unknown> : {};
    [id, item.label, item.secondaryLabel, item.name].forEach(value => {
      const alias = normalizeAlias(value);
      if (!alias) return;
      aliases.set(alias, id);

      // "Làng 3" / "Thành phố 3" must still resolve to the real node ID "3".
      const numericSuffix = alias.match(/(?:^|\s)(\d+)$/)?.[1];
      if (numericSuffix) aliases.set(numericSuffix, id);
    });
  });

  return aliases;
}

function resolveWithAliases(value: unknown, aliases: Map<string, string>): string | undefined {
  const endpoint = endpointId(value);
  if (!endpoint) return undefined;

  const alias = normalizeAlias(endpoint);
  const numericSuffix = alias.match(/(?:^|\s)(\d+)$/)?.[1];
  return aliases.get(alias) ?? (numericSuffix ? aliases.get(numericSuffix) : undefined);
}

export function resolveNodeId(value: unknown, nodes: readonly unknown[] | undefined): string | undefined {
  if (!nodes || nodes.length === 0) return endpointId(value);
  return resolveWithAliases(value, nodeAliases(nodes));
}

/** Convert model aliases (source/target, labels, endpoint objects) into actual node IDs. */
export function canonicalizeEdges(
  nodes: readonly unknown[] | undefined,
  edges: readonly LooseEdge[] | undefined
): EdgeItem[] | undefined {
  if (!Array.isArray(edges)) return undefined;
  const aliases = nodeAliases(nodes || []);

  return edges.flatMap((edge, index) => {
    const fromValue = edge.from ?? edge.source ?? edge.u ?? edge.a ?? edge.start ?? edge.node1 ?? edge.first;
    const toValue = edge.to ?? edge.target ?? edge.v ?? edge.b ?? edge.end ?? edge.node2 ?? edge.second;
    // A delta frame can introduce an edge while its nodes were declared only in an
    // earlier frame. Keep its raw endpoint here; normalizer/UI can resolve it once
    // the inherited nodes are present instead of silently losing the new road.
    const from = resolveWithAliases(fromValue, aliases) ?? endpointId(fromValue);
    const to = resolveWithAliases(toValue, aliases) ?? endpointId(toValue);
    if (!from || !to) return [];

    return [{
      ...edge,
      id: endpointId(edge.id) ?? `edge-${from}-${to}-${index}`,
      from,
      to,
      dashed: edge.dashed === true || edge.type === 'dashed'
    } as EdgeItem];
  });
}

/** A tree is connected, acyclic, and has exactly N - 1 undirected edges. */
export function isTreeTopology(
  nodes: readonly unknown[] | undefined,
  edges: readonly LooseEdge[] | undefined
): boolean {
  if (!nodes || nodes.length === 0 || !edges) return false;

  const ids = nodes.map(nodeId).filter((id): id is string => Boolean(id));
  if (ids.length !== nodes.length || new Set(ids).size !== ids.length) return false;

  const canonicalEdges = canonicalizeEdges(nodes, edges);
  if (!canonicalEdges || canonicalEdges.length !== ids.length - 1) return false;

  const parent = new Map(ids.map(id => [id, id]));
  const find = (id: string): string => {
    const current = parent.get(id);
    if (!current || current === id) return id;
    const root = find(current);
    parent.set(id, root);
    return root;
  };

  for (const edge of canonicalEdges) {
    if (!parent.has(edge.from) || !parent.has(edge.to) || edge.from === edge.to) return false;
    const fromRoot = find(edge.from);
    const toRoot = find(edge.to);
    if (fromRoot === toRoot) return false;
    parent.set(fromRoot, toRoot);
  }

  return new Set(ids.map(find)).size === 1;
}

/** Explicit tree meaning is required before promoting a generic graph view to a tree view. */
export function hasTreeSemanticHint(values: readonly unknown[]): boolean {
  return values.some(value => /(?:^|[^a-z0-9])tree(?:s)?(?:$|[^a-z0-9])|cây/i.test(String(value ?? '')));
}
