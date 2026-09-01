import numpy as np
import collections
from typing import Optional, List, Dict
import cv2

try:
    from hsemotion.facial_emotions import HSEmotionRecognizer
    HSEMOTION_AVAILABLE = True
except ImportError:
    HSEMOTION_AVAILABLE = False

class ExpressionSmoother:
    def __init__(self, window_size: int = 5):
        self.window_size = window_size
        self.history = collections.deque(maxlen=window_size)
        
    def add_prediction(self, emotion: str):
        self.history.append(emotion)
        
    def get_smoothed_emotion(self) -> Optional[str]:
        if not self.history:
            return None
        # Return the most common emotion in the window
        counts = collections.Counter(self.history)
        return counts.most_common(1)[0][0]

class ExpressionExtractor:
    def __init__(self, model_name: str = 'enet_b0_8_best_vgaf', device: str = 'cpu'):
        if not HSEMOTION_AVAILABLE:
            print("WARNING: hsemotion not available. Falling back to mock extraction.")
            self.recognizer = None
        else:
            self.recognizer = HSEmotionRecognizer(model_name=model_name, device=device)
        self.smoother = ExpressionSmoother(window_size=5)
        
    def extract_emotion(self, face_img: np.ndarray) -> Optional[str]:
        """
        Extract emotion from a cropped face image.
        Returns the raw emotion string, or None if failed.
        """
        if self.recognizer is None:
            # Mock implementation
            return "Neutral"
            
        try:
            # Convert BGR to RGB
            rgb_face = cv2.cvtColor(face_img, cv2.COLOR_BGR2RGB)
            emotion, scores = self.recognizer.predict_emotions(rgb_face, logits=False)
            return emotion
        except Exception as e:
            print(f"Emotion extraction failed: {e}")
            return None
            
    def get_stable_emotion(self, face_img: np.ndarray) -> Optional[str]:
        """
        Extracts emotion and applies temporal smoothing.
        Treats cues as uncertain signals, smoothing before reacting.
        """
        raw_emotion = self.extract_emotion(face_img)
        if raw_emotion:
            self.smoother.add_prediction(raw_emotion)
        return self.smoother.get_smoothed_emotion()
