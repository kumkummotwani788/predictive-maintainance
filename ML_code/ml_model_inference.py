"""
ML Model Inference Module for Predictive Maintenance
Handles RUL prediction and Failure Type classification
"""

import joblib
import numpy as np
import json
from pathlib import Path

# Model and scaler paths
MODEL_DIR = Path(__file__).parent / "trained_models"
MODEL_DIR.mkdir(exist_ok=True)

MODELS = {
    'rul_model': MODEL_DIR / 'rul_regressor.pkl',
    'failure_model': MODEL_DIR / 'failure_classifier.pkl',
    'scaler': MODEL_DIR / 'feature_scaler.pkl',
    'type_encoder': MODEL_DIR / 'type_encoder.pkl',
    'failure_encoder': MODEL_DIR / 'failure_encoder.pkl',
}

# Feature names expected by the models
FEATURE_NAMES = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Vibration Levels',
    'Operational Hours',
    'Type'
]

def load_models():
    """Load all trained models and scalers"""
    models = {}
    for key, path in MODELS.items():
        if path.exists():
            try:
                models[key] = joblib.load(path)
            except Exception as e:
                print(f"Error loading {key}: {e}")
                return None
    
    if len(models) != len(MODELS):
        print("Warning: Not all models loaded successfully")
        return None
    
    return models

def generate_random_sensor_data(machine_type='H'):
    """
    Generate random sensor data for simulation
    
    Args:
        machine_type (str): Machine type ('H', 'M', or 'L')
    
    Returns:
        dict: Dictionary containing sensor readings
    """
    # Generate realistic sensor values based on machine type
    if machine_type == 'H':  # High-performance machine
        air_temp = np.random.uniform(295, 310)  # K
        process_temp = np.random.uniform(305, 320)  # K
        rotational_speed = np.random.uniform(2500, 3500)  # rpm
        torque = np.random.uniform(40, 65)  # Nm
        vibration = np.random.uniform(0.1, 0.3)  # mm/s
        operational_hours = np.random.uniform(500, 2000)  # hours
    elif machine_type == 'M':  # Medium-performance machine
        air_temp = np.random.uniform(298, 312)  # K
        process_temp = np.random.uniform(308, 323)  # K
        rotational_speed = np.random.uniform(1500, 2500)  # rpm
        torque = np.random.uniform(25, 45)  # Nm
        vibration = np.random.uniform(0.15, 0.35)  # mm/s
        operational_hours = np.random.uniform(300, 1500)  # hours
    else:  # 'L' - Low-performance machine
        air_temp = np.random.uniform(300, 315)  # K
        process_temp = np.random.uniform(310, 325)  # K
        rotational_speed = np.random.uniform(500, 1500)  # rpm
        torque = np.random.uniform(10, 30)  # Nm
        vibration = np.random.uniform(0.2, 0.4)  # mm/s
        operational_hours = np.random.uniform(100, 1000)  # hours
    
    return {
        'Air temperature [K]': round(air_temp, 2),
        'Process temperature [K]': round(process_temp, 2),
        'Rotational speed [rpm]': round(rotational_speed, 2),
        'Torque [Nm]': round(torque, 2),
        'Vibration Levels': round(vibration, 3),
        'Operational Hours': round(operational_hours, 2),
        'Type': machine_type
    }

def predict_rul_and_failure(sensor_data, models):
    """
    Predict RUL and Failure Type based on sensor data
    
    Args:
        sensor_data (dict): Dictionary of sensor readings
        models (dict): Dictionary of loaded models
    
    Returns:
        dict: Prediction results with RUL, failure type, and confidence
    """
    if models is None:
        return {
            'error': 'Models not loaded',
            'rul': None,
            'failure_type': None,
            'confidence': None
        }
    
    try:
        # Prepare features in the correct order
        features = np.array([[
            sensor_data[fname] if fname != 'Type' else _encode_type(sensor_data['Type'], models)
            for fname in FEATURE_NAMES
        ]])
        
        # Scale features
        scaler = models['scaler']
        features_scaled = scaler.transform(features)
        
        # RUL Prediction
        rul_model = models['rul_model']
        predicted_rul = float(rul_model.predict(features_scaled)[0])
        
        # Failure Type Prediction
        failure_model = models['failure_classifier']
        failure_pred = failure_model.predict(features_scaled)[0]
        failure_proba = float(np.max(failure_model.predict_proba(features_scaled)))
        
        # Decode failure type
        failure_encoder = models['failure_encoder']
        failure_type = failure_encoder.inverse_transform([int(failure_pred)])[0]
        
        # Determine alert status based on RUL
        alert_status = 'CRITICAL' if predicted_rul < 50 else 'WARNING' if predicted_rul < 150 else 'HEALTHY'
        
        return {
            'error': None,
            'rul': round(predicted_rul, 2),
            'failure_type': str(failure_type),
            'confidence': round(failure_proba * 100, 2),
            'alert_status': alert_status,
            'sensor_data': sensor_data
        }
    
    except Exception as e:
        return {
            'error': str(e),
            'rul': None,
            'failure_type': None,
            'confidence': None
        }

def _encode_type(type_value, models):
    """Encode machine type using the trained encoder"""
    try:
        type_encoder = models['type_encoder']
        return type_encoder.transform([type_value])[0]
    except:
        # Fallback mapping if encoder fails
        type_mapping = {'L': 2, 'M': 1, 'H': 0}
        return type_mapping.get(type_value, 0)

def run_simulation(machine_type='H'):
    """
    Run complete simulation: generate data and predict
    
    Args:
        machine_type (str): Machine type ('H', 'M', or 'L')
    
    Returns:
        dict: Simulation results including predictions
    """
    models = load_models()
    
    if models is None:
        return {
            'error': 'Failed to load models. Please train and save models first.',
            'success': False
        }
    
    # Generate random sensor data
    sensor_data = generate_random_sensor_data(machine_type)
    
    # Make predictions
    predictions = predict_rul_and_failure(sensor_data, models)
    predictions['success'] = predictions['error'] is None
    
    return predictions

if __name__ == "__main__":
    # Test the inference module
    print("Testing Predictive Maintenance ML Inference...")
    print("\n" + "="*50)
    
    for machine_type in ['H', 'M', 'L']:
        print(f"\nSimulation for Machine Type: {machine_type}")
        result = run_simulation(machine_type)
        print(json.dumps(result, indent=2))
