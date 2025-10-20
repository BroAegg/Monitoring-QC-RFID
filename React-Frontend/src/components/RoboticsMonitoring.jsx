/**
 * RoboticsMonitoring - Monitoring Robotics Keenon
 * - Left sidebar: robot info, telemetry, controls (start/stop)
 * - Center: Google Maps route + destination name
 * - Bottom navbar: Automatic / Remote Control
 * - Right sidebar: destination planner & robot settings
 * API Key: set VITE_GOOGLE_MAPS_API_KEY in .env
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import './RoboticsMonitoring.css';
import RobotMap from './RobotMap';
import FactoryMap from './FactoryMap';
import bgImg from '../assets/bg.png';
import keenonImg from '../assets/keenon.png';

// Error Boundary Component
class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error('RoboticsMonitoring Error:', error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="robotics-container" style={{ padding: '20px', textAlign: 'center' }}>
                    <h2>⚠️ Error loading Robotics Monitoring</h2>
                    <p>Terjadi kesalahan saat memuat komponen. Silakan refresh halaman.</p>
                    <button onClick={() => window.location.reload()} className="btn btn-primary">
                        Refresh Page
                    </button>
                    <details style={{ marginTop: '20px', textAlign: 'left' }}>
                        <summary>Error Details</summary>
                        <pre>{this.state.error?.toString()}</pre>
                    </details>
                </div>
            );
        }
        return this.props.children;
    }
}

const DEFAULT_CENTER = { lat: -6.938, lng: 107.642 }; // Bandung area as neutral default

const formatDistance = (meters) => {
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.max(0, Math.round(meters))} m`;
};

const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600).toString().padStart(2, '0');
    const m = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
    const s = Math.floor(seconds % 60).toString().padStart(2, '0');
    return `${h}:${m}:${s}`;
};

const RoboticsMonitoringMain = () => {
    const [isConnected, setIsConnected] = useState(true);
    const [mode, setMode] = useState('automatic'); // 'automatic' | 'remote'
    const [destinationName, setDestinationName] = useState('Robotics Mapping Monitoring System');
    const [fromLocation, setFromLocation] = useState('Cutting');
    const [toLocation, setToLocation] = useState('Sewing');
    const [isRunning, setIsRunning] = useState(false);
    const [mapTool, setMapTool] = useState('select');
    const [saveTick, setSaveTick] = useState(0);

    // Pilihan robot Keenon
    const robotOptions = [
        { id: 'keenon_r118', name: 'Keenon R118' },
        { id: 'keenon_t8', name: 'Keenon T8' },
        { id: 'keenon_m2', name: 'Keenon M2' },
        { id: 'keenon_t10', name: 'Keenon T10' },
    ];
    const [selectedRobot, setSelectedRobot] = useState(robotOptions[0].id);

    // Robot telemetry (dummy simulation, bisa diganti MQTT/HTTP)
    const [telemetry, setTelemetry] = useState({
        speedKmh: 0,
        batteryPct: 63,
        remainingMeters: 337,
        workedSeconds: 3 * 60,
    });

    // Map & robot route
    const pathRef = useRef([
        { lat: DEFAULT_CENTER.lat + 0.002, lng: DEFAULT_CENTER.lng - 0.002 },
        { lat: DEFAULT_CENTER.lat + 0.002, lng: DEFAULT_CENTER.lng + 0.001 },
        { lat: DEFAULT_CENTER.lat - 0.0005, lng: DEFAULT_CENTER.lng + 0.0015 },
        { lat: DEFAULT_CENTER.lat - 0.001, lng: DEFAULT_CENTER.lng - 0.001 },
        { lat: DEFAULT_CENTER.lat + 0.0005, lng: DEFAULT_CENTER.lng - 0.002 },
    ]);
    const [robotIndex, setRobotIndex] = useState(0);
    const [robotPosition, setRobotPosition] = useState(pathRef.current[0]);

    // Smooth interpolation between points for better animation
    const [segmentProgress, setSegmentProgress] = useState(0);
    const intervalRef = useRef(null);

    const totalRemainingMeters = useMemo(() => telemetry.remainingMeters, [telemetry.remainingMeters]);

    const handleStart = () => {
        setIsRunning(true);
    };

    const handleStop = () => {
        setIsRunning(false);
    };

    // Simulation loop
    useEffect(() => {
        if (!isRunning) {
            if (intervalRef.current) clearInterval(intervalRef.current);
            return;
        }

        intervalRef.current = setInterval(() => {
            setTelemetry((prev) => {
                const newSpeed = Math.min(12, Math.max(2, prev.speedKmh + (Math.random() - 0.5) * 2));
                const newRemaining = Math.max(0, prev.remainingMeters - newSpeed * 0.6); // approx 0.6 m per tick per km/h
                return {
                    speedKmh: Number(newSpeed.toFixed(1)),
                    batteryPct: Math.max(0, prev.batteryPct - 0.01),
                    remainingMeters: newRemaining,
                    workedSeconds: prev.workedSeconds + 1,
                };
            });

            setSegmentProgress((p) => {
                let np = p + 0.02; // 2% per tick
                if (np >= 1) {
                    setRobotIndex((idx) => {
                        const nextIdx = (idx + 1) % pathRef.current.length;
                        setRobotPosition(pathRef.current[nextIdx]);
                        return nextIdx;
                    });
                    np = 0;
                } else {
                    // interpolate between current and next point
                    const current = pathRef.current[robotIndex];
                    const next = pathRef.current[(robotIndex + 1) % pathRef.current.length];
                    const lat = current.lat + (next.lat - current.lat) * np;
                    const lng = current.lng + (next.lng - current.lng) * np;
                    setRobotPosition({ lat, lng });
                }
                return np;
            });
        }, 500);

        return () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
        };
    }, [isRunning, robotIndex]);

    return (
        <div className="robotics-container">
            {/* Left Sidebar - Robot Info */}
            <aside className="robotics-left">
                <div className="robot-card glass">
                    <div className="robot-header">
                        <div className={`status-dot ${isConnected ? 'online' : 'offline'}`}></div>
                        <div className="robot-name">{robotOptions.find(r => r.id === selectedRobot)?.name || 'Keenon'}</div>
                        <span className={`status-text ${isConnected ? 'connected' : 'disconnected'}`}>
                            {isConnected ? 'Connected' : 'Not Connected'}
                        </span>
                    </div>
                    <div className="robot-image-wrap">
                        <img src={keenonImg} alt="Keenon Robot" className="robot-image" />
                    </div>

                    <div className="telemetry-grid">
                        <div className="telemetry-item">
                            <div className="telemetry-label">Speed</div>
                            <div className="telemetry-value">{telemetry.speedKmh.toFixed(1)} km/h</div>
                        </div>
                        <div className="telemetry-item">
                            <div className="telemetry-label">Battery</div>
                            <div className="telemetry-value battery">
                                {telemetry.batteryPct.toFixed(0)}%
                            </div>
                        </div>
                        <div className="telemetry-item">
                            <div className="telemetry-label">Remaining</div>
                            <div className="telemetry-value">{formatDistance(totalRemainingMeters)}</div>
                        </div>
                        <div className="telemetry-item">
                            <div className="telemetry-label">Time</div>
                            <div className="telemetry-value">{formatTime(telemetry.workedSeconds)}</div>
                        </div>
                        <div className="telemetry-item">
                            <div className="telemetry-label">Robot</div>
                            <select
                                className="robot-select"
                                value={selectedRobot}
                                onChange={(e) => setSelectedRobot(e.target.value)}
                            >
                                {robotOptions.map((opt) => (
                                    <option key={opt.id} value={opt.id}>{opt.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                {/* Planner moved here */}
                <div className="planner glass">
                    <h3>Destination Planner</h3>
                    <div className="field">
                        <label>From</label>
                        <select value={fromLocation} onChange={(e) => setFromLocation(e.target.value)} className="robot-select">
                            {['Cutting', 'Sewing', 'Finishing', 'Gudang ACC', 'Line 1', 'Line 2', 'Line 3', 'Robotics', 'Office'].map(loc => (
                                <option key={`from-${loc}`} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>To</label>
                        <select value={toLocation} onChange={(e) => setToLocation(e.target.value)} className="robot-select">
                            {['Cutting', 'Sewing', 'Finishing', 'Gudang ACC', 'Line 1', 'Line 2', 'Line 3', 'Robotics', 'Office'].map(loc => (
                                <option key={`to-${loc}`} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>
                    <div className="field">
                        <label>Destination Name</label>
                        <input
                            type="text"
                            value={destinationName}
                            onChange={(e) => setDestinationName(e.target.value)}
                            placeholder="Custom destination name"
                        />
                    </div>
                    <div className="planner-actions" style={{ display: 'none' }}></div>

                    <div className="settings">
                        <h4>Robot Settings</h4>
                        <div className="setting-row">
                            <span>Safe Mode</span>
                            <label className="switch">
                                <input type="checkbox" defaultChecked />
                                <span className="slider"></span>
                            </label>
                        </div>
                        <div className="setting-row">
                            <span>Max Speed</span>
                            <input type="range" min="2" max="12" defaultValue="8" />
                        </div>
                    </div>
                </div>

                {/* Bottom nav moved to the very bottom */}
                <div className="bottom-nav glass">
                    <button
                        className={`bottom-nav-item ${mode === 'automatic' ? 'active' : ''}`}
                        onClick={() => setMode('automatic')}
                    >
                        <span className="nav-icon">🤖</span>
                        Automatic
                    </button>
                    <button
                        className={`bottom-nav-item ${mode === 'remote' ? 'active' : ''}`}
                        onClick={() => setMode('remote')}
                    >
                        <span className="nav-icon">🎮</span>
                        Remote Control
                    </button>
                </div>
            </aside>

            {/* Center - Map & Destination */}
            <section className="robotics-center">
                <div className="destination-header">
                    <div className="destination-title">
                        <h1>{destinationName}</h1>
                        <p>Robot keenon route preview</p>
                    </div>
                </div>

                <div className="map-wrapper glass">
                    {(() => {
                        try {
                            return (
                                <FactoryMap
                                    imageSrc={bgImg}
                                    from={fromLocation}
                                    to={toLocation}
                                    running={isRunning}
                                    speedKmh={telemetry.speedKmh}
                                    robotImg={keenonImg}
                                    tool={mapTool}
                                    requestSave={saveTick}
                                    onSaved={(ok) => console.log('map saved:', ok)}
                                    onToggleRun={(run) => setIsRunning(run)}
                                />
                            );
                        } catch (error) {
                            console.error('FactoryMap render error:', error);
                            return (
                                <div style={{
                                    padding: '40px',
                                    textAlign: 'center',
                                    backgroundColor: '#1a2332',
                                    color: '#fff',
                                    borderRadius: '8px',
                                    height: '400px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    justifyContent: 'center'
                                }}>
                                    <h3>🗺️ Factory Map</h3>
                                    <p>Map sedang dimuat...</p>
                                    <div style={{ margin: '20px 0' }}>
                                        <strong>Route: {fromLocation} → {toLocation}</strong>
                                    </div>
                                    <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                                        <button
                                            className={`btn ${isRunning ? 'btn-stop' : 'btn-primary'}`}
                                            onClick={() => setIsRunning(!isRunning)}
                                        >
                                            {isRunning ? 'Stop' : 'Start'}
                                        </button>
                                    </div>
                                </div>
                            );
                        }
                    })()}
                </div>
            </section>
            {/* Right sidebar removed */}
        </div>
    );
};

// Wrapped component dengan Error Boundary
const RoboticsMonitoring = () => {
    return (
        <ErrorBoundary>
            <RoboticsMonitoringMain />
        </ErrorBoundary>
    );
};

export default RoboticsMonitoring;


