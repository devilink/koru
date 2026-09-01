from typing import Optional
from datetime import datetime

class AlertEvent:
    def __init__(self, event_id: str, zone: str, confidence: float):
        self.event_id = event_id
        self.zone = zone
        self.confidence = confidence
        self.time = datetime.utcnow()
        self.resolution_state = "unresolved"

class SafetyPolicy:
    def __init__(self, safety_mode_enabled: bool = True, cooldown_seconds: int = 300, tracking_duration: int = 10):
        self.safety_mode_enabled = safety_mode_enabled
        self.cooldown_seconds = cooldown_seconds
        self.tracking_duration = tracking_duration
        self.last_alert_time: Optional[datetime] = None

    def evaluate_unknown_person(self, confidence: float, duration_tracked: float, has_confident_match: bool, zone: str) -> Optional[AlertEvent]:
        """
        Evaluate if an unknown person event should trigger an alert based on deterministic rules.
        """
        if not self.safety_mode_enabled:
            return None

        if has_confident_match:
            return None

        if duration_tracked < self.tracking_duration:
            return None

        if self.last_alert_time:
            time_since_last = (datetime.utcnow() - self.last_alert_time).total_seconds()
            if time_since_last < self.cooldown_seconds:
                return None

        # All conditions met, trigger alert
        self.last_alert_time = datetime.utcnow()
        return AlertEvent(
            event_id=f"evt_{int(datetime.utcnow().timestamp())}",
            zone=zone,
            confidence=confidence
        )
