/**
 * RFID System - Sidebar Navigation
 * Professional blue-themed navigation for RFID scanning system
 */

import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import gistexLogo from '../assets/gistex.png';

const Sidebar = () => {
    const location = useLocation();
    const [systemOnline, setSystemOnline] = useState(true);
    const [rfidConnected, setRfidConnected] = useState(false);

    // Simulate connection status (replace with real logic later)
    useEffect(() => {
        // Check system status
        setSystemOnline(true);
        
        // Simulate RFID connection check
        const checkRfidConnection = () => {
            // TODO: Replace with real RFID connection check
            // For now, simulate random connection status
            const isConnected = Math.random() > 0.3; // 70% chance connected
            setRfidConnected(isConnected);
        };

        checkRfidConnection();
        const interval = setInterval(checkRfidConnection, 5000); // Check every 5 seconds

        return () => clearInterval(interval);
    }, []);

    const menuItems = [
        {
            id: 'daftar-rfid',
            title: 'Daftar RFID',
            icon: '📋',
            path: '/daftar-rfid'
        },
        {
            id: 'monitoring-rfid',
            title: 'Monitoring RFID',
            icon: '📊',
            path: '/'
        },
        {
            id: 'list-id',
            title: 'List ID',
            icon: '📄',
            path: '/list-id'
        }
    ];

    const isActive = (path) => {
        return location.pathname === path;
    };

    return (
        <div className="sidebar">
            {/* Header */}
            <div className="sidebar-header">
                <div className="logo-container">
                    <div className="logo">
                        <img src={gistexLogo} alt="Gistex Logo" className="logo-image" />
                    </div>
                </div>
            </div>

            {/* Navigation Menu */}
            <nav className="sidebar-nav">
                <ul className="nav-list">
                    {menuItems.map((item) => (
                        <li key={item.id} className="nav-item">
                            <Link
                                to={item.path}
                                className={`nav-link ${isActive(item.path) ? 'active' : ''}`}
                            >
                                <div className="nav-icon">{item.icon}</div>
                                <div className="nav-content">
                                    <span className="nav-title">{item.title}</span>
                                </div>
                                {isActive(item.path) && (
                                    <div className="active-indicator"></div>
                                )}
                            </Link>
                        </li>
                    ))}
                </ul>
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="system-status">
                    <div className="status-item">
                        <div className={`status-dot ${systemOnline ? 'online' : 'offline'}`}></div>
                        <span>System {systemOnline ? 'Online' : 'Offline'}</span>
                    </div>
                    <div className="status-item">
                        <div className={`status-dot ${rfidConnected ? 'connected' : 'disconnected'}`}></div>
                        <span>RFID {rfidConnected ? 'Connected' : 'Disconnected'}</span>
                    </div>
                </div>
                <div className="version-info">
                    <span>RFID System v2.1.0</span>
                </div>
            </div>
        </div>
    );
};

export default Sidebar; 