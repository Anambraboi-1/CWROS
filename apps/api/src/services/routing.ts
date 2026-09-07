import { randomUUID } from 'node:crypto';
import { db } from '../db.js';
import { dijkstra, reconstructPath, type Graph } from '../lib/dijkstra.js';

interface NodeRow {
  id: string;
  code: string;
  name: string;
}

interface EdgeRow {
  source_code: string;
  destination_code: string;
  distance_km: number;
  is_bidirectional: number;
}

function buildGraph(): { graph: Graph; nodesByCode: Map<string, NodeRow> } {
  const nodeRows = db.prepare('SELECT id, code, name FROM nodes WHERE is_active = 1').all() as unknown as NodeRow[];
  const nodesByCode = new Map(nodeRows.map((n) => [n.code, n]));

  const graph: Graph = new Map();
  for (const node of nodeRows) graph.set(node.code, []);

  const edgeRows = db
    .prepare(
      `SELECT sn.code as source_code, dn.code as destination_code, e.distance_km, e.is_bidirectional
       FROM edges e
       JOIN nodes sn ON sn.id = e.source_node_id
       JOIN nodes dn ON dn.id = e.destination_node_id
       WHERE e.is_active = 1 AND sn.is_active = 1 AND dn.is_active = 1`
    )
    .all() as unknown as EdgeRow[];

  for (const edge of edgeRows) {
    graph.get(edge.source_code)?.push({ to: edge.destination_code, weight: edge.distance_km });
    if (edge.is_bidirectional) {
      graph.get(edge.destination_code)?.push({ to: edge.source_code, weight: edge.distance_km });
    }
  }

  return { graph, nodesByCode };
}

function getSetting(key: string, fallback: string): string {
  const row = db.prepare('SELECT setting_value FROM system_settings WHERE setting_key = ?').get(key) as
    | { setting_value: string }
    | undefined;
  return row?.setting_value ?? fallback;
}

// README §12 — Travel Time (minutes) = (Distance / Average Speed) × 60
function estimateTravelTimeMinutes(distanceKm: number): number {
  const averageSpeedKmh = Number(getSetting('average_speed_kmh', '30'));
  return Math.round(((distanceKm / averageSpeedKmh) * 60) * 100) / 100;
}

// README §13 — Estimated Cost = Distance × Cost Per Kilometre
function estimateCost(distanceKm: number): { amount: number; currency: string } {
  const costPerKm = Number(getSetting('cost_per_km', '500'));
  const currency = getSetting('currency', 'NGN');
  return { amount: Math.round(distanceKm * costPerKm * 100) / 100, currency };
}

function recordOperation(params: {
  taskDescription: string;
  status: 'SUCCESS' | 'FAILED';
  processingTimeMs: number;
  sourceCode?: string;
  destinationCode?: string;
  distanceKm?: number;
  executedBy?: string;
}): string {
  const operationId = `OP-${randomUUID().slice(0, 8).toUpperCase()}`;
  db.prepare(
    `INSERT INTO operation_logs
      (id, operation_id, task_description, processing_time_ms, status, source_node, destination_node, distance_km, executed_by)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`
  ).run(
    randomUUID(),
    operationId,
    params.taskDescription,
    params.processingTimeMs,
    params.status,
    params.sourceCode ?? null,
    params.destinationCode ?? null,
    params.distanceKm ?? null,
    params.executedBy ?? null
  );

  const activeNodes = (db.prepare('SELECT count(*) as c FROM nodes WHERE is_active = 1').get() as { c: number }).c;
  const totalOps = (db.prepare('SELECT count(*) as c FROM operation_logs').get() as { c: number }).c;
  const successOps = (db.prepare("SELECT count(*) as c FROM operation_logs WHERE status = 'SUCCESS'").get() as {
    c: number;
  }).c;
  const operationalRate = totalOps > 0 ? Math.round((successOps / totalOps) * 10000) / 100 : 100;
  db.prepare('INSERT INTO system_metrics (active_nodes, operational_rate, system_load_ms) VALUES (?, ?, ?)').run(
    activeNodes,
    operationalRate,
    params.processingTimeMs
  );

  return operationId;
}

export type ShortestRouteResult =
  | {
      success: true;
      operation_id: string;
      source: { code: string; name: string };
      destination: { code: string; name: string };
      path: string[];
      route_names: string[];
      distance_km: number;
      estimated_time_minutes: number;
      estimated_cost: number;
      currency: string;
    }
  | { success: false; error: string };

export function calculateShortestRoute(source: string, destination: string, executedBy?: string): ShortestRouteResult {
  const started = performance.now();
  const { graph, nodesByCode } = buildGraph();
  const sourceNode = nodesByCode.get(source);
  const destinationNode = nodesByCode.get(destination);

  if (!sourceNode || !destinationNode) {
    recordOperation({
      taskDescription: `Shortest path ${source} -> ${destination}`,
      status: 'FAILED',
      processingTimeMs: Math.round(performance.now() - started),
      sourceCode: source,
      destinationCode: destination,
      executedBy
    });
    return { success: false, error: 'Unknown source or destination node' };
  }

  const { TL, Predecessor } = dijkstra(graph, source);
  const path = reconstructPath(Predecessor, source, destination);
  const elapsed = Math.round(performance.now() - started);

  if (!path) {
    recordOperation({
      taskDescription: `Shortest path ${source} -> ${destination}`,
      status: 'FAILED',
      processingTimeMs: elapsed,
      sourceCode: source,
      destinationCode: destination,
      executedBy
    });
    return { success: false, error: 'Destination is not reachable from source' };
  }

  const distanceKm = Math.round((TL.get(destination) ?? 0) * 100) / 100;
  const { amount: estimatedCost, currency } = estimateCost(distanceKm);
  const operationId = recordOperation({
    taskDescription: `Shortest path ${source} -> ${destination}`,
    status: 'SUCCESS',
    processingTimeMs: elapsed,
    sourceCode: source,
    destinationCode: destination,
    distanceKm,
    executedBy
  });

  return {
    success: true,
    operation_id: operationId,
    source: { code: sourceNode.code, name: sourceNode.name },
    destination: { code: destinationNode.code, name: destinationNode.name },
    path,
    route_names: path.map((code) => nodesByCode.get(code)?.name ?? code),
    distance_km: distanceKm,
    estimated_time_minutes: estimateTravelTimeMinutes(distanceKm),
    estimated_cost: estimatedCost,
    currency
  };
}
