import time
import random
from datetime import datetime
from packages.hardware_contracts.models import SensorReading, RobotTelemetry, HardwareGateway, RobotCommand

class SimulatedHardware(HardwareGateway):
    def __init__(self):
        self.battery = 100.0
        self.moisture = 50.0  # Percentage
        self.status = "idle"
        
    def read_moisture(self) -> SensorReading:
        # Simulate slight drying over time
        self.moisture = max(0.0, self.moisture - random.uniform(0.1, 0.5))
        return SensorReading(sensor_type="moisture", value=self.moisture, unit="%")

    def read_ultrasonic(self) -> SensorReading:
        # Simulate obstacle distance in cm
        return SensorReading(sensor_type="ultrasonic", value=random.uniform(10.0, 200.0), unit="cm")

    def read_touch(self) -> SensorReading:
        # Simulate boolean touch state
        is_touched = random.choice([0.0, 1.0])
        return SensorReading(sensor_type="touch", value=is_touched, unit="bool")

    def get_telemetry(self) -> RobotTelemetry:
        self.battery = max(0.0, self.battery - 0.01)
        return RobotTelemetry(
            battery_level=self.battery,
            is_charging=False,
            status=self.status
        )

    def send_command(self, command: RobotCommand) -> bool:
        if command.intent == "stop":
            self.status = "idle"
            return True
        # For prototype, simulated physical commands are safely rejected if not mocked
        if command.intent == "seek_user":
            print(f"[SIMULATOR] Ignoring physical command: {command.intent}")
            return False
            
        print(f"[SIMULATOR] Executing simulated command: {command.intent}")
        return True
