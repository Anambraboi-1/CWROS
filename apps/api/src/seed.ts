import bcrypt from 'bcryptjs';
import { randomUUID } from 'node:crypto';
import { db } from './db.js';

type NodeSeed = { code: string; name: string; latitude: number; longitude: number };

// README §7.2 — authoritative node definitions.
const NODES: NodeSeed[] = [
  { code: 'A', name: 'Female Hostel CP', latitude: 4.945086, longitude: 8.34515 },
  { code: 'B', name: 'Pav2 CP', latitude: 4.949286, longitude: 8.348278 },
  { code: 'C', name: 'B&W CP', latitude: 4.950303, longitude: 8.346486 },
  { code: 'D', name: "Unical VC Gate", latitude: 4.952381, longitude: 8.345236 },
  { code: 'E', name: 'Unical Main Gate', latitude: 4.952336, longitude: 8.339928 },
  { code: 'F', name: 'Layout Road / Plaza CP', latitude: 4.956144, longitude: 8.340533 },
  { code: 'G', name: "Unical Int'l CP", latitude: 4.954089, longitude: 8.345936 },
  { code: 'H', name: 'Dr. Ekpeme Drive', latitude: 4.957633, longitude: 8.341422 },
  { code: 'I', name: 'Bez Pharma', latitude: 4.958097, longitude: 8.34395 },
  { code: 'J', name: 'Hospital Road CP 1', latitude: 4.956797, longitude: 8.346786 },
  { code: 'K', name: 'Abong Aseng', latitude: 4.960569, longitude: 8.344583 },
  { code: 'L', name: 'Hospital Road CP 2', latitude: 4.960117, longitude: 8.347956 },
  { code: 'M', name: 'Etabgor Roundabout', latitude: 4.961806, longitude: 8.344825 },
  { code: 'N', name: 'CUDA Junction', latitude: 4.962314, longitude: 8.348619 },
  { code: 'O', name: 'CUDA CP', latitude: 4.962989, longitude: 8.349108 },
  { code: 'P', name: 'Edim Otop', latitude: 4.963031, longitude: 8.349628 },
  { code: 'Q', name: 'Atimbo Roundabout', latitude: 4.972858, longitude: 8.351297 },
  { code: 'R', name: 'Lemna Dumpsite', latitude: 5.034717, longitude: 8.362533 }
];

// README §8 — authoritative graph edges (undirected, weight in km).
const EDGES: Array<[string, string, number]> = [
  ['A', 'C', 0.68],
  ['A', 'B', 0.83],
  ['B', 'C', 0.38],
  ['C', 'D', 0.36],
  ['D', 'E', 0.63],
  ['D', 'G', 0.2],
  ['E', 'F', 0.58],
  ['F', 'G', 0.7],
  ['F', 'H', 0.18],
  ['G', 'J', 0.32],
  ['H', 'I', 0.19],
  ['H', 'G', 0.94],
  ['I', 'K', 0.37],
  ['I', 'J', 0.53],
  ['J', 'L', 0.39],
  ['K', 'M', 0.05],
  ['K', 'L', 0.43],
  ['L', 'N', 0.26],
  ['M', 'N', 0.42],
  ['N', 'O', 0.09],
  ['O', 'P', 0.11],
  ['O', 'Q', 1.13],
  ['P', 'Q', 2.43],
  ['Q', 'R', 7.64]
];

// README §19 — initial system settings.
const SETTINGS: Array<[string, string, string]> = [
  ['default_destination', 'R', 'Default route destination node code'],
  ['average_speed_kmh', '30', 'Assumed average travel speed used for time estimates'],
  ['cost_per_km', '500', 'Estimated transportation cost per kilometre'],
  ['currency', 'NGN', 'Currency used for cost estimates']
];

function nodeType(name: string, code: string): 'COLLECTION_POINT' | 'JUNCTION' | 'DESTINATION' {
  if (code === 'R') return 'DESTINATION';
  return name.includes('CP') ? 'COLLECTION_POINT' : 'JUNCTION';
}

export function seedIfEmpty(): void {
  const userCount = (db.prepare('SELECT count(*) as c FROM users').get() as { c: number }).c;
  if (userCount === 0) {
    const passwordHash = bcrypt.hashSync('password', 10);
    db.prepare(
      'INSERT INTO users (id, username, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    ).run(randomUUID(), 'admin', 'admin@cwros.com', passwordHash, 'ADMIN');
  }

  const nodeCount = (db.prepare('SELECT count(*) as c FROM nodes').get() as { c: number }).c;
  const codeToId = new Map<string, string>();
  if (nodeCount === 0) {
    const insertNode = db.prepare(
      'INSERT INTO nodes (id, code, name, description, latitude, longitude, node_type) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    for (const node of NODES) {
      const id = randomUUID();
      codeToId.set(node.code, id);
      insertNode.run(id, node.code, node.name, node.name, node.latitude, node.longitude, nodeType(node.name, node.code));
    }
  } else {
    for (const row of db.prepare('SELECT id, code FROM nodes').all() as Array<{ id: string; code: string }>) {
      codeToId.set(row.code, row.id);
    }
  }

  const edgeCount = (db.prepare('SELECT count(*) as c FROM edges').get() as { c: number }).c;
  if (edgeCount === 0) {
    const insertEdge = db.prepare(
      'INSERT INTO edges (id, source_node_id, destination_node_id, distance_km, is_bidirectional) VALUES (?, ?, ?, ?, 1)'
    );
    for (const [from, to, weight] of EDGES) {
      const sourceId = codeToId.get(from);
      const destinationId = codeToId.get(to);
      if (!sourceId || !destinationId) continue;
      insertEdge.run(randomUUID(), sourceId, destinationId, weight);
    }
  }

  const settingCount = (db.prepare('SELECT count(*) as c FROM system_settings').get() as { c: number }).c;
  if (settingCount === 0) {
    const insertSetting = db.prepare(
      'INSERT INTO system_settings (id, setting_key, setting_value, description) VALUES (?, ?, ?, ?)'
    );
    for (const [key, value, description] of SETTINGS) {
      insertSetting.run(randomUUID(), key, value, description);
    }
  }

  const metricsCount = (db.prepare('SELECT count(*) as c FROM system_metrics').get() as { c: number }).c;
  if (metricsCount === 0) {
    db.prepare('INSERT INTO system_metrics (active_nodes, operational_rate, system_load_ms) VALUES (?, ?, ?)').run(
      NODES.length,
      99.8,
      48
    );
  }
}
