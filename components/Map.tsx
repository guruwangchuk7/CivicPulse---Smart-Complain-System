'use client';

import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMapEvents, useMap } from 'react-leaflet';
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
    flyToLocation?: LatLngExpression | null; // For taking user to specific location smoothly
    onLocationSelect?: (lat: number, lng: number) => void;
    markers?: Array<{
        id: string;
        position: [number, number];
        content?: React.ReactNode;
        tooltip?: string;
        category?: string; // Add category for styling
    }>;
    onMarkerClick?: (id: string) => void;
    onMoveEnd?: (lat: number, lng: number) => void;
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

// MapUpdater component to smoothly fly to a new location
function MapUpdater({ location }: { location?: LatLngExpression | null }) {
    const map = useMap();
    useEffect(() => {
        if (location) {
            map.flyTo(location, 16, { duration: 1.5, easeLinearity: 0.25 });
        }
    }, [location, map]);
    return null;
}

function MapEventsHandler({ onMoveEnd }: { onMoveEnd?: (lat: number, lng: number) => void }) {
    const map = useMapEvents({
        moveend() {
            if (onMoveEnd) {
                const center = map.getCenter();
                onMoveEnd(center.lat, center.lng);
            }
        }
    });
    return null;
}

const createCustomClusterIcon = (cluster: any) => {
    return L.divIcon({
        html: `<div class="cluster-icon flex items-center justify-center bg-blue-600 text-white font-bold rounded-full border-2 border-white shadow-lg" style="width: 36px; height: 36px; display: flex; align-items: center; justify-content: center; background-color: #2563eb; color: white; border-radius: 9999px; border: 2px solid white; box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);">${cluster.getChildCount()}</div>`,
        className: 'custom-marker-cluster',
        iconSize: L.point(36, 36, true),
    });
};

const getMarkerIcon = (category?: string) => {
    let iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>';
    let bgColor = '#2563eb'; // blue-600

    if (category === 'POTHOLE') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="M9 9h.01"/><path d="M15 15h.01"/></svg>';
        bgColor = '#f97316';
    } // orange-500
    if (category === 'TRASH') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>';
        bgColor = '#10b981';
    } // emerald-500
    if (category === 'HAZARD') {
        iconSvg = '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>';
        bgColor = '#eab308';
    } // yellow-500

    return L.divIcon({
        html: `<div style="
            width: 36px; 
            height: 36px; 
            display: flex; 
            align-items: center; 
            justify-content: center; 
            background-color: ${bgColor}; 
            color: white; 
            border-radius: 50% 50% 50% 0; 
            transform: rotate(-45deg);
            border: 2px solid white; 
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.1); 
            cursor: pointer;
            transition: transform 0.2s ease;
        ">
            <div style="transform: rotate(45deg); display: flex;">
                ${iconSvg}
            </div>
        </div>`,
        className: 'custom-div-icon border-none bg-transparent',
        iconSize: L.point(36, 36, true),
        iconAnchor: [18, 36], // center bottom anchor
    });
};

const Map = ({ center = [51.505, -0.09], zoom = 13, flyToLocation, onLocationSelect, markers = [], onMarkerClick, onMoveEnd }: MapProps) => {
    const { theme } = useTheme();

    return (
        <MapContainer center={center} zoom={zoom} scrollWheelZoom={true} className="h-full w-full" zoomControl={false}>
            {/* Move zoom controls to bottom right so they don't hit the search bar */}

            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
                url={theme === 'dark'
                    ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
                    : "https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png" // Better default than OSM for standard app view
                }
            />

            <MapUpdater location={flyToLocation} />
            <MapEventsHandler onMoveEnd={onMoveEnd} />
            {onLocationSelect && <LocationMarker onSelect={onLocationSelect} />}

            <MarkerClusterGroup chunkedLoading iconCreateFunction={createCustomClusterIcon}>
                {markers.map((marker) => (
                    <Marker
                        key={marker.id}
                        position={marker.position}
                        icon={getMarkerIcon(marker.category)}
                        eventHandlers={{
                            click: () => {
                                if (onMarkerClick) {
                                    onMarkerClick(marker.id);
                                }
                            },
                        }}
                    >
                        {marker.tooltip && (
                            <Tooltip direction="top" offset={[0, -20]} opacity={1} className="font-bold text-xs bg-white dark:bg-gray-900 border-none shadow-xl rounded-lg px-2 py-1 text-gray-900 dark:text-white">
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
