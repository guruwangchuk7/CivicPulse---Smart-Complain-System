'use client';

import { MapContainer, TileLayer, Marker, Popup, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-defaulticon-compatibility/dist/leaflet-defaulticon-compatibility.css';
import 'leaflet-defaulticon-compatibility';
import { LatLngExpression } from 'leaflet';
import { useEffect, useState } from 'react';

interface MapProps {
    center?: LatLngExpression;
    zoom?: number;
    onLocationSelect?: (lat: number, lng: number) => void;
    markers?: Array<{
        id: string;
        position: [number, number];
        content?: React.ReactNode;
    }>;
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

const Map = ({ center = [51.505, -0.09], zoom = 13, onLocationSelect, markers = [] }: MapProps) => {
    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full">
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {onLocationSelect && <LocationMarker onSelect={onLocationSelect} />}
            {markers.map((marker) => (
                <Marker key={marker.id} position={marker.position}>
                    {marker.content && <Popup>{marker.content}</Popup>}
                </Marker>
            ))}
        </MapContainer>
    );
};

export default Map;
