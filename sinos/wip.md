```python
import numpy as np

def linear_to_log_freq(linear_value, min_freq=0, max_freq=20000):
    if linear_value < 0 or linear_value > 1:
        raise ValueError("linear_value must be between 0 and 1.")
        
    freq = min_freq + (max_freq - min_freq) * (10 ** (linear_value * np.log10(max_freq + 1)) - 1)
    return freq

# Example usage
linear_value = 0.5
frequency = linear_to_log_freq(linear_value)
print(f"Linear value: {linear_value} -> Frequency: {frequency} Hz")
```