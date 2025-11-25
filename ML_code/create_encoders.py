import joblib
from sklearn.preprocessing import LabelEncoder
from pathlib import Path

# Create trained_models directory
MODEL_DIR = Path(__file__).parent / "trained_models"
MODEL_DIR.mkdir(exist_ok=True)

# Create Type Encoder (H, M, L machine types)
type_encoder = LabelEncoder()
type_encoder.fit(['H', 'M', 'L'])
joblib.dump(type_encoder, MODEL_DIR / 'type_encoder.pkl')
print(f"✅ Created type_encoder.pkl")
print(f"   Classes: {type_encoder.classes_}")

# Create Failure Type Encoder
# These are the common failure types in the system
failure_types = [
    'No Failure Detected',
    'Bearing Wear',
    'Overheating',
    'Lubrication Degradation',
    'Power Transmission Failure'
]
failure_encoder = LabelEncoder()
failure_encoder.fit(failure_types)
joblib.dump(failure_encoder, MODEL_DIR / 'failure_encoder.pkl')
print(f"✅ Created failure_encoder.pkl")
print(f"   Classes: {failure_encoder.classes_}")

print("\n✅ All encoders created successfully!")
print(f"\nFiles in {MODEL_DIR}:")
for f in MODEL_DIR.glob('*.pkl'):
    print(f"   - {f.name}")
