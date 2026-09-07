// Explicit Dijkstra implementation per README §10 — a heap-based priority queue
// with TL (tentative label), PL (permanent/selected node), Predecessor and
// Visited tracking, rather than a library shortest-path call.

export type Graph = Map<string, Array<{ to: string; weight: number }>>;

class MinHeap {
  private items: Array<{ dist: number; node: string }> = [];

  push(dist: number, node: string): void {
    this.items.push({ dist, node });
    let i = this.items.length - 1;
    while (i > 0) {
      const parent = (i - 1) >> 1;
      if (this.items[parent].dist <= this.items[i].dist) break;
      [this.items[parent], this.items[i]] = [this.items[i], this.items[parent]];
      i = parent;
    }
  }

  pop(): { dist: number; node: string } | undefined {
    const top = this.items[0];
    const last = this.items.pop();
    if (this.items.length > 0 && last) {
      this.items[0] = last;
      let i = 0;
      while (true) {
        const left = i * 2 + 1;
        const right = i * 2 + 2;
        let smallest = i;
        if (left < this.items.length && this.items[left].dist < this.items[smallest].dist) smallest = left;
        if (right < this.items.length && this.items[right].dist < this.items[smallest].dist) smallest = right;
        if (smallest === i) break;
        [this.items[smallest], this.items[i]] = [this.items[i], this.items[smallest]];
        i = smallest;
      }
    }
    return top;
  }

  get isEmpty(): boolean {
    return this.items.length === 0;
  }
}

export interface DijkstraResult {
  TL: Map<string, number>;
  Predecessor: Map<string, string | null>;
  Visited: Set<string>;
}

export function dijkstra(graph: Graph, source: string): DijkstraResult {
  const TL = new Map<string, number>();
  const Predecessor = new Map<string, string | null>();
  const Visited = new Set<string>();

  for (const node of graph.keys()) TL.set(node, Infinity);
  TL.set(source, 0);
  Predecessor.set(source, null);

  const queue = new MinHeap();
  queue.push(0, source);

  while (!queue.isEmpty) {
    const next = queue.pop();
    if (!next) break;
    const PL = next.node;
    if (Visited.has(PL)) continue;
    Visited.add(PL);

    for (const { to, weight } of graph.get(PL) ?? []) {
      if (Visited.has(to)) continue;
      const newDistance = (TL.get(PL) ?? Infinity) + weight;
      if (newDistance < (TL.get(to) ?? Infinity)) {
        TL.set(to, newDistance);
        Predecessor.set(to, PL);
        queue.push(newDistance, to);
      }
    }
  }

  return { TL, Predecessor, Visited };
}

export function reconstructPath(predecessor: Map<string, string | null>, source: string, destination: string): string[] | null {
  if (!predecessor.has(destination)) return null;
  const path: string[] = [];
  let current: string | null = destination;
  while (current !== null) {
    path.unshift(current);
    if (current === source) return path;
    current = predecessor.get(current) ?? null;
  }
  return null;
}
