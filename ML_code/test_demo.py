"""
Demo and Testing Script for Predictive Maintenance ML Module

This script demonstrates:
1. Loading trained models (when available)
2. Generating random sensor data
3. Running predictions
4. Testing different machine types
"""

import json
from ml_model_inference import (
    run_simulation,
    generate_random_sensor_data,
    load_models,
    predict_rul_and_failure
)

def print_separator(title=""):
    """Print a formatted separator"""
    print("\n" + "="*70)
    if title:
        print(f"  {title}")
        print("="*70)

def demo_simulation():
    """Run simulations for each machine type"""
    print_separator("MACHINE SIMULATOR DEMO")
    
    machine_types = ['H', 'M', 'L']
    type_names = {
        'H': 'High-Performance',
        'M': 'Medium-Performance',
        'L': 'Low-Performance'
    }
    
    for machine_type in machine_types:
        print_separator(f"Simulating {type_names[machine_type]} Machine (Type {machine_type})")
        
        # Run simulation
        result = run_simulation(machine_type)
        
        if result.get('success'):
            print(f"\n✅ Simulation Status: SUCCESS")
            print(f"\n📊 Predictions:")
            print(f"   • RUL (Remaining Useful Life): {result['rul']} hours")
            print(f"   • Predicted Failure Type: {result['failure_type']}")
            print(f"   • Confidence: {result['confidence']}%")
            print(f"   • Alert Status: {result['alert_status']}")
            
            print(f"\n📈 Sensor Data Generated:")
            sensor_data = result['sensor_data']
            for key, value in sensor_data.items():
                if key != 'Type':
                    print(f"   • {key}: {value}")
            
            # Alert interpretation
            print(f"\n🚨 Alert Interpretation:")
            if result['alert_status'] == 'CRITICAL':
                print(f"   ⚠️  CRITICAL: Machine requires IMMEDIATE maintenance!")
            elif result['alert_status'] == 'WARNING':
                print(f"   ⚠️  WARNING: Machine requires maintenance within 50-150 hours")
            else:
                print(f"   ✅ HEALTHY: Machine operating normally")
        else:
            print(f"❌ Simulation failed: {result.get('error')}")

def demo_sensor_data_generation():
    """Show sensor data generation for each machine type"""
    print_separator("SENSOR DATA GENERATION DEMO")
    
    machine_types = {'H': 'High', 'M': 'Medium', 'L': 'Low'}
    
    for machine_type, description in machine_types.items():
        print_separator(f"{description}-Performance Machine Data")
        
        # Generate 3 samples per type
        for i in range(1, 4):
            print(f"\nSample {i}:")
            data = generate_random_sensor_data(machine_type)
            for key, value in data.items():
                if key != 'Type':
                    print(f"  {key:.<35} {value}")

def demo_json_output():
    """Show API-style JSON response format"""
    print_separator("JSON API RESPONSE FORMAT")
    
    result = run_simulation('M')
    
    if result.get('success'):
        # Format for API response
        api_response = {
            'success': result['success'],
            'machine_type': 'M',
            'timestamp': 'TIMESTAMP_HERE',
            'predictions': {
                'rul': result['rul'],
                'failure_type': result['failure_type'],
                'confidence': result['confidence'],
                'alert_status': result['alert_status']
            },
            'sensor_data': result['sensor_data']
        }
        
        print("\nJSON Response (as would be sent by API):")
        print(json.dumps(api_response, indent=2))

def demo_model_loading():
    """Test model loading"""
    print_separator("MODEL LOADING TEST")
    
    print("\nAttempting to load trained models...")
    models = load_models()
    
    if models:
        print("✅ Models loaded successfully!")
        print(f"   Loaded models: {', '.join(models.keys())}")
    else:
        print("⚠️  Models not found or failed to load")
        print("   Using mock predictions instead")
        print("   To use real predictions:")
        print("   1. Train models using the Jupyter notebook")
        print("   2. Save models to ML_code/trained_models/ directory")

def main():
    """Run all demonstrations"""
    print("\n")
    print("╔" + "="*68 + "╗")
    print("║" + " "*15 + "PREDICTIVE MAINTENANCE - ML MODULE DEMO" + " "*14 + "║")
    print("╚" + "="*68 + "╝")
    
    print("\nThis script demonstrates the ML inference capabilities:")
    print("  • Sensor data generation based on machine type")
    print("  • RUL (Remaining Useful Life) prediction")
    print("  • Failure type classification")
    print("  • Alert status determination")
    
    # Run demonstrations
    demo_model_loading()
    demo_sensor_data_generation()
    demo_simulation()
    demo_json_output()
    
    print_separator("DEMO COMPLETE")
    print("\n✅ All demonstrations completed successfully!")
    print("\nNext Steps:")
    print("  1. Review the predictions and sensor data generated")
    print("  2. Train models with real data using the Jupyter notebook")
    print("  3. Save trained models to use actual ML predictions")
    print("  4. Run the Flask API to serve predictions")
    print("\n")

if __name__ == "__main__":
    main()
