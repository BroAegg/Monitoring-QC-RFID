# INTEGRASI WEBSOCKET RFID KE FRONTEND REACT

## Langkah1Install Dependensi WebSocket

```bash
cd website-productivity
npm install react-use-websocket
```

## Langkah 2 Modifikasi DaftarID.jsx

### 2.1 Tambahkan Import
```jsx
// Tambahkan di bagian atas file, setelah import yang sudah ada
import { useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket';
```

### 20.2mbahkan State RFID
```jsx
// Tambahkan setelah state yang sudah ada
const [isScanMode, setIsScanMode] = useState(false);
constwsConnected, setWsConnected] = useState(false);
```

###2.3ambahkan WebSocket Connection
```jsx
// Tambahkan setelah state declarations
const { lastMessage, readyState } = useWebSocket('ws://12700.18000s/rfid/', {
    onOpen: () =>[object Object]       console.log('WebSocket terhubung');
        setWsConnected(true);
    },
    onClose: () =>[object Object]       console.log('WebSocket terputus');
        setWsConnected(false);
    },
    onError: (error) =>[object Object]     console.error('WebSocket error:, error);
        setWsConnected(false);
    },
    shouldReconnect: (closeEvent) => true,
    reconnectInterval: 3000
```

### 2.4 Tambahkan Handler WebSocket Message
```jsx
// Tambahkan useEffect untuk handle pesan WebSocket
useEffect(() => {
    if (lastMessage) {
        try {
            const data = JSON.parse(lastMessage.data);
            console.log('Pesan WebSocket:', data);
            
            if (data.status === 'found')[object Object]                // Data RFID ditemukan
                setFormData({
                    ...formData,
                    id: data.data.rfid_tag,
                    nama: data.data.name,
                    nik: data.data.details || '',
                    bagian: '',
                    line: '',
                    fasilitas:               });
                showMessage(`RFID ${data.data.rfid_tag} ditemukan! Data terisi otomatis.`, 'success');
            } else if (data.status === 'not_found')[object Object]                // RFID baru
                setFormData({
                    ...formData,
                    id: data.rfid,
                    nama: '',
                    nik: '',
                    bagian: '',
                    line: '',
                    fasilitas:               });
                showMessage(`RFID baru: ${data.rfid}. Silakan lengkapi data.`, 'info);     }
            setIsScanMode(false);
        } catch (error) {
            console.error(Error parsing WebSocket message:,error);
        }
    }
}, [lastMessage]);
```

### 20.5ifikasi Form Input ID
```jsx
// Ganti bagian form input ID yang sudah ada dengan yang berikut:
<div className="form-group>    <label htmlFor="id">ID:</label>
    <div style={{ display: flex', gap: 10px', alignItems: 'center' }}>
        <input
            type=text            id="id            name="id"
            value={formData.id}
            onChange={handleInputChange}
            placeholder="Masukkan ID atau scan RFID"
            className="form-input"
            style={{ flex: 1 }}
        />
        <button
            type="button"
            onClick={() =>[object Object]             setIsScanMode(true);
                showMessage(Silakan scan RFID...', 'info');
            }}
            className=btn btn-primary"
            style={{ whiteSpace: 'nowrap' }}
            disabled={isLoading}
        >
         [object Object]isScanMode ?Scanning...' : 'Scan RFID'}
        </button>
    </div>
    {isScanMode && (
        <div style={{
            color: '#007cff', 
            fontSize: '0.9rem', 
            marginTop: 5px,
            fontStyle: 'italic'
        }}>
            ⏳ Menunggu scan RFID...
        </div>
    )}
    {wsConnected && (
        <div style={{
            color: '#28a745          fontSize: '0.8rem', 
            marginTop: 5px   }}>
            ✅ WebSocket terhubung
        </div>
    )}
</div>
```

## Langkah3: Test Integrasi

1. **Pastikan semua service berjalan:**
   - Django server: `python manage.py runserver`
   - Redis server: `redis-server`
   - React server: `npm run dev`
   - RFID scanner: `python scan_rfid.py`

2. **Test di browser:**
   - Buka `http://localhost:5173`
   - Klik tombol "Scan RFID"
   - Scan RFID tag
   - Form akan terisi otomatis

## Troubleshooting Frontend

### Error: "react-use-websocket not found"
```bash
npm install react-use-websocket
```

### Error: "WebSocket connection failed"
- Pastikan Django server berjalan
- Cek URL WebSocket: `ws://12700.10/rfid/`
- Pastikan Redis server berjalan

### Form tidak terisi otomatis
- Cek browser console (F12) untuk error
- Pastikan data RFID ada di database Django
- Cek response dari API `/api/check_rfid/`

### TombolScanRFID" tidak muncul
- Pastikan kode CSS inline sudah benar
- Cek apakah ada error JavaScript di console

## Catatan Penting

- **Tidak mengubah desain UI utama** - hanya menambahkan tombol dan indikator
- **WebSocket terhubung otomatis** saat komponen dimount
- **Mode scan aktif** saat tombol "Scan RFID ditekan
- **Form terisi otomatis** saat RFID di-scan
- **Pesan feedback** untuk user saat proses scan

## File yang Dimodifikasi

- `website-productivity/src/components/DaftarID.jsx` - tambahan WebSocket dan tombol scan
- Tidak ada perubahan pada file CSS atau file lain

## Testing Checklist

-] WebSocket terhubung (indikator hijau muncul)
- [ ] Tombol "Scan RFID" berfungsi
- [ ] Mode scan aktif saat tombol ditekan
- [ ] RFID yang sudah terdaftar mengisi form otomatis
-  RFID baru mengisi field ID saja
- an feedback muncul dengan benar
- [ ] Form submit berfungsi normal 