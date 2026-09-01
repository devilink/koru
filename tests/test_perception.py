import pytest
import numpy as np
from unittest.mock import MagicMock

# Create a mock detector to test perception without needing actual OpenVINO models
class MockPersonDetector:
    def __init__(self):
        self.call_count = 0

    def detect(self, image: np.ndarray, confidence_threshold: float = 0.5):
        self.call_count += 1
        # Fake returning one person at high confidence
        return [(0.95, (100, 100, 300, 400))]

def test_fake_camera_event_trigger():
    # Simulate a fake 720p image frame
    fake_frame = np.zeros((720, 1280, 3), dtype=np.uint8)
    
    detector = MockPersonDetector()
    results = detector.detect(fake_frame, confidence_threshold=0.6)
    
    assert detector.call_count == 1
    assert len(results) == 1
    
    confidence, bbox = results[0]
    assert confidence == 0.95
    assert bbox == (100, 100, 300, 400)
