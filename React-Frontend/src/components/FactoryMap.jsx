/**
 * FactoryMap - Image-based map with SVG overlay for routes, POIs, and robot simulation
 */

import { useEffect, useMemo, useRef, useState } from 'react';
import defaultMapData from '../map/defaultMap.json';

const VIEWBOX = { width: 1000, height: 650 };

const LOCATIONS = {
    'Cutting': { x: 110, y: 110, color: '#4da3ff', label: 'Cutting' },
    'Sewing': { x: 820, y: 480, color: '#7aa6ff', label: 'Sewing' },
    'Finishing': { x: 150, y: 480, color: '#ffc14d', label: 'Finishing' },
    'Gudang ACC': { x: 700, y: 140, color: '#ff7aa6', label: 'Gudang ACC' },
    'Line 1': { x: 420, y: 320, color: '#00ffd6', label: 'Line 1' },
    'Line 2': { x: 480, y: 320, color: '#00ffd6', label: 'Line 2' },
    'Line 3': { x: 540, y: 320, color: '#00ffd6', label: 'Line 3' },
    'Robotics': { x: 520, y: 600, color: '#b58bff', label: 'Robotics' },
    'Office': { x: 900, y: 110, color: '#a0e3ff', label: 'Office' },
};

const interpolate = (a, b, t) => a + (b - a) * t;

const sampleCurve = (points, samples = 300) => {
    const out = [];
    for (let i = 0; i < samples; i++) {
        const t = i / (samples - 1);
        // piecewise linear along control points
        const segLen = points.length - 1;
        const pos = t * segLen;
        const idx = Math.min(Math.floor(pos), segLen - 1);
        const lt = pos - idx;
        const p0 = points[idx];
        const p1 = points[idx + 1];
        out.push({ x: interpolate(p0.x, p1.x, lt), y: interpolate(p0.y, p1.y, lt) });
    }
    return out;
};

const pathLength = (pts) => {
    let len = 0;
    for (let i = 1; i < pts.length; i++) {
        const dx = pts[i].x - pts[i - 1].x;
        const dy = pts[i].y - pts[i - 1].y;
        len += Math.hypot(dx, dy);
    }
    return len;
};

const STORAGE_KEY = 'factory_map_state_v1';

