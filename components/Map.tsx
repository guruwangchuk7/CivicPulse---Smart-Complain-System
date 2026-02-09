'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import { useTheme } from 'next-themes';

interface MapProps {
    center?: LatLngExpression;
    zoom?: number;
    onLocationSelect?: (lat: number, lng: number) => void;
    markers?: Array<{
        id: string;
        position: [number, number];
        content?: React.ReactNode;
        tooltip?: string; // New prop for content shown on hover/permanent
    }>;
    onMarkerClick?: (id: string) => void;
}

function LocationMarker({ onSelect }: { onSelect?: (lat: number, lng: number) => void }) {
    const [position, setPosition] = useState<LatLngExpression | null>(null);
    const map = useMapEvents({
        click(e) {
            if (onSelect) {
                setPosition(e.latlng);
                onSelect(e.latlng.lat, e.latlng.lng);
            }
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Selected Location</Popup>
        </Marker>
    );
}

const createCustomClusterIcon = (cluster: any) => {
    return L.divIcon({
        html: `<div class="cluster-icon flex items-center justify-center bg-blue-600 text-white font-bold rounded-full w-8 h-8 border-2 border-white shadow-md" style="width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background-color: #2563eb; color: white; border-radius: 9999px; border: 2px solid white;">${cluster.getChildCount()}</div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(33, 33, true),
    });
};

const Map = ({ center = [51.505, -0.09], zoom = 13, onLocationSelect, markers = [], onMarkerClick }: MapProps) => {
    const { theme } = useTheme();

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                }
            />
            {onLocationSelect && <LocationMarker onSelect={onLocationSelect} />}
            <MarkerClusterGroup
                chunkedLoading
                iconCreateFunction={createCustomClusterIcon}
            >
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        eventHandlers={{
                            click: () => {
                                if (onMarkerClick) {
                                    onMarkerClick(marker.id);
                                }
                            },
                        }}
                    >
                        {marker.tooltip && (
                            <Tooltip direction="top" offset={[0, -20]} opacity={1} permanent className="font-bold text-xs bg-transparent border-none shadow-none text-black">
                                {marker.tooltip}
                            </Tooltip>
                        )}
                        {marker.content && <Popup>{marker.content}</Popup>}
                    </Marker>
                ))}
            </MarkerClusterGroup>
        </MapContainer>
    );
};

export default Map;
