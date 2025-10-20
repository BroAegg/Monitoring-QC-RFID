import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import './MonitoringQC.css'; // PENTING: Pastikan file CSS ini diimpor!

// --- KONFIGURASI ---
const QC_NODES = [
    { id: 'qc_end_line', title: 'QC Endline', emoji: '🧪', gridArea: '2 / 2 / 5 / 5' },
    { id: 'pqc', title: 'PQC', emoji: '🛡️', gridArea: '2 / 6 / 5 / 9' },
    { id: 'qc_end_line_hasper', title: 'QC HasPer', emoji: '✨', gridArea: '6 / 4 / 9 / 7' },
    { id: 'reject_room', title: 'Reject Area', emoji: '🚫', gridArea: '2 / 10 / 5 / 13' },
];

const EDGES = [
    { from: 'qc_end_line', to: 'pqc', variant: 'ok' },
    { from: 'qc_end_line', to: 'reject_room', variant: 'reject' },
    { from: 'qc_end_line', to: 'qc_end_line_hasper', variant: 'rework' },
    { from: 'pqc', to: 'qc_end_line_hasper', variant: 'rework' },
    { from: 'reject_room', to: 'qc_end_line_hasper', variant: 'rework' },
    { from: 'qc_end_line_hasper', to: 'qc_end_line', variant: 'ok' },
];

// Helper untuk deep copy
const clone = (obj) => JSON.parse(JSON.stringify(obj));

// --- KOMPONEN-KOMPONEN KECIL ---

// Komponen untuk setiap Gate/Node
const GateNode = ({ node, data, onNodeClick }) => {
    return (
        <div className="gate-node" style={{ gridArea: node.gridArea }} onClick={() => onNodeClick(node.id)}>
            <div className="node-header">
                <span className="node-emoji">{node.emoji}</span>
                <h3>{node.title}</h3>
                <div className="node-total">{data.ids.length}</div>
            </div>
            <div className="node-stats">
                {Object.entries(data.stats).map(([key, value]) => (
                    <div className="stat-item" key={key}>
                        <span>{key.replace('_', ' ')}</span>
                        <strong>{value}</strong>
                    </div>
                ))}
            </div>
            <div className="id-list-preview">
                {data.ids.slice(0, 4).map(id => <span key={id}>{id}</span>)}
                {data.ids.length > 4 && <span className="more-ids">+{data.ids.length - 4}...</span>}
            </div>
        </div>
    );
};