const FactoryMap = ({ imageSrc, from, to, running, speedKmh = 3, robotImg, seed = 0, tool = 'select', requestSave = 0, onSaved, onToggleRun }) => {
    const [trail, setTrail] = useState([]);
    const [progress, setProgress] = useState(0);
    const progressRef = useRef(0);
    const animRef = useRef(null);
    const [activeTool, setActiveTool] = useState(tool || 'select');

    // Sync dengan prop tool dari parent
    useEffect(() => {
        setActiveTool(tool || 'select');
    }, [tool]);

    // Viewport interaksi (zoom/pan)
    const [scale, setScale] = useState(1);
    const [offset, setOffset] = useState({ x: 0, y: 0 });
    const lastPan = useRef(null);

    // Editable map state
    const [locations, setLocations] = useState(LOCATIONS);
    const [obstacles, setObstacles] = useState([
        { x: 300, y: 200, w: 140, h: 120, color: 'rgba(100,110,160,0.45)', stroke: 'rgba(255,255,255,0.15)', name: 'Obstacle A' },
        { x: 680, y: 330, w: 120, h: 140, color: 'rgba(100,110,160,0.45)', stroke: 'rgba(255,255,255,0.15)', name: 'Obstacle B' },
        { x: 140, y: 360, w: 160, h: 80, color: 'rgba(100,110,160,0.45)', stroke: 'rgba(255,255,255,0.15)', name: 'Obstacle C' },
    ]);
    const [nogo, setNogo] = useState([
        { x: 840, y: 520, w: 110, h: 80, color: 'rgba(255,80,80,0.18)', stroke: '#ff4d4d', name: 'No-Go 1' },
        { x: 80, y: 80, w: 90, h: 70, color: 'rgba(255,80,80,0.18)', stroke: '#ff4d4d', name: 'No-Go 2' },
    ]);
    const [userWaypoints, setUserWaypoints] = useState([]); // mid points
    const [routes, setRoutes] = useState({}); // key: "from|to" -> { waypoints, name }
    const [routeName, setRouteName] = useState('Default Route');
    const currentRouteKey = useMemo(() => `${from}|${to}`, [from, to]);

    const controlPoints = useMemo(() => {
        const start = locations[from] || locations['Cutting'];
        const end = locations[to] || locations['Sewing'];

        // Create 2 control waypoints to form an S-curve route across factory
        const midX = (start.x + end.x) / 2;
        const midY = (start.y + end.y) / 2;
        const jitter = ((seed % 97) - 48) * 2; // deterministic small jitter

        const wp1 = { x: midX, y: Math.min(VIEWBOX.height - 40, midY - 120 + jitter) };
        const wp2 = { x: midX + 100, y: Math.max(40, midY + 120 - jitter) };
        const basePts = [start, wp1, wp2, end].map(p => ({ x: p.x, y: p.y }));
        if (userWaypoints.length > 0) {
            return [basePts[0], ...userWaypoints, basePts[basePts.length - 1]];
        }
        return basePts;
    }, [from, to, seed, locations, userWaypoints]);

    const sampled = useMemo(() => sampleCurve(controlPoints, 500), [controlPoints]);
    const totalLen = useMemo(() => pathLength(sampled), [sampled]);

    // Get current robot coordinate based on progress (0..1)
    const robotPos = useMemo(() => {
        if (sampled.length === 0) return { x: 0, y: 0 };
        const idx = Math.min(Math.floor(progress * (sampled.length - 1)), sampled.length - 1);
        return sampled[idx];
    }, [progress, sampled]);

    // Reset on route change
    useEffect(() => {
        setProgress(0);
        progressRef.current = 0;
        setTrail([]);
    }, [from, to, seed]);

    // Load saved route waypoints (if any) when from/to changes
    useEffect(() => {
        const saved = routes[currentRouteKey];
        if (saved && Array.isArray(saved.waypoints) && saved.waypoints.length > 0) {
            setUserWaypoints(saved.waypoints);
            if (saved.name) setRouteName(saved.name);
        } else {
            setUserWaypoints([]);
        }
    }, [currentRouteKey]);

    // Animation
    useEffect(() => {
        if (!running) {
            if (animRef.current) cancelAnimationFrame(animRef.current);
            animRef.current = null;
            return;
        }

        let last = performance.now();
        const pixelsPerSecond = Math.max(20, speedKmh * 30); // visual scale
        const step = (now) => {
            const dt = (now - last) / 1000;
            last = now;
            const dp = (pixelsPerSecond * dt) / Math.max(1, totalLen);
            progressRef.current = Math.min(1, progressRef.current + dp);
            setProgress(progressRef.current);
            setTrail((t) => [...t, robotPos].slice(-800));
            if (progressRef.current >= 1) {
                cancelAnimationFrame(animRef.current);
                animRef.current = null;
                return;
            }
            animRef.current = requestAnimationFrame(step);
        };
        animRef.current = requestAnimationFrame(step);
        return () => animRef.current && cancelAnimationFrame(animRef.current);
    }, [running, totalLen, speedKmh, robotPos]);

    const toPathD = (pts) => pts.map(p => `${p.x},${p.y}`).join(' ');

    // Zona / obstacle / pembatas (bounds tetap, obstacle/nogo editable)
    const BOUNDS = [
        { x: 30, y: 30, w: 940, h: 590, stroke: '#2a335a' },
    ];
    const svgRef = useRef(null);

    // Heatmap kunjungan trail
    const [heat, setHeat] = useState(new Map());
    useEffect(() => {
        if (!running) return;
        setHeat((prev) => {
            const key = `${Math.round(robotPos.x / 10)},${Math.round(robotPos.y / 10)}`;
            const next = new Map(prev);
            next.set(key, (next.get(key) || 0) + 1);
            return next;
        });
    }, [robotPos.x, robotPos.y, running]);

    // Interaksi pan/zoom pada overlay + editing tools
    const toMapPoint = (e) => {
        const rect = svgRef.current.getBoundingClientRect();
        const x = (e.clientX - rect.left - offset.x) / scale;
        const y = (e.clientY - rect.top - offset.y) / scale;
        return { x, y };
    };

    const findPoi = (p) => {
        const entries = Object.entries(locations);
        for (let i = 0; i < entries.length; i++) {
            const [name, pos] = entries[i];
            if (Math.hypot(p.x - pos.x, p.y - pos.y) <= 12) return name;
        }
        return null;
    };

    const dragRef = useRef(null);

    const onWheel = (e) => {
        // Nonaktifkan zoom agar kotak hitam tidak berubah ukuran (permintaan user)
        e.preventDefault();
    };
    const onMouseDown = (e) => {
        if (e.button !== 0) return; // hanya klik kiri
        const p = toMapPoint(e);
        if (activeTool === 'select') {
            // 1) Prioritas: klik di dalam kotak nogo untuk drag block
            const hitNogo = nogo.findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
            if (hitNogo >= 0) {
                dragRef.current = { type: 'nogo', idx: hitNogo, dx: p.x - nogo[hitNogo].x, dy: p.y - nogo[hitNogo].y };
                return;
            }
            // 1b) Klik di dalam obstacle untuk drag obstacle
            const hitObs = obstacles.findIndex(r => p.x >= r.x && p.x <= r.x + r.w && p.y >= r.y && p.y <= r.y + r.h);
            if (hitObs >= 0) {
                dragRef.current = { type: 'obstacle', idx: hitObs, dx: p.x - obstacles[hitObs].x, dy: p.y - obstacles[hitObs].y };
                return;
            }
            // 2) Drag POI jika klik dekat circle
            const name = findPoi(p);
            if (name) {
                dragRef.current = { type: 'poi', name, dx: p.x - locations[name].x, dy: p.y - locations[name].y };
                return;
            }
            // Tidak ada panning background: abaikan
        } else if (activeTool === 'add_box') {
            dragRef.current = { type: 'box', start: p };
        } else if (activeTool === 'edit_route') {
            // choose nearest mid handle
            const mids = userWaypoints.length > 0 ? userWaypoints : controlPoints.slice(1, -1);
            if (mids.length > 0) {
                let best = 0; let bd = 1e9;
                mids.forEach((cp, i) => { const d = Math.hypot(cp.x - p.x, cp.y - p.y); if (d < bd) { bd = d; best = i; } });
                dragRef.current = { type: 'wp', idx: best, dx: p.x - mids[best].x, dy: p.y - mids[best].y };
                if (userWaypoints.length === 0) setUserWaypoints(mids);
            }
        } else if (activeTool === 'add_point') {
            const name = window.prompt('Nama lokasi baru:', 'Custom Point');
            if (name) {
                const cx = VIEWBOX.width / 2;
                const cy = VIEWBOX.height / 2;
                setLocations((prev) => ({ ...prev, [name]: { x: cx, y: cy, color: '#00ffd6', label: name } }));
            }
            setActiveTool('select');
        }
    };
    const onMouseMove = (e) => {
        if (dragRef.current) {
            const p = toMapPoint(e);
            if (dragRef.current.type === 'poi') {
                const { name, dx, dy } = dragRef.current;
                setLocations((prev) => ({ ...prev, [name]: { ...prev[name], x: p.x - dx, y: p.y - dy } }));
                return;
            } else if (dragRef.current.type === 'box') {
                dragRef.current.current = { x: Math.min(dragRef.current.start.x, p.x), y: Math.min(dragRef.current.start.y, p.y), w: Math.abs(p.x - dragRef.current.start.x), h: Math.abs(p.y - dragRef.current.start.y) };
                return;
            } else if (dragRef.current.type === 'nogo') {
                const { idx, dx, dy } = dragRef.current;
                setNogo((prev) => {
                    const arr = [...prev];
                    arr[idx] = { ...arr[idx], x: p.x - dx, y: p.y - dy };
                    return arr;
                });
                return;
            } else if (dragRef.current.type === 'obstacle') {
                const { idx, dx, dy } = dragRef.current;
                setObstacles((prev) => {
                    const arr = [...prev];
                    arr[idx] = { ...arr[idx], x: p.x - dx, y: p.y - dy };
                    return arr;
                });
                return;
            } else if (dragRef.current.type === 'wp') {
                const { idx, dx, dy } = dragRef.current;
                setUserWaypoints((prev) => {
                    const arr = prev.length > 0 ? [...prev] : controlPoints.slice(1, -1);
                    arr[idx] = { x: p.x - dx, y: p.y - dy };
                    return arr;
                });
                return;
            }
        }
        // Panning dinonaktifkan
    };
    const onMouseUp = () => {
        if (dragRef.current?.type === 'box') {
            const box = dragRef.current.current;
            if (box && box.w > 5 && box.h > 5) {
                setNogo((prev) => [...prev, { ...box, color: 'rgba(255,80,80,0.18)', stroke: '#ff4d4d', name: `No-Go ${prev.length + 1}` }]);
            } else {
                // klik tanpa drag -> buat kotak default di tengah
                const cx = VIEWBOX.width / 2 - 60;
                const cy = VIEWBOX.height / 2 - 40;
                setNogo((prev) => [...prev, { x: cx, y: cy, w: 120, h: 80, color: 'rgba(255,80,80,0.18)', stroke: '#ff4d4d', name: `No-Go ${prev.length + 1}` }]);
            }
            setActiveTool('select');
        }
        dragRef.current = null;
        lastPan.current = null;
    };

    // Save / load customized map
    const serializeToCsv = () => {
        const poiCsv = ['name,x,y,color,label'].concat(
            Object.entries(locations).map(([name, p]) => `${name},${Math.round(p.x)},${Math.round(p.y)},${p.color || ''},${p.label || name}`)
        ).join('\n');
        const blockCsv = ['name,x,y,w,h,color,stroke'].concat(
            nogo.map(b => `${b.name || ''},${Math.round(b.x)},${Math.round(b.y)},${Math.round(b.w)},${Math.round(b.h)},${b.color || ''},${b.stroke || ''}`)
        ).join('\n');
        const routeCsv = ['key,name,waypoints'].concat(
            Object.entries(routes).map(([k, r]) => `${k},${r.name || ''},"${(r.waypoints || []).map(p => `${Math.round(p.x)}:${Math.round(p.y)}`).join('|')}"`)
        ).join('\n');
        return { poiCsv, blockCsv, routeCsv };
    };

    const downloadText = (filename, text) => {
        const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url; a.download = filename; a.click();
        URL.revokeObjectURL(url);
    };

    useEffect(() => {
        if (!requestSave) return;
        try {
            const payload = { locations, obstacles, nogo, userWaypoints, routes };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
            const { poiCsv, blockCsv, routeCsv } = serializeToCsv();
            downloadText('map_pois.csv', poiCsv);
            downloadText('map_blocks.csv', blockCsv);
            downloadText('map_routes.csv', routeCsv);
            onSaved && onSaved(true);
        } catch {
            onSaved && onSaved(false);
        }
    }, [requestSave]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem(STORAGE_KEY);
            if (!raw) return;
            const parsed = JSON.parse(raw);
            if (parsed.locations) setLocations(parsed.locations);
            if (parsed.obstacles) setObstacles(parsed.obstacles);
            if (parsed.nogo) setNogo(parsed.nogo);
            if (parsed.userWaypoints) setUserWaypoints(parsed.userWaypoints);
            if (parsed.routes) setRoutes(parsed.routes);
        } catch { }
    }, []);

    // Error handler untuk mencegah crash
    const handleImageError = (e) => {
        console.warn('Failed to load factory map image:', imageSrc);
        e.target.style.display = 'none';
    };

    return (
        <div className="factory-map" onWheel={onWheel} onMouseDown={onMouseDown} onMouseMove={onMouseMove} onMouseUp={onMouseUp} onMouseLeave={onMouseUp}>
            <img
                src={imageSrc}
                alt="Factory Layout"
                className="factory-map-img"
                onError={handleImageError}
                style={{ backgroundColor: '#1a2332' }}
            />
            <svg ref={svgRef} className="factory-overlay" viewBox={`0 0 ${VIEWBOX.width} ${VIEWBOX.height}`} preserveAspectRatio="xMidYMid meet">
                <g transform={`scale(${scale})`}>
                    {/* Bounds */}
                    {BOUNDS.map((b, i) => (
                        <rect key={`b-${i}`} x={b.x} y={b.y} width={b.w} height={b.h} fill="none" stroke={b.stroke} strokeWidth="6" />
                    ))}

                    {/* Grid */}
                    {Array.from({ length: 20 }).map((_, i) => (
                        <line key={`gh-${i}`} x1={40} y1={40 + i * 30} x2={960} y2={40 + i * 30} stroke="rgba(255,255,255,0.08)" strokeWidth={i % 5 === 0 ? 2 : 1} />
                    ))}
                    {Array.from({ length: 28 }).map((_, i) => (
                        <line key={`gv-${i}`} x1={40 + i * 33} y1={40} x2={40 + i * 33} y2={630} stroke="rgba(255,255,255,0.08)" strokeWidth={i % 5 === 0 ? 2 : 1} />
                    ))}

                    {/* Obstacles */}
                    {obstacles.map((o, i) => (
                        <g key={`o-${i}`}>
                            <rect x={o.x} y={o.y} width={o.w} height={o.h} fill={o.color || 'rgba(100,110,160,0.45)'} stroke={o.stroke || 'rgba(255,255,255,0.15)'} strokeWidth="2" />
                            {o.name && <text x={o.x + o.w / 2} y={o.y - 6} textAnchor="middle" fill="#e6edff" fontSize="12" onClick={() => {
                                const nn = window.prompt('Nama block', o.name || 'Block');
                                if (nn) setObstacles(prev => { const arr = [...prev]; arr[i] = { ...arr[i], name: nn }; return arr; });
                            }}>{o.name}</text>}
                        </g>
                    ))}

                    {/* No-Go zones */}
                    {nogo.map((n, i) => (
                        <g key={`n-${i}`}>
                            <rect x={n.x} y={n.y} width={n.w} height={n.h} fill={n.color || 'rgba(255,80,80,0.18)'} stroke={n.stroke || '#ff4d4d'} strokeDasharray="8 6" strokeWidth="2"
                                onDoubleClick={() => {
                                    const w = parseInt(window.prompt('Lebar (w)', String(Math.round(n.w))) || String(n.w), 10);
                                    const h = parseInt(window.prompt('Tinggi (h)', String(Math.round(n.h))) || String(n.h), 10);
                                    const color = window.prompt('Warna fill (rgba/hex)', n.color || 'rgba(255,80,80,0.18)') || n.color;
                                    setNogo(prev => { const arr = [...prev]; arr[i] = { ...arr[i], w: isNaN(w) ? arr[i].w : w, h: isNaN(h) ? arr[i].h : h, color }; return arr; });
                                }}
                            />
                            {n.name && <text x={n.x + n.w / 2} y={n.y - 6} textAnchor="middle" fill="#ffb3b3" fontSize="12" onClick={() => {
                                const nn = window.prompt('Nama No-Go', n.name || 'No-Go');
                                if (nn) setNogo(prev => { const arr = [...prev]; arr[i] = { ...arr[i], name: nn }; return arr; });
                            }}>{n.name}</text>}
                        </g>
                    ))}

                    {/* Temp box drawing */}
                    {dragRef.current?.type === 'box' && dragRef.current.current && (
                        <rect x={dragRef.current.current.x} y={dragRef.current.current.y} width={dragRef.current.current.w} height={dragRef.current.current.h} fill="rgba(255,80,80,0.1)" stroke="#ff4d4d" strokeDasharray="6 4" />
                    )}

                    {/* POIs */}
                    {Object.entries(locations).map(([name, pos]) => (
                        <g key={name}>
                            <rect x={(pos.x - (pos.bw || 22))} y={(pos.y - (pos.bh || 16))} width={(pos.bw || 22) * 2} height={(pos.bh || 16) * 2} fill="rgba(255,77,77,0.12)" stroke={pos.bcolor || '#ff4d4d'} strokeWidth="3" />
                            <circle cx={pos.x} cy={pos.y} r={8} fill={pos.color || '#00ffd6'} opacity="0.95" />
                            <text x={pos.x + 12} y={pos.y + 4} fill="#111111" stroke="#ffffff" strokeWidth="3" paintOrder="stroke" fontSize="16" fontWeight="800"
                                onClick={() => {
                                    const lbl = window.prompt('Nama titik', pos.label || name);
                                    if (lbl) setLocations(prev => ({ ...prev, [name]: { ...prev[name], label: lbl } }));
                                }}
                            >{pos.label || name}</text>
                        </g>
                    ))}

                    {/* Route handles (edit mode) */}
                    {activeTool === 'edit_route' && controlPoints.slice(1, -1).map((p, i) => (
                        <g key={`h-${i}`}>
                            <circle cx={p.x} cy={p.y} r={7} fill="#00ffd6" stroke="#0b1020" strokeWidth="2" />
                        </g>
                    ))}

                    {/* Planned route */}
                    <polyline points={toPathD(sampled)} fill="none" stroke="#9c4dff" strokeWidth="6" strokeOpacity="0.9" />
                    {/* Route name label (click to rename) */}
                    {sampled.length > 0 && (
                        <text x={sampled[Math.floor(sampled.length / 2)].x} y={sampled[Math.floor(sampled.length / 2)].y - 10} textAnchor="middle" fill="#d8c7ff" stroke="#2b1d4a" strokeWidth="2" fontSize="14" onClick={() => {
                            const nn = window.prompt('Nama rute', routeName);
                            if (nn) setRouteName(nn);
                        }}>{routeName}</text>
                    )}

                    {/* Trail */}
                    {trail.length > 1 && (
                        <polyline points={toPathD(trail)} fill="none" stroke="#b400ff" strokeWidth="3" strokeOpacity="0.55" />
                    )}

                    {/* Heatmap */}
                    {[...heat.entries()].map(([key, count]) => {
                        const [gx, gy] = key.split(',').map(Number);
                        const x = gx * 10;
                        const y = gy * 10;
                        const intensity = Math.min(1, count / 20);
                        return <rect key={`h-${key}`} x={x} y={y} width="10" height="10" fill={`rgba(255,0,0,${0.15 * intensity})`} />
                    })}

                    {/* Robot icon */}
                    <image href={robotImg} x={robotPos.x - 14} y={robotPos.y - 18} width="28" height="36" />

                    {/* Legend */}
                    <g transform={`translate(${40},${600})`}>
                        <rect x={0} y={-24} width={320} height={24} rx={6} fill="rgba(0,0,0,0.4)" />
                        <circle cx={14} cy={-12} r={6} fill="#00ffd6" />
                        <text x={26} y={-8} fill="#e6edff" fontSize="12">Lines</text>
                        <circle cx={80} cy={-12} r={6} fill="#ffc14d" />
                        <text x={92} y={-8} fill="#e6edff" fontSize="12">Finishing</text>
                        <circle cx={158} cy={-12} r={6} fill="#7aa6ff" />
                        <text x={170} y={-8} fill="#e6edff" fontSize="12">Sewing</text>
                        <rect x={230} y={-18} width={14} height={14} fill="rgba(255,80,80,0.18)" stroke="#ff4d4d" strokeDasharray="8 6" />
                        <text x={250} y={-8} fill="#e6edff" fontSize="12">No-Go</text>
                    </g>
                </g>
            </svg>
            <div className="map-controls">
                <button className="btn btn-route" onClick={() => {
                    const mids = controlPoints.slice(1, -1);
                    setRoutes(prev => ({ ...prev, [currentRouteKey]: { waypoints: mids, name: routeName } }));
                }}>Set Route</button>
                <button className={`btn ${running ? 'btn-stop' : 'btn-primary'}`} onClick={() => onToggleRun && onToggleRun(!running)}>{running ? 'Stop' : 'Start'}</button>
                <button className="btn btn-secondary" onClick={() => setActiveTool('add_point')}>+ Add Point</button>
                <button className="btn btn-secondary" onClick={() => setActiveTool('add_box')}>▭ Add Block</button>
                <button className={`btn ${activeTool === 'edit_route' ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setActiveTool(activeTool === 'edit_route' ? 'select' : 'edit_route')}>✎ Edit Route</button>
                <button className="btn btn-primary" onClick={() => {
                    try {
                        const payload = { locations, obstacles, nogo, userWaypoints, routes };
                        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
                        const { poiCsv, blockCsv, routeCsv } = serializeToCsv();
                        downloadText('map_pois.csv', poiCsv);
                        downloadText('map_blocks.csv', blockCsv);
                        downloadText('map_routes.csv', routeCsv);
                        onSaved && onSaved(true);
                    } catch {
                        onSaved && onSaved(false);
                    }
                }}>💾 Save Map</button>
                <button className="btn btn-secondary" onClick={() => {
                    try {
                        // Reset ke default dari file
                        if (defaultMapData && defaultMapData.locations) setLocations(defaultMapData.locations);
                        if (defaultMapData && defaultMapData.nogo) setNogo(defaultMapData.nogo);
                        if (defaultMapData && defaultMapData.obstacles) setObstacles(defaultMapData.obstacles);
                        if (defaultMapData && defaultMapData.routes) setRoutes(defaultMapData.routes);
                    } catch (e) {
                        console.warn('Load default map failed:', e);
                    }
                }}>⤓ Load Default</button>
                <label className="btn" style={{ cursor: 'pointer' }}>
                    ⤓ Import CSV
                    <input type="file" accept=".csv" style={{ display: 'none' }} multiple onChange={async (e) => {
                        try {
                            const files = Array.from(e.target.files || []);
                            if (files.length === 0) return;
                            const textPromises = files.map(f => f.text());
                            const contents = await Promise.all(textPromises);
                            // simple CSV detection by header
                            const parseCsv = (txt) => txt.split(/\r?\n/).filter(Boolean).map(l => l.split(','));
                            let nextLocations = { ...locations };
                            let nextNogo = [...nogo];
                            let nextRoutes = { ...routes };
                            contents.forEach(txt => {
                                const lines = parseCsv(txt);
                                const header = (lines[0] || []).map(s => s.trim());
                                if (header.join(',').toLowerCase().includes('name,x,y,color')) {
                                    // POI CSV
                                    for (let i = 1; i < lines.length; i++) {
                                        const [name, x, y, color, label] = lines[i];
                                        if (!name) continue;
                                        nextLocations[name] = { x: Number(x), y: Number(y), color: color || '#00ffd6', label: label || name };
                                    }
                                } else if (header.join(',').toLowerCase().includes('name,x,y,w,h')) {
                                    // BLOCK CSV
                                    const acc = [];
                                    for (let i = 1; i < lines.length; i++) {
                                        const [name, x, y, w, h, color, stroke] = lines[i];
                                        if (!x || !y || !w || !h) continue;
                                        acc.push({ name: name || `No-Go ${i}`, x: Number(x), y: Number(y), w: Number(w), h: Number(h), color: color || 'rgba(255,80,80,0.18)', stroke: stroke || '#ff4d4d' });
                                    }
                                    nextNogo = acc;
                                } else if (header.join(',').toLowerCase().includes('key,name,waypoints')) {
                                    // ROUTE CSV
                                    for (let i = 1; i < lines.length; i++) {
                                        const [key, name, waypoints] = lines[i];
                                        const pts = (waypoints || '').replaceAll('"', '').split('|').filter(Boolean).map(p => {
                                            const [sx, sy] = p.split(':');
                                            return { x: Number(sx), y: Number(sy) };
                                        });
                                        nextRoutes[key] = { name: name || 'Route', waypoints: pts };
                                    }
                                }
                            });
                            setLocations(nextLocations);
                            setNogo(nextNogo);
                            setRoutes(nextRoutes);
                            onSaved && onSaved(true);
                        } catch (err) {
                            console.warn('Failed to import CSV:', err);
                            onSaved && onSaved(false);
                        } finally {
                            e.target.value = '';
                        }
                    }} />
                </label>
            </div>
        </div>
    );
};

export default FactoryMap;


