from typing import Literal, Optional, List
from pydantic import BaseModel, Field
from datetime import datetime

class SensorReading(BaseModel):
    sensor_type: Literal["moisture", "touch", "ultrasonic"]
    value: float
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    unit: str

class RobotTelemetry(BaseModel):
    battery_level: float = Field(ge=0.0, le=100.0)
    is_charging: bool
    status: Literal["idle", "moving", "error"]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class RobotCommand(BaseModel):
    intent: Literal["seek_user", "stop", "led_color", "celebrate"]
    parameters: dict = Field(default_factory=dict)
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class HardwareGateway:
    """Abstract interface for hardware communication (to be implemented via MQTT)"""
    def send_command(self, command: RobotCommand) -> bool:
        raise NotImplementedError

    def get_telemetry(self) -> RobotTelemetry:
        raise NotImplementedError
