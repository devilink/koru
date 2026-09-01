import pytest
from packages.notifications.notifier import MockNotifier

def test_mock_notifier():
    notifier = MockNotifier()
    
    success = notifier.send(
        title="Security Alert",
        message="Unknown person detected in living_room",
        priority=8
    )
    
    assert success is True
    assert len(notifier.sent_notifications) == 1
    assert notifier.sent_notifications[0]["title"] == "Security Alert"
