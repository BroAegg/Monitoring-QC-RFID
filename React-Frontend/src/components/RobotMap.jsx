/**
 * RobotMap - Google Maps wrapper for showing robot, path, and destination label
 * Requires: VITE_GOOGLE_MAPS_API_KEY
 */

import { useEffect, useRef } from 'react';

const loadGoogleMaps = (apiKey) => {
    return new Promise((resolve, reject) => {
        if (window.google && window.google.maps) {
            resolve(window.google.maps);
            return;
        }
        const existing = document.getElementById('google-maps-sdk');
        if (existing) {
            existing.addEventListener('load', () => resolve(window.google.maps));
            existing.addEventListener('error', reject);
            return;
        }
        const script = document.createElement('script');
        script.id = 'google-maps-sdk';
        script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=marker`;
        script.async = true;
        script.defer = true;
        script.onload = () => resolve(window.google.maps);
        script.onerror = reject;
        document.head.appendChild(script);
    });
};

const RobotMap = ({ center, robotPosition, path, destinationLabel, factorySimulation = false }) => {
    const mapRef = useRef(null);
    const mapInstance = useRef(null);
    const robotMarker = useRef(null);
    const pathPolyline = useRef(null);
    const destinationMarker = useRef(null);
    const factoryLayer = useRef([]);

    useEffect(() => {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        loadGoogleMaps(apiKey).then((maps) => {
            if (!mapInstance.current) {
                mapInstance.current = new maps.Map(mapRef.current, {
                    center,
                    zoom: 18,
                    mapId: 'futuristic-map',
                    disableDefaultUI: true,
                    clickableIcons: false,
                    styles: [
                        { elementType: 'geometry', stylers: [{ color: '#0b1020' }] },
                        { elementType: 'labels.icon', stylers: [{ visibility: 'off' }] },
                        { elementType: 'labels.text.fill', stylers: [{ color: '#a0b6ff' }] },
                        { elementType: 'labels.text.stroke', stylers: [{ color: '#0b1020' }] },
                        { featureType: 'poi', stylers: [{ visibility: 'off' }] },
                        { featureType: 'road', stylers: [{ color: '#1b2340' }] },
                        { featureType: 'water', stylers: [{ color: '#0a1535' }] },
                    ],
                });
            }

            // Optional: draw factory layout and points
            if (factorySimulation) {
                // Clear previous overlays
                factoryLayer.current.forEach(o => o.setMap(null));
                factoryLayer.current = [];

                const addRect = (bounds, stroke = '#7aa6ff', fill = 'rgba(122,166,255,0.12)') => {
                    const rect = new maps.Rectangle({
                        bounds,
                        strokeColor: stroke,
                        strokeWeight: 2,
                        fillColor: fill,
                        fillOpacity: 0.6,
                        map: mapInstance.current,
                    });
                    factoryLayer.current.push(rect);
                };

                const base = center;
                const meter = 0.000009; // approx 1m lat conversion near equator
                // Main hall
                addRect({
                    north: base.lat + meter * 60,
                    south: base.lat - meter * 40,
                    east: base.lng + meter * 90,
                    west: base.lng - meter * 90,
                }, '#4da3ff', 'rgba(77,163,255,0.12)');
                // Zones
                addRect({ north: base.lat + meter * 50, south: base.lat + meter * 10, east: base.lng - meter * 50, west: base.lng - meter * 85 }, '#00ffd6', 'rgba(0,255,214,0.1)');
                addRect({ north: base.lat + meter * 50, south: base.lat + meter * 10, east: base.lng + meter * 85, west: base.lng + meter * 50 }, '#ffc14d', 'rgba(255,193,77,0.12)');
                addRect({ north: base.lat - meter * 5, south: base.lat - meter * 35, east: base.lng + meter * 20, west: base.lng - meter * 20 }, '#ff7aa6', 'rgba(255,122,166,0.12)');

                // Points of interest
                const pois = [
                    { name: 'Dock A', pos: { lat: base.lat + meter * 45, lng: base.lng - meter * 75 }, color: '#00ffd6' },
                    { name: 'Packing 3', pos: { lat: base.lat + meter * 45, lng: base.lng + meter * 70 }, color: '#ffc14d' },
                    { name: 'Charging', pos: { lat: base.lat - meter * 25, lng: base.lng }, color: '#7aa6ff' },
                    { name: 'QC Point', pos: { lat: base.lat + meter * 5, lng: base.lng + meter * 20 }, color: '#ff7aa6' },
                ];
                pois.forEach(p => {
                    const marker = new maps.Marker({
                        position: p.pos,
                        map: mapInstance.current,
                        title: p.name,
                        label: { text: '•', color: p.color, fontSize: '24px' },
                    });
                    factoryLayer.current.push(marker);
                });

                // Scale and zoom controls (custom)
                const zoomIn = document.createElement('button');
                zoomIn.className = 'gm-btn';
                zoomIn.textContent = '+';
                const zoomOut = document.createElement('button');
                zoomOut.className = 'gm-btn';
                zoomOut.textContent = '-';
                zoomIn.onclick = () => mapInstance.current.setZoom(mapInstance.current.getZoom() + 1);
                zoomOut.onclick = () => mapInstance.current.setZoom(mapInstance.current.getZoom() - 1);
                const ctrl = document.createElement('div');
                ctrl.className = 'gm-ctrl';
                ctrl.appendChild(zoomIn);
                ctrl.appendChild(zoomOut);
                mapInstance.current.controls[maps.ControlPosition.LEFT_TOP].push(ctrl);
            }

            // Draw path
            if (path && path.length > 1) {
                if (!pathPolyline.current) {
                    pathPolyline.current = new maps.Polyline({
                        path,
                        geodesic: true,
                        strokeColor: '#7aa6ff',
                        strokeOpacity: 0.8,
                        strokeWeight: 4,
                        map: mapInstance.current,
                    });
                } else {
                    pathPolyline.current.setPath(path);
                }
            }

            // Destination marker is the last point
            const dest = path[path.length - 1] || center;
            if (!destinationMarker.current) {
                destinationMarker.current = new maps.Marker({
                    position: dest,
                    map: mapInstance.current,
                    title: destinationLabel,
                    label: { text: '⦿', color: '#00ffd6', fontSize: '24px' },
                });
            } else {
                destinationMarker.current.setPosition(dest);
            }

            // Robot marker
            if (!robotMarker.current) {
                robotMarker.current = new maps.Marker({
                    position: robotPosition,
                    map: mapInstance.current,
                    icon: {
                        path: 'M12 2 L15 10 L9 10 Z',
                        fillColor: '#ffae00',
                        fillOpacity: 1,
                        strokeWeight: 0,
                        scale: 1.8,
                        anchor: new maps.Point(12, 10),
                    },
                });
            } else {
                robotMarker.current.setPosition(robotPosition);
            }

            mapInstance.current.panTo(robotPosition);
        }).catch((err) => {
            console.error('Failed to load Google Maps:', err);
        });
    }, [center, robotPosition, path, destinationLabel]);

    return (
        <div ref={mapRef} className="robot-map"></div>
    );
};

export default RobotMap;


