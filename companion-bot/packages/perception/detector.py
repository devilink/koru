import cv2
import numpy as np
from typing import Optional, List, Tuple
# Import OpenVINO runtime, if installed
try:
    from openvino.runtime import Core
    OPENVINO_AVAILABLE = True
except ImportError:
    OPENVINO_AVAILABLE = False

class PersonDetector:
    def __init__(self, model_xml: str, model_bin: str, device_name: str = "CPU"):
        """
        Initializes the OpenVINO person detection model.
        Must run on CPU to avoid GPU contention with the local LLM.
        """
        if not OPENVINO_AVAILABLE:
            raise ImportError("OpenVINO is not installed. Run: pip install openvino")
            
        self.ie = Core()
        self.model = self.ie.read_model(model=model_xml, weights=model_bin)
        self.compiled_model = self.ie.compile_model(model=self.model, device_name=device_name)
        
        self.input_layer = self.compiled_model.input(0)
        self.output_layer = self.compiled_model.output(0)
        
        # Get expected input dimensions
        self.n, self.c, self.h, self.w = self.input_layer.shape

    def preprocess(self, image: np.ndarray) -> np.ndarray:
        """
        Resize and format the image to match model input requirements.
        Targeting 720p input downscaled to model specs.
        """
        resized = cv2.resize(image, (self.w, self.h))
        # HWC -> CHW
        transposed = resized.transpose(2, 0, 1)
        # Add batch dimension
        batched = np.expand_dims(transposed, axis=0)
        return batched

    def detect(self, image: np.ndarray, confidence_threshold: float = 0.5) -> List[Tuple[float, Tuple[int, int, int, int]]]:
        """
        Returns a list of detected persons: [(confidence, (xmin, ymin, xmax, ymax))]
        """
        input_data = self.preprocess(image)
        results = self.compiled_model([input_data])[self.output_layer]
        
        detections = []
        # Typically SSD output is [1, 1, N, 7]
        # [image_id, label, conf, x_min, y_min, x_max, y_max]
        for obj in results[0][0]:
            conf = float(obj[2])
            if conf > confidence_threshold:
                # Class 1 is usually person in COCO/Pascal models, but depends on the specific IR model
                label = int(obj[1]) 
                
                h, w = image.shape[:2]
                xmin = int(obj[3] * w)
                ymin = int(obj[4] * h)
                xmax = int(obj[5] * w)
                ymax = int(obj[6] * h)
                
                detections.append((conf, (xmin, ymin, xmax, ymax)))
                
        return detections
