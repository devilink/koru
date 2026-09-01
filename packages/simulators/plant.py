class PlantMoistureSimulator:
    def __init__(self, dry_threshold: float = 20.0, hysteresis_buffer: float = 5.0):
        self.dry_threshold = dry_threshold
        self.hysteresis_buffer = hysteresis_buffer
        self.is_critical = False

    def evaluate_state(self, current_moisture: float) -> bool:
        """
        Evaluate if the plant is critically thirsty with hysteresis.
        Returns True if thirsty, False otherwise.
        """
        # If already critical, require it to go above threshold + buffer to recover
        if self.is_critical:
            if current_moisture > (self.dry_threshold + self.hysteresis_buffer):
                self.is_critical = False
        else:
            # If not critical, require it to drop below threshold to become critical
            if current_moisture < self.dry_threshold:
                self.is_critical = True
                
        return self.is_critical
