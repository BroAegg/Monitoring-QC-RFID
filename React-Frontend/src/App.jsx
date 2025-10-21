/**
 * RFID System - Main Application
 * Professional RFID scanning and monitoring system
 */

import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DaftarRFID from './components/RFID/DaftarRFID';
import MonitoringRFID from './components/RFID/MonitoringRFID';
import ListID from './components/RFID/ListID';
import { RFIDProvider } from './context/RFIDContext';

function AppContent() {
  const location = useLocation();
  const isMonitoringPage = location.pathname === '/';

  return (
    <div className="app">
      {!isMonitoringPage && <Sidebar />}
      <main className={isMonitoringPage ? "main-content-fullscreen" : "main-content"}>
        <Routes>
          <Route path="/" element={<MonitoringRFID />} />
          <Route path="/daftar-rfid" element={<DaftarRFID />} />
          <Route path="/list-id" element={<ListID />} />
        </Routes>
      </main>
    </div>
  );
}

function App() {
  return (
    <Router>
      <RFIDProvider>
        <AppContent />
      </RFIDProvider>
    </Router>
  );
}

export default App;
