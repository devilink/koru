import pytest
import numpy as np
from packages.perception.expressions import ExpressionSmoother, ExpressionExtractor
from packages.companion.reactions import CompanionReactionMapper

def test_expression_smoothing():
    smoother = ExpressionSmoother(window_size=3)
    
    smoother.add_prediction("Neutral")
    assert smoother.get_smoothed_emotion() == "Neutral"
    
    smoother.add_prediction("Happiness")
    assert smoother.get_smoothed_emotion() == "Neutral" # 2 Neutral vs 1 Happiness
    
    smoother.add_prediction("Happiness")
    assert smoother.get_smoothed_emotion() == "Happiness" # 2 Happiness vs 1 Neutral

def test_reaction_mapping_priorities():
    mapper = CompanionReactionMapper()
    
    # Priority 1: Safety Alert
    state = mapper.determine_state(
        is_safety_alert=True, 
        plant_moisture=10.0, 
        stable_user_emotion="Happiness", 
        is_agent_thinking=False, 
        is_agent_listening=False
    )
    assert state == "gentle-concern"
    
    # Priority 2: Plant Thirsty
    state = mapper.determine_state(False, 10.0, "Happiness", False, False)
    assert state == "plant-thirsty"
    
    # Priority 3: Agent Listening
    state = mapper.determine_state(False, 50.0, "Happiness", False, True)
    assert state == "listening"
    
    # Priority 4: User Emotion
    state = mapper.determine_state(False, 50.0, "Sadness", False, False)
    assert state == "gentle-concern"
