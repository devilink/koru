import pytest
from packages.hardware_contracts.models import RobotCommand
from packages.agent.validator import CommandValidator

def test_command_validator():
    # Should allow stop
    assert CommandValidator.validate(RobotCommand(intent="stop")) == True
    
    # Should reject seek_user (physical motion)
    assert CommandValidator.validate(RobotCommand(intent="seek_user")) == False
    
    # Should validate parameters
    assert CommandValidator.validate(RobotCommand(intent="led_color", parameters={"color": "blue"})) == True
    assert CommandValidator.validate(RobotCommand(intent="led_color", parameters={"color": "infrared"})) == False
