from typing import Optional

class CompanionReactionMapper:
    """
    Maps hardware telemetry, safety states, and facial expressions to a CompanionState.
    """
    
    # HSEmotion typical labels: 'Anger', 'Contempt', 'Disgust', 'Fear', 'Happiness', 'Neutral', 'Sadness', 'Surprise'
    EMOTION_TO_STATE = {
        'Happiness': 'happy',
        'Sadness': 'gentle-concern',
        'Fear': 'gentle-concern',
        'Anger': 'gentle-concern',
        'Surprise': 'curious',
        'Neutral': 'idle'
    }

    def __init__(self):
        self.current_state = "idle"

    def determine_state(self, 
                        is_safety_alert: bool, 
                        plant_moisture: float, 
                        stable_user_emotion: Optional[str], 
                        is_agent_thinking: bool,
                        is_agent_listening: bool) -> str:
        """
        Determine the appropriate companion state based on priority.
        Priority:
        1. Safety Alert -> gentle-concern
        2. Plant Critical (<20%) -> plant-thirsty
        3. Agent Action (listening/thinking)
        4. User Emotion -> happy / gentle-concern / curious
        5. Default -> idle
        """
        if is_safety_alert:
            self.current_state = "gentle-concern"
            return self.current_state
            
        if plant_moisture < 20.0:
            self.current_state = "plant-thirsty"
            return self.current_state
            
        if is_agent_listening:
            self.current_state = "listening"
            return self.current_state
            
        if is_agent_thinking:
            self.current_state = "thinking"
            return self.current_state
            
        if stable_user_emotion:
            mapped = self.EMOTION_TO_STATE.get(stable_user_emotion, "idle")
            self.current_state = mapped
            return self.current_state
            
        self.current_state = "idle"
        return self.current_state
