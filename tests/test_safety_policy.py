import pytest
from datetime import datetime
import time

from packages.safety.policies import SafetyPolicy

def test_safety_policy_triggers_alert():
    policy = SafetyPolicy(safety_mode_enabled=True, cooldown_seconds=10, tracking_duration=5)
    
    # Should trigger because tracked for 6s (>5s), no confident match, safety is on
    alert = policy.evaluate_unknown_person(
        confidence=0.85, 
        duration_tracked=6.0, 
        has_confident_match=False, 
        zone="living_room"
    )
    
    assert alert is not None
    assert alert.zone == "living_room"
    assert alert.confidence == 0.85

def test_safety_policy_ignores_if_safety_off():
    policy = SafetyPolicy(safety_mode_enabled=False, cooldown_seconds=10, tracking_duration=5)
    alert = policy.evaluate_unknown_person(0.85, 6.0, False, "living_room")
    assert alert is None

def test_safety_policy_ignores_confident_match():
    policy = SafetyPolicy(safety_mode_enabled=True, cooldown_seconds=10, tracking_duration=5)
    # has_confident_match = True
    alert = policy.evaluate_unknown_person(0.85, 6.0, True, "living_room")
    assert alert is None

def test_safety_policy_ignores_short_duration():
    policy = SafetyPolicy(safety_mode_enabled=True, cooldown_seconds=10, tracking_duration=5)
    # duration_tracked = 3.0 (<5s)
    alert = policy.evaluate_unknown_person(0.85, 3.0, False, "living_room")
    assert alert is None

def test_safety_policy_cooldown():
    policy = SafetyPolicy(safety_mode_enabled=True, cooldown_seconds=10, tracking_duration=5)
    
    # First alert should trigger
    alert1 = policy.evaluate_unknown_person(0.85, 6.0, False, "living_room")
    assert alert1 is not None
    
    # Second alert immediately after should be ignored due to cooldown
    alert2 = policy.evaluate_unknown_person(0.85, 6.0, False, "living_room")
    assert alert2 is None