// Komponen untuk Modal Detail
const DetailModal = ({ nodeId, gates, nodes, onClose }) => {
    if (!nodeId) return null;
    const node = nodes.find(n => n.id === nodeId);
    const data = gates[nodeId];

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <button className="modal-close" onClick={onClose}>&times;</button>
                <div className="modal-header">
                    <span className="node-emoji">{node.emoji}</span>
                    <h2>Detail: {node.title}</h2>
                </div>
                <div className="modal-body">
                    <h4>Current Items ({data.ids.length})</h4>
                    <ul className="modal-id-list">
                        {data.ids.length > 0 ? data.ids.map(id => <li key={id}>{id}</li>) : <p>No items in this gate.</p>}
                    </ul>
                    <h4>Statistics</h4>
                    <div className="modal-stats">
                        {Object.entries(data.stats).map(([key, value]) => (
                            <p key={key}><strong>{key.replace('_', ' ')}:</strong> {value}</p>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

// Komponen untuk Panel Kontrol
const ControlPanel = ({ isSimulating, onToggle, onReset, speed, onSpeedChange }) => {
    return (
        <div className="control-panel">
            <h4>Simulation Controls</h4>
            <button onClick={onToggle}>{isSimulating ? '⏸️ Pause' : '▶️ Start'}</button>
            <button onClick={onReset}>🔄 Reset</button>
            <div className="speed-control">
                <label>Speed:</label>
                <input type="range" min="500" max="3000" step="100" value={speed} onChange={e => onSpeedChange(e.target.value)} />
                <span>{(3500 - speed) / 1000}s</span>
            </div>
        </div>
    );
};

// --- KOMPONEN UTAMA ---
const MonitoringQC = () => {
    // State management
    const [gates, setGates] = useState({});
    const [comets, setComets] = useState([]);
    const [isSimulating, setIsSimulating] = useState(false);
    const [simulationSpeed, setSimulationSpeed] = useState(1500);
    const [activeModal, setActiveModal] = useState(null);
    const initializedRef = useRef(false);

    // Inisialisasi state gates
    const initializeGates = useCallback(() => {
        const initial = {};
        QC_NODES.forEach(n => {
            initial[n.id] = { ids: [], stats: { good: 0, reject: 0, rework: 0, in: 0 } };
        });
        setGates(initial);
    }, []);

    useEffect(() => {
        if (!initializedRef.current) {
            initializeGates();
            initializedRef.current = true;
        }
    }, [initializeGates]);

    // Total Unique ID
    const totalUniqueIds = useMemo(() => {
        const allIds = new Set();
        Object.values(gates).forEach(g => g.ids.forEach(id => allIds.add(id)));
        return allIds.size;
    }, [gates]);

    // Fungsi untuk memicu animasi partikel
    const triggerComet = (from, to, variant) => {
        const key = `${Date.now()}-${Math.random()}`;
        setComets(prev => [...prev, { from, to, variant, key }]);
        setTimeout(() => setComets(prev => prev.filter(c => c.key !== key)), 2000);
    };

    // Logika utama alur perpindahan item
    const routeItem = useCallback((startGate, itemId, decision) => {
        let targetGate = null;
        let variant = 'ok';

        if (startGate === 'qc_end_line') {
            if (decision === 'good') { targetGate = 'pqc'; variant = 'ok'; }
            else if (decision === 'reject') { targetGate = 'reject_room'; variant = 'reject'; }
            else if (decision === 'rework') { targetGate = 'qc_end_line_hasper'; variant = 'rework'; }
        } else if (startGate === 'pqc') {
            if (decision === 'rework') { targetGate = 'qc_end_line_hasper'; variant = 'rework'; }
        } else if (startGate === 'reject_room') {
            if (decision === 'rework') { targetGate = 'qc_end_line_hasper'; variant = 'rework'; }
        } else if (startGate === 'qc_end_line_hasper') {
            if (decision === 'good') { targetGate = 'qc_end_line'; variant = 'ok'; }
        }

        if (targetGate) {
            setGates(prev => {
                const next = clone(prev);
                // Hapus dari semua gate lain
                Object.keys(next).forEach(gId => {
                    next[gId].ids = next[gId].ids.filter(id => id !== itemId);
                });
                // Tambah ke gate tujuan
                next[targetGate].ids.unshift(itemId);

                // Update statistik
                if (next[startGate].stats[decision] !== undefined) {
                    next[startGate].stats[decision]++;
                }
                if (next[targetGate].stats['in'] !== undefined) {
                    next[targetGate].stats['in']++;
                }

                return next;
            });
            triggerComet(startGate, targetGate, variant);
        }
    }, []);

    // Efek untuk menjalankan simulasi
    useEffect(() => {
        if (!isSimulating) return;

        const timer = setInterval(() => {
            const id = `ID-${Math.random().toString(36).substr(2, 5).toUpperCase()}`;
            const decisions = ['good', 'reject', 'rework'];
            const randomDecision = decisions[Math.floor(Math.random() * decisions.length)];

            // Masukkan item baru ke gate awal
            setGates(prev => {
                const next = clone(prev);
                next.qc_end_line.ids.unshift(id);
                return next;
            });

            // Proses item setelah delay singkat
            setTimeout(() => routeItem('qc_end_line', id, randomDecision), 500);

        }, 3500 - simulationSpeed);

        return () => clearInterval(timer);
    }, [isSimulating, simulationSpeed, routeItem]);

    return (
        <div className="qc-dashboard-container">
            <header className="dashboard-header">
                <h1>Flow Monitoring QC RFID</h1>
                <div className="header-info">
                    <span>Total Unique ID</span>
                    <strong>{totalUniqueIds}</strong>
                </div>
            </header>

            <main className="flow-canvas">
                {QC_NODES.map(node => (
                    <GateNode
                        key={node.id}
                        node={node}
                        data={gates[node.id] || { ids: [], stats: {} }}
                        onNodeClick={setActiveModal}
                    />
                ))}

                {/* Layer untuk menggambar konektor SVG */}
                <svg className="svg-connector-layer" preserveAspectRatio="xMidYMid meet">
                    {EDGES.map((edge) => {
                        const activeComets = comets.filter(c => c.from === edge.from && c.to === edge.to);
                        return (
                            <path key={`${edge.from}-${edge.to}`}
                                id={`path-${edge.from}-${edge.to}`}
                                className={`connector-path ${activeComets.length > 0 ? 'glowing' : ''} variant-${edge.variant}`}
                            />
                        );
                    })}
                    {comets.map(comet => (
                        <circle key={comet.key} r="6" className={`comet variant-${comet.variant}`}>
                            <animateMotion dur="1.5s" begin="0s" fill="freeze">
                                <mpath href={`#path-${comet.from}-${comet.to}`} />
                            </animateMotion>
                        </circle>
                    ))}
                </svg>
            </main>

            <ControlPanel
                isSimulating={isSimulating}
                onToggle={() => setIsSimulating(s => !s)}
                onReset={initializeGates}
                speed={simulationSpeed}
                onSpeedChange={setSimulationSpeed}
            />

            <DetailModal
                nodeId={activeModal}
                gates={gates}
                nodes={QC_NODES}
                onClose={() => setActiveModal(null)}
            />
        </div>
    );
};

export default MonitoringQC;