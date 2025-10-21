/**
 * RFID System - Main Application
 * Professional RFID scanning and monitoring system
 */

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/Sidebar';
import DaftarRFID from './components/RFID/DaftarRFID';
import MonitoringRFID from './components/RFID/MonitoringRFID';
import ListID from './components/RFID/ListID';
import { RFIDProvider } from './context/RFIDContext';

function App() {
  return (
    <Router>
      <RFIDProvider>
        <div className="app">
          <Sidebar />
          <main className="main-content">
            <Routes>
              <Route path="/" element={<MonitoringRFID />} />
              <Route path="/daftar-rfid" element={<DaftarRFID />} />
              <Route path="/list-id" element={<ListID />} />
            </Routes>
          </main>
        </div>
      </RFIDProvider>
    </Router>
  );
}

export default App;
