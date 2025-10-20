# MQTT Setup untuk Dashboard Karyawan

## 🐳 Setup dengan Docker (Recommended)

### 1. Install Docker
Pastikan Docker sudah terinstall di sistem Anda.

### 2. Jalankan Mosquitto Broker dengan Docker
```bash
# Hentikan container yang ada (jika ada)
docker stop mosquitto-broker
docker rm mosquitto-broker

# Jalankan container baru dengan konfigurasi yang benar
docker run -d -p 1883:1883 -p 9001:9001 --name mosquitto-broker -v ${PWD}/mosquitto-docker.conf:/mosquitto/config/mosquitto.conf eclipse-mosquitto
```

### 3. Periksa Status Container
```bash
# Cek container berjalan
docker ps

# Cek logs container
docker logs mosquitto-broker
```

### 4. Test MQTT Connection
```bash
# Test dengan script batch
.\test_mqtt_docker_improved.bat

# Atau test manual
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "work_time_rusdi" -m "10"
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "loss_time_rusdi" -m "5"
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "target_production_rusdi" -m "100"
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "actual_production_rusdi" -m "85"
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_in_rusdi" -m "1"
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_out_rusdi" -m "1"
```

## 📋 Daftar Topic MQTT

### Topic untuk Karyawan "Rusdi":
- `work_time_rusdi` - Menambah detik ke work time
- `loss_time_rusdi` - Menambah detik ke loss time  
- `target_production_rusdi` - Set target production
- `actual_production_rusdi` - Set actual production
- `check_in_rusdi` - Set waktu mulai kerja (timestamp saat ini)
- `check_out_rusdi` - Set waktu selesai kerja (timestamp saat ini)

### Topic untuk Karyawan "Ahmad Ridwan":
- `work_time_ahmad_ridwan`
- `loss_time_ahmad_ridwan`
- `target_production_ahmad_ridwan`
- `actual_production_ahmad_ridwan`
- `check_in_ahmad_ridwan`
- `check_out_ahmad_ridwan`

### Topic untuk Karyawan "Lilis Suryani":
- `work_time_lilis_suryani`
- `loss_time_lilis_suryani`
- `target_production_lilis_suryani`
- `actual_production_lilis_suryani`
- `check_in_lilis_suryani`
- `check_out_lilis_suryani`

### Topic untuk Karyawan "Wahyu Setiawan":
- `work_time_wahyu_setiawan`
- `loss_time_wahyu_setiawan`
- `target_production_wahyu_setiawan`
- `actual_production_wahyu_setiawan`
- `check_in_wahyu_setiawan`
- `check_out_wahyu_setiawan`

### Topic untuk Karyawan "Siti Nurhaliza":
- `work_time_siti_nurhaliza`
- `loss_time_siti_nurhaliza`
- `target_production_siti_nurhaliza`
- `actual_production_siti_nurhaliza`
- `check_in_siti_nurhaliza`
- `check_out_siti_nurhaliza`

## 🔧 Troubleshooting

### MQTT Disconnected
1. **Periksa Docker Container:**
   ```bash
   docker ps
   docker logs mosquitto-broker
   ```

2. **Restart Container:**
   ```bash
   docker restart mosquitto-broker
   ```

3. **Periksa Ports:**
   ```bash
   netstat -an | findstr ":1883\|:9001"
   ```

4. **Periksa Firewall:**
   - Pastikan port 1883 dan 9001 tidak diblokir
   - Allow Docker di Windows Firewall

### Connection Issues
1. **WebSocket Listener:**
   - Pastikan log menampilkan "Opening websockets listen socket on port 9001"
   - Jika tidak, restart container dengan konfigurasi yang benar

2. **Client Connection:**
   - Periksa browser console untuk error MQTT
   - Pastikan URL broker: `ws://localhost:9001`

3. **Topic Subscription:**
   - Periksa log untuk "Received SUBSCRIBE"
   - Pastikan topic format benar (lowercase, underscore)

## 📊 Testing Commands

### Manual Testing dengan Docker:
```bash
# Test work time
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "work_time_rusdi" -m "10"

# Test loss time  
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "loss_time_rusdi" -m "5"

# Test target production
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "target_production_rusdi" -m "100"

# Test actual production
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "actual_production_rusdi" -m "85"

# Test check in (set waktu mulai)
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_in_rusdi" -m "1"

# Test check out (set waktu selesai)
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_out_rusdi" -m "1"
```

### Continuous Testing:
```bash
# Test berulang setiap 5 detik
while ($true) {
    docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "work_time_rusdi" -m "1"
    Start-Sleep 5
}
```

## 🎯 Expected Behavior

1. **Dashboard Status:** MQTT indicator harus menampilkan "Connected" (🔗)
2. **Real-time Updates:** Data work time, loss time, dan production akan update otomatis
3. **Console Logs:** Browser console akan menampilkan log MQTT messages
4. **Docker Logs:** Container logs akan menampilkan publish/subscribe activities

## 🔄 Restart Instructions

Jika perlu restart seluruh sistem:

1. **Stop Container:**
   ```bash
   docker stop mosquitto-broker
   ```

2. **Start Container:**
   ```bash
   docker start mosquitto-broker
   ```

3. **Refresh Browser:**
   - Refresh halaman dashboard
   - Periksa MQTT status indicator

4. **Test Connection:**
   ```bash
   .\test_mqtt_docker_improved.bat
   ``` 