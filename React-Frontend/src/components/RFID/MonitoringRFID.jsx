/**
 * Monitoring RFID Component - Fleet Dashboard Style
 * Dashboard untuk monitoring produksi dengan layout visual seperti GCC Fleet
 */

import { useState, useEffect } from 'react';
import './MonitoringRFID.css';

const MonitoringRFID = () => {
    // Dummy data untuk dashboard
    const [dashboardData, setDashboardData] = useState({
        totalSewingOutput: 3000,
        sewingOutput: 1000,
        reject: 150,
        rework: 300,
        hasper: 50,
        goodProduct: 1500,
        targetProduction: 3000,
        actualProduction: 2500,
        hourlyOutput: [
            { hour: 1, output: 120 },
            { hour: 2, output: 180 },
            { hour: 3, output: 250 },
            { hour: 4, output: 220 },
            { hour: 5, output: 200 },
            { hour: 6, output: 190 },
            { hour: 7, output: 240 },
            { hour: 8, output: 280 },
            { hour: 9, output: 260 },
            { hour: 10, output: 240 },
            { hour: 11, output: 200 },
            { hour: 12, output: 180 },
            { hour: 13, output: 160 }
        ]
    });

    // Calculate percentages for donut chart
    const total = dashboardData.totalSewingOutput;
    const percentages = {
        sewingOutput: ((dashboardData.sewingOutput / total) * 100).toFixed(1),
        reject: ((dashboardData.reject / total) * 100).toFixed(1),
        rework: ((dashboardData.rework / total) * 100).toFixed(1),
        hasper: ((dashboardData.hasper / total) * 100).toFixed(1),
        goodProduct: ((dashboardData.goodProduct / total) * 100).toFixed(1)
    };

    // Calculate efficiency
    const efficiency = ((dashboardData.actualProduction / dashboardData.targetProduction) * 100).toFixed(1);

    return (
        <div className="monitoring-rfid-container">
            <div className="monitoring-header">
                <h1>📊 Monitoring RFID - Production Dashboard</h1>
                <p className="monitoring-subtitle">Real-time production monitoring & analytics</p>
            </div>

            {/* Top Section: Charts & Stats */}
            <div className="top-section">
                {/* Total Sewing Output - Donut Chart */}
                <div className="card donut-card">
                    <div className="card-header">
                        <h3>Total Sewing Output</h3>
                    </div>
                    <div className="donut-chart">
                        <div className="donut-center">
                            <div className="donut-value">{total}</div>
                            <div className="donut-label">Units</div>
                        </div>
                        {/* Donut segments (simplified - bisa pakai library charting nanti) */}
                        <svg viewBox="0 0 200 200" className="donut-svg">
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#10B981" strokeWidth="40" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#EF4444" strokeWidth="40" 
                                    strokeDasharray="40 440" strokeDashoffset="0" />
                            <circle cx="100" cy="100" r="80" fill="none" stroke="#F59E0B" strokeWidth="40" 
                                    strokeDasharray="75 405" strokeDashoffset="-40" />
                        </svg>
                    </div>
                    <div className="donut-stats">
                        <div className="stat-item">
                            <span className="stat-dot good"></span>
                            <span>Good: {dashboardData.goodProduct} ({percentages.goodProduct}%)</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-dot reject"></span>
                            <span>Reject: {dashboardData.reject} ({percentages.reject}%)</span>
                        </div>
                        <div className="stat-item">
                            <span className="stat-dot rework"></span>
                            <span>Rework: {dashboardData.rework} ({percentages.rework}%)</span>
                        </div>
                    </div>
                </div>

                {/* Trend Output - Line Chart */}
                <div className="card trend-card">
                    <div className="card-header">
                        <h3>Output Trend</h3>
                        <div className="trend-info">
                            <span>Total: {dashboardData.totalSewingOutput} units</span>
                            <span>Avg/Hour: {Math.round(dashboardData.totalSewingOutput / 13)} units</span>
                        </div>
                    </div>
                    <div className="line-chart">
                        {/* Simplified line chart - replace with Chart.js or Recharts */}
                        <div className="chart-placeholder">
                            <svg viewBox="0 0 400 150" className="line-svg">
                                <polyline
                                    fill="none"
                                    stroke="#3B82F6"
                                    strokeWidth="3"
                                    points="10,130 40,100 70,60 100,70 130,80 160,85 190,70 220,40 250,50 280,70 310,80 340,90 370,100"
                                />
                                <circle cx="10" cy="130" r="4" fill="#3B82F6" />
                                <circle cx="370" cy="100" r="4" fill="#3B82F6" />
                            </svg>
                        </div>
                        <div className="chart-labels">
                            <span>Hour 1</span>
                            <span>Hour 7</span>
                            <span>Hour 13</span>
                        </div>
                    </div>
                </div>

                {/* Target vs Actual */}
                <div className="card target-card">
                    <div className="card-header">
                        <h3>Production Target</h3>
                    </div>
                    <div className="target-content">
                        <div className="target-value">
                            <div className="target-label">Target</div>
                            <div className="target-number">{dashboardData.targetProduction}</div>
                        </div>
                        <div className="target-progress">
                            <div className="progress-bar">
                                <div className="progress-fill" style={{ width: `${efficiency}%` }}></div>
                            </div>
                            <div className="progress-label">{efficiency}%</div>
                        </div>
                        <div className="target-value">
                            <div className="target-label">Actual</div>
                            <div className="target-number actual">{dashboardData.actualProduction}</div>
                        </div>
                    </div>
                    <div className="target-footer">
                        <span className={efficiency >= 80 ? 'status-good' : 'status-warning'}>
                            {efficiency >= 100 ? '✅ Target Achieved' : 
                             efficiency >= 80 ? '⚡ On Track' : '⚠️ Below Target'}
                        </span>
                    </div>
                </div>
            </div>

            {/* Middle Section: 5 Main Cards */}
            <div className="middle-section">
                {/* Sewing Output */}
                <div className="metric-card blue">
                    <div className="metric-icon">📦</div>
                    <div className="metric-content">
                        <div className="metric-label">Sewing Output</div>
                        <div className="metric-value">{dashboardData.sewingOutput}</div>
                        <div className="metric-subtitle">Total units produced</div>
                    </div>
                </div>

                {/* Reject */}
                <div className="metric-card red">
                    <div className="metric-icon">❌</div>
                    <div className="metric-content">
                        <div className="metric-label">Reject</div>
                        <div className="metric-value">{dashboardData.reject}</div>
                        <div className="metric-subtitle">{percentages.reject}% of total</div>
                    </div>
                </div>

                {/* Rework */}
                <div className="metric-card orange">
                    <div className="metric-icon">🔄</div>
                    <div className="metric-content">
                        <div className="metric-label">Rework</div>
                        <div className="metric-value">{dashboardData.rework}</div>
                        <div className="metric-subtitle">{percentages.rework}% of total</div>
                    </div>
                </div>

                {/* Hasper */}
                <div className="metric-card yellow">
                    <div className="metric-icon">⚡</div>
                    <div className="metric-content">
                        <div className="metric-label">Hasper</div>
                        <div className="metric-value">{dashboardData.hasper}</div>
                        <div className="metric-subtitle">{percentages.hasper}% of total</div>
                    </div>
                </div>

                {/* Good Product */}
                <div className="metric-card green">
                    <div className="metric-icon">✅</div>
                    <div className="metric-content">
                        <div className="metric-label">Good Product</div>
                        <div className="metric-value">{dashboardData.goodProduct}</div>
                        <div className="metric-subtitle">{percentages.goodProduct}% of total</div>
                    </div>
                </div>
            </div>

            {/* Bottom Section: Additional Detail Cards */}
            <div className="bottom-section">
                {/* Reject Detail */}
                <div className="detail-card red">
                    <div className="detail-icon">❌</div>
                    <div className="detail-content">
                        <div className="detail-label">Reject</div>
                        <div className="detail-value">{dashboardData.reject}</div>
                        <div className="detail-subtitle">{percentages.reject}% of total</div>
                    </div>
                </div>

                {/* Rework Detail */}
                <div className="detail-card orange">
                    <div className="detail-icon">🔄</div>
                    <div className="detail-content">
                        <div className="detail-label">Rework</div>
                        <div className="detail-value">{dashboardData.rework}</div>
                        <div className="detail-subtitle">{percentages.rework}% of total</div>
                    </div>
                </div>

                {/* Hasper Detail */}
                <div className="detail-card yellow">
                    <div className="detail-icon">⚡</div>
                    <div className="detail-content">
                        <div className="detail-label">Hasper</div>
                        <div className="detail-value">{dashboardData.hasper}</div>
                        <div className="detail-subtitle">{percentages.hasper}% of total</div>
                    </div>
                </div>

                {/* Good Product Detail */}
                <div className="detail-card green">
                    <div className="detail-icon">✅</div>
                    <div className="detail-content">
                        <div className="detail-label">Good Product</div>
                        <div className="detail-value">{dashboardData.goodProduct}</div>
                        <div className="detail-subtitle">{percentages.goodProduct}% of total</div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MonitoringRFID;
