import { MapContainer, TileLayer, Marker, Popup, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Navigation } from 'lucide-react';

const RedIcon = L.icon({
    iconUrl: '/vendor/leaflet/images/marker-icon-2x-red.png',
    shadowUrl: '/vendor/leaflet/images/marker-shadow.webp',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
});

L.Marker.prototype.options.icon = RedIcon;

export default function LeafletMap({ position }: { position: [number, number] }) {
  return (
    <MapContainer 
      center={position} 
      zoom={15} 
      style={{ height: '100%', width: '100%', background: '#111' }}
      scrollWheelZoom={false}
      zoomControl={true}
    >
      <TileLayer
        url="https://mt1.google.com/vt/lyrs=y&x={x}&y={y}&z={z}"
        attribution='&copy; Google Maps'
      />
      <Marker position={position}>
        <Tooltip permanent direction="top" offset={[0, -40]}>
          <span className="font-bold text-dark text-xs uppercase tracking-wider">
            Ayushmaan Residency
          </span>
        </Tooltip>
        <Popup>
          <div className="p-2 text-center bg-white/5 backdrop-blur-md rounded-xl border border-white/20">
             <h3 className="font-bold text-dark mb-1">Ayushmaan Residency</h3>
             <p className="text-xs text-dark/70 mb-3">Ultra Luxury Residences</p>
             <a 
               href="https://maps.app.goo.gl/EUKjJBXYGgxubYUm8"
               target="_blank"
               rel="noopener noreferrer"
               className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-gold bg-dark px-3 py-1.5 rounded-lg hover:scale-105 transition-transform"
             >
               GET DIRECTIONS <Navigation className="w-3 h-3" />
             </a>
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
}
