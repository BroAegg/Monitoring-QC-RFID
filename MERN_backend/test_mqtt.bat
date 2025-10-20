@echo off
echo MQTT Testing Script
echo ===================
echo.

cd /d "%~dp0"

echo Testing MQTT connection...
echo.

echo 1. Testing work_time_rusdi...
mosquitto_pub -h 127.0.0.1 -p 1883 -t "work_time_rusdi" -m "10"
echo.

echo 2. Testing loss_time_rusdi...
mosquitto_pub -h 127.0.0.1 -p 1883 -t "loss_time_rusdi" -m "5"
echo.

echo 3. Testing target_production_rusdi...
mosquitto_pub -h 127.0.0.1 -p 1883 -t "target_production_rusdi" -m "100"
echo.

echo 4. Testing actual_production_rusdi...
mosquitto_pub -h 127.0.0.1 -p 1883 -t "actual_production_rusdi" -m "85"
echo.

echo Testing completed!
echo Check your dashboard for real-time updates.
echo.

pause 