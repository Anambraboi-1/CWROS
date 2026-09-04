export type CollectionNode = {
  id: string;
  label: string;
  landmark: string;
  latitude: number;
  longitude: number;
  kind: 'collection' | 'disposal';
};

export const collectionNodes: CollectionNode[] = [
  { id: 'A', label: 'Node A', landmark: 'Female Hostel CP', latitude: 4.945086, longitude: 8.345150, kind: 'collection' },
  { id: 'B', label: 'Node B', landmark: 'Pav2 CP', latitude: 4.949286, longitude: 8.348278, kind: 'collection' },
  { id: 'C', label: 'Node C', landmark: 'B&W CP (Black & White)', latitude: 4.950303, longitude: 8.346486, kind: 'collection' },
  { id: 'D', label: 'Node D', landmark: 'Unical VC Gate', latitude: 4.952381, longitude: 8.345236, kind: 'collection' },
  { id: 'E', label: 'Node E', landmark: 'Unical Main Gate', latitude: 4.952336, longitude: 8.339928, kind: 'collection' },
  { id: 'F', label: 'Node F', landmark: 'Layout Road / Plaza CP', latitude: 4.956144, longitude: 8.340533, kind: 'collection' },
  { id: 'G', label: 'Node G', landmark: "Unical Int'l CP", latitude: 4.954089, longitude: 8.345936, kind: 'collection' },
  { id: 'H', label: 'Node H', landmark: 'Dr. Ekpeme Drive', latitude: 4.957633, longitude: 8.341422, kind: 'collection' },
  { id: 'I', label: 'Node I', landmark: 'Bez Pharma', latitude: 4.958097, longitude: 8.343950, kind: 'collection' },
  { id: 'J', label: 'Node J', landmark: 'Hospital Road CP 1', latitude: 4.956797, longitude: 8.346786, kind: 'collection' },
  { id: 'K', label: 'Node K', landmark: 'Abong Aseng', latitude: 4.960569, longitude: 8.344583, kind: 'collection' },
  { id: 'L', label: 'Node L', landmark: 'Hospital Road CP 2', latitude: 4.960117, longitude: 8.347956, kind: 'collection' },
  { id: 'M', label: 'Node M', landmark: 'Etabgor Roundabout', latitude: 4.961806, longitude: 8.344825, kind: 'collection' },
  { id: 'N', label: 'Node N', landmark: 'CUDA Junction', latitude: 4.962314, longitude: 8.348619, kind: 'collection' },
  { id: 'O', label: 'Node O', landmark: 'CUDA CP', latitude: 4.962989, longitude: 8.349108, kind: 'collection' },
  { id: 'P', label: 'Node P', landmark: 'Edim Otop', latitude: 4.963031, longitude: 8.349628, kind: 'collection' },
  { id: 'Q', label: 'Node Q', landmark: 'Atimbo Roundabout', latitude: 4.972858, longitude: 8.351297, kind: 'collection' },
  { id: 'R', label: 'Node R', landmark: 'Lemna Dumpsite', latitude: 5.034717, longitude: 8.362533, kind: 'disposal' }
];
