import pytest
from packages.hardware_contracts.models import RobotCommand
from packages.simulators.hardware import SimulatedHardware

def test_simulated_moisture_reading():
    sim = SimulatedHardware()
    reading = sim.read_moisture()
    assert reading.sensor_type == "moisture"
    assert reading.unit == "%"
    assert 0.0 <= reading.value <= 100.0

def test_simulated_telemetry():
    sim = SimulatedHardware()
    telemetry = sim.get_telemetry()
    assert telemetry.battery_level <= 100.0
    assert not telemetry.is_charging
    assert telemetry.status == "idle"

def test_simulator_command_safety():
    sim = SimulatedHardware()
    
    # Intent that simulator allows (e.g. stop)
    stop_cmd = RobotCommand(intent="stop")
    assert sim.send_command(stop_cmd) is True
    
    # Intent that simulator rejects because it involves physical motion
    seek_cmd = RobotCommand(intent="seek_user")
    assert sim.send_command(seek_cmd) is False
