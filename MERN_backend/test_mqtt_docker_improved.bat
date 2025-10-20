@echo off
echo MQTT Testing Script untuk Docker (Improved)
echo ===========================================
echo.

echo Testing MQTT connection dengan Docker broker...
echo.

echo 1. Testing work_time_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "work_time_rusdi" -m "10"
echo.

echo 2. Testing loss_time_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "loss_time_rusdi" -m "5"
echo.

echo 3. Testing target_production_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "target_production_rusdi" -m "100"
echo.

echo 4. Testing actual_production_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "actual_production_rusdi" -m "85"
echo.

echo 5. Testing check_in_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_in_rusdi" -m "1"
echo.

echo 6. Testing check_out_rusdi...
docker exec mosquitto-broker mosquitto_pub -h localhost -p 1883 -t "check_out_rusdi" -m "1"
echo.

echo Testing completed!
echo Check your dashboard for real-time updates.
echo.

echo Recent MQTT logs:
docker logs mosquitto-broker --tail 5
echo.

pause 