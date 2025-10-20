@echo off
echo Starting Mosquitto MQTT Broker...
echo.
echo Configuration:
echo - TCP Port: 1883
echo - WebSocket Port: 9001
echo - Config File: mosquitto.conf
echo.
echo Press Ctrl+C to stop the broker
echo.

cd /d "%~dp0"
mosquitto -c mosquitto.conf -v

pause 