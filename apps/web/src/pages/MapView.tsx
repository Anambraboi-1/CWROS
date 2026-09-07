import { useQuery } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import L from 'leaflet';
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';
import { MapContainer, Marker, Polyline, Popup, TileLayer } from 'react-leaflet';
import { api } from '../lib/api';

const defaultIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41]
});
const disposalIcon = L.icon({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
  iconSize: [32, 52],
  iconAnchor: [16, 52],
  className: 'disposal-marker'
});

type NodeRow = { code: string; name: string; latitude: number; longitude: number; node_type: string };
type EdgeRow = { source: string; destination: string; distance_km: number };

export function MapView() {
  const { data: nodes } = useQuery({
    queryKey: ['nodes'],
    queryFn: async () => (await api.get<{ data: NodeRow[] }>('/nodes')).data.data
  });
  const { data: edges } = useQuery({
    queryKey: ['edges'],
    queryFn: async () => (await api.get<{ data: EdgeRow[] }>('/edges')).data.data
  });
  const [selected, setSelected] = useState<NodeRow | null>(null);

  const byCode = useMemo(() => new Map((nodes ?? []).map((n) => [n.code, n])), [nodes]);
  const center: [number, number] = nodes?.length ? [nodes[0].latitude, nodes[0].longitude] : [4.96, 8.35];

  return (
    <>
      <div className="title">
        <div>
          <p className="eyebrow">NODE GEOGRAPHY</p>
          <h1>
            Collection point <i>network</i>
          </h1>
        </div>
        <span className="map-count">{nodes?.length ?? 0} LOCATIONS</span>
      </div>
      <article className="panel map-panel leaflet-panel">
        <MapContainer center={center} zoom={13} style={{ height: 480, width: '100%', borderRadius: 4 }}>
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          {edges?.map((edge, i) => {
            const a = byCode.get(edge.source);
            const b = byCode.get(edge.destination);
            if (!a || !b) return null;
            return (
              <Polyline
                key={i}
                positions={[
                  [a.latitude, a.longitude],
                  [b.latitude, b.longitude]
                ]}
                pathOptions={{ color: '#d4af37', weight: 2, opacity: 0.55 }}
              />
            );
          })}
          {nodes?.map((node) => (
            <Marker
              key={node.code}
              position={[node.latitude, node.longitude]}
              icon={node.node_type === 'DESTINATION' ? disposalIcon : defaultIcon}
              eventHandlers={{ click: () => setSelected(node) }}
            >
              <Popup>
                <b>{node.code}</b> — {node.name}
              </Popup>
            </Marker>
          ))}
        </MapContainer>
        <div className="node-detail">
          <b>{selected?.code ?? '—'}</b>
          <span>{selected?.name ?? 'Click a node to see details'}</span>
          {selected && (
            <small>
              {selected.latitude.toFixed(6)}° N, {selected.longitude.toFixed(6)}° E
            </small>
          )}
        </div>
      </article>
    </>
  );
}
