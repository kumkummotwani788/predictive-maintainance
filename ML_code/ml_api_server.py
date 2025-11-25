"""
Flask API wrapper for ML predictions
Allows Node.js backend to call Python ML predictions via HTTP
"""

from flask import Flask, request, jsonify
import sys
from pathlib import Path

# Add ML_code directory to path
ml_code_dir = Path(__file__).parent
sys.path.insert(0, str(ml_code_dir))

from ml_model_inference import run_simulation, predict_rul_and_failure, generate_random_sensor_data, load_models

app = Flask(__name__)

# Load models once on startup
MODELS = load_models()

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'ok',
        'models_loaded': MODELS is not None
    })

@app.route('/api/simulate', methods=['POST'])
def simulate():
    """
    Run simulation with random sensor data
    Request: { machineType: 'H'|'M'|'L' }
    """
    try:
        data = request.get_json()
        machine_type = data.get('machineType', 'M')
        
        # Validate machine type
        if machine_type not in ['H', 'M', 'L']:
            return jsonify({
                'success': False,
                'error': 'Invalid machine type. Must be H, M, or L'
            }), 400
        
        # Run simulation
        result = run_simulation(machine_type)
        
        return jsonify({
            **result,
            'machine_type': machine_type,
            'timestamp': str(result.get('sensor_data', {}).get('timestamp', ''))
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Simulation error: {str(e)}'
        }), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    """
    Predict with provided sensor data
    Request: { sensor_data: {...} }
    """
    try:
        data = request.get_json()
        sensor_data = data.get('sensor_data')
        
        if not sensor_data:
            return jsonify({
                'success': False,
                'error': 'No sensor data provided'
            }), 400
        
        # Make prediction
        result = predict_rul_and_failure(sensor_data, MODELS)
        
        return jsonify({
            **result,
            'success': result.get('error') is None
        })
    
    except Exception as e:
        return jsonify({
            'success': False,
            'error': f'Prediction error: {str(e)}'
        }), 500

if __name__ == '__main__':
    print("Starting ML API Server...")
    print(f"Models loaded: {MODELS is not None}")
    print("Running on http://localhost:5001")
    app.run(host='localhost', port=5001, debug=False)
