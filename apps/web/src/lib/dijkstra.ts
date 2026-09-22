export type NodeDefinition = { code: string; name: string; latitude: number; longitude: number };

export const NODES: NodeDefinition[] = [
  { code: 'A', name: 'Female Hostel CP', latitude: 4.945086, longitude: 8.34515 },
  { code: 'B', name: 'Pav2 CP', latitude: 4.949286, longitude: 8.348278 },
  { code: 'C', name: 'B&W CP', latitude: 4.950303, longitude: 8.346486 },
  { code: 'D', name: 'Unical VC Gate', latitude: 4.952381, longitude: 8.345236 },
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

export const EDGES: Array<[string, string, number]> = [
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

export function calculateShortestPath(source: string, destination: string) {
  const graph: Record<string, Record<string, number>> = {};

  NODES.forEach((n) => (graph[n.code] = {}));
  EDGES.forEach(([u, v, w]) => {
    graph[u][v] = w;
    graph[v][u] = w; // undirected graph
  });

  const distances: Record<string, number> = {};
  const previous: Record<string, string | null> = {};
  const unvisited = new Set(Object.keys(graph));

  Object.keys(graph).forEach((node) => {
    distances[node] = Infinity;
    previous[node] = null;
  });
  distances[source] = 0;

  while (unvisited.size > 0) {
    let currNode: string | null = null;
    let minDistance = Infinity;

    unvisited.forEach((node) => {
      if (distances[node] < minDistance) {
        minDistance = distances[node];
        currNode = node;
      }
    });

    if (currNode === null) break; 
    if (currNode === destination) break;

    unvisited.delete(currNode);

    for (const neighbor in graph[currNode]) {
      const dist = graph[currNode][neighbor];
      const totalDist = distances[currNode] + dist;
      if (totalDist < distances[neighbor]) {
        distances[neighbor] = totalDist;
        previous[neighbor] = currNode;
      }
    }
  }

  if (distances[destination] === Infinity) {
    return { success: false, error: 'No path found between the selected nodes.' };
  }

  const path: string[] = [];
  let curr: string | null = destination;
  while (curr !== null) {
    path.unshift(curr);
    curr = previous[curr];
  }

  const distance_km = parseFloat(distances[destination].toFixed(2));
  
  // Settings based assumptions: average speed 30km/h, cost per km 500 NGN
  const estimated_time_minutes = Math.round((distance_km / 30) * 60);
  const estimated_cost = distance_km * 500;

  const route_names = path.map((code) => NODES.find((n) => n.code === code)?.name || '');

  return {
    success: true,
    operation_id: 'OP-' + Math.random().toString(36).substr(2, 9).toUpperCase(),
    path,
    route_names,
    distance_km,
    estimated_time_minutes,
    estimated_cost,
    currency: 'NGN'
  };
}
