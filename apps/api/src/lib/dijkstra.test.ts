import assert from 'node:assert/strict';
import { test } from 'node:test';
import { dijkstra, reconstructPath, type Graph } from './dijkstra.js';

function undirectedGraph(edges: Array<[string, string, number]>): Graph {
  const graph: Graph = new Map();
  const link = (a: string, b: string, weight: number) => {
    if (!graph.has(a)) graph.set(a, []);
    graph.get(a)!.push({ to: b, weight });
  };
  for (const [a, b, weight] of edges) {
    link(a, b, weight);
    link(b, a, weight);
  }
  return graph;
}

test('finds the shortest path across a small weighted graph', () => {
  const graph = undirectedGraph([
    ['A', 'B', 1],
    ['B', 'C', 2],
    ['A', 'C', 5],
    ['C', 'D', 1]
  ]);
  const { TL, Predecessor } = dijkstra(graph, 'A');
  assert.equal(TL.get('D'), 4);
  assert.deepEqual(reconstructPath(Predecessor, 'A', 'D'), ['A', 'B', 'C', 'D']);
});

test('returns no path for an unreachable destination', () => {
  const graph = undirectedGraph([
    ['A', 'B', 1]
  ]);
  graph.set('Z', []);
  const { Predecessor } = dijkstra(graph, 'A');
  assert.equal(reconstructPath(Predecessor, 'A', 'Z'), null);
});
