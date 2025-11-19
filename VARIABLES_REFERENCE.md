# Variable Names & Data Structure Reference

## Overview
This document defines all variable names, data structures, and API contracts used throughout the predictive maintenance system.

---

## Machine Sensor Variables

All sensor measurements use standardized variable names consistent across the system.

### Sensor Reading Names
```javascript
{
  'Air temperature [K]':           // Ambient/inlet temperature in Kelvin
  'Process temperature [K]':       // Operating/process temperature in Kelvin
  'Rotational speed [rpm]':        // Motor/spindle rotation speed in revolutions per minute
  'Torque [Nm]':                   // Mechanical torque in Newton-meters
  'Vibration Levels':              // Vibration amplitude in mm/s (millimeters per second)
  'Operational Hours':             // Total cumulative operating hours
  'Type':                          // Machine type: 'H' (High), 'M' (Medium), 'L' (Low)
}
```

### Machine Type Codes
- **'H'** = High-Performance Machine
- **'M'** = Medium-Performance Machine
- **'L'** = Low-Performance Machine

---

## Prediction Output Variables

### RUL (Remaining Useful Life)
```javascript
{
  rul: number,                     // Hours until predicted failure (e.g., 245.67)
  // Thresholds:
  // > 150 hours   = HEALTHY
  // 50-150 hours  = WARNING
  // < 50 hours    = CRITICAL
}
```

### Failure Type Classification
```javascript
{
  failure_type: string,            // One of the failure types below:
  confidence: number,              // Prediction confidence 0-100 (e.g., 85.42)
  
  // Possible failure_type values:
  // - "No Failure Detected"       (normal operation)
  // - "Bearing Wear"              (vibration degradation)
  // - "Overheating"               (temperature too high)
  // - "Lubrication Degradation"   (high speed + high torque)
  // - "Power Transmission Failure" (excessive torque)
}
```

### Alert Status
```javascript
{
  alert_status: string,            // One of:
  // - "HEALTHY"   (green, > 150 hours RUL)
  // - "WARNING"   (yellow, 50-150 hours RUL)
  // - "CRITICAL"  (red, < 50 hours RUL)
}
```

---

## API Request/Response Contracts

### POST /api/prediction/predict
**Request:**
```javascript
{
  'Air temperature [K]': number,        // 295-325
  'Process temperature [K]': number,    // 305-330
  'Rotational speed [rpm]': number,     // 500-3500
  'Torque [Nm]': number,                // 10-65
  'Vibration Levels': number,           // 0.1-0.4
  'Operational Hours': number,          // 100-2000
  'Type': string                        // 'H', 'M', or 'L'
}
```

**Response:**
```javascript
{
  success: boolean,
  rul: number,
  failure_type: string,
  confidence: number,
  alert_status: string,
  sensor_data: {...},               // Echo of input sensor data
  timestamp: string,                // ISO 8601 datetime
  error: string | null
}
```

### POST /api/prediction/simulate
**Request:**
```javascript
{
  machineType: string               // 'H', 'M', or 'L'
}
```

**Response:**
```javascript
{
  success: boolean,
  machine_type: string,
  rul: number,
  failure_type: string,
  confidence: number,
  alert_status: string,
  sensor_data: {
    'Air temperature [K]': number,
    'Process temperature [K]': number,
    'Rotational speed [rpm]': number,
    'Torque [Nm]': number,
    'Vibration Levels': number,
    'Operational Hours': number,
    'Type': string
  },
  timestamp: string,
  error: string | null
}
```

### POST /api/auth/login
**Request:**
```javascript
{
  role: string,                     // 'admin', 'opH', 'opM', or 'opL'
  password: string                  // Role-specific password
}
```

**Response:**
```javascript
{
  token: string,                    // JWT token for authenticated requests
  role: string,                     // User's role
  access: string,                   // Access level: 'full', 'high', 'medium', 'low'
  message: string | null,           // Error message if login fails
}
```

---

## Frontend State Variables

### MachineTable Component
```javascript
{
  machines: Array,                  // Array of machine objects
  loading: boolean,                 // Loading indicator
  error: string | null,             // Error message if any
  simulatorOpen: boolean,           // Simulator dialog open/closed
}
```

### MachineSimulator Component
```javascript
{
  open: boolean,                    // Dialog visibility
  loading: boolean,                 // Prediction loading state
  machineType: string,              // Selected machine type ('H', 'M', 'L')
  simulationResult: Object | null,  // Latest prediction results
  error: string | null,             // Error message
}
```

### Machine Object (from database)
```javascript
{
  _id: string,                      // MongoDB ObjectId
  'Product ID': string,             // Machine identifier
  'Type': string,                   // 'H', 'M', or 'L'
  'Air temperature [K]': number,
  'Process temperature [K]': number,
  'Rotational speed [rpm]': number,
  'Torque [Nm]': number,
  // ... other sensor fields
}
```

---

## Backend Database Schema

### Machine Collection
```javascript
{
  _id: ObjectId,
  Product ID: String,
  Type: String,                     // 'H', 'M', 'L'
  "Air temperature [K]": Number,
  "Process temperature [K]": Number,
  "Rotational speed [rpm]": Number,
  "Torque [Nm]": Number,
  "Vibration Levels": Number,
  "Operational Hours": Number,
  createdAt: Date,
  updatedAt: Date
}
```

### User Collection (for authentication)
```javascript
{
  _id: ObjectId,
  role: String,                     // 'admin', 'opH', 'opM', 'opL'
  username: String,
  hashedPassword: String,
  access: String,                   // 'full', 'high', 'medium', 'low'
  createdAt: Date
}
```

---

## Python ML Module Variables

### ml_model_inference.py
```python
FEATURE_NAMES = [
    'Air temperature [K]',
    'Process temperature [K]',
    'Rotational speed [rpm]',
    'Torque [Nm]',
    'Vibration Levels',
    'Operational Hours',
    'Type'
]

MODELS = {
    'rul_model': RandomForestRegressor(),      # RUL prediction
    'failure_model': Sequential(),             # Keras neural network
    'scaler': StandardScaler(),                # Feature normalization
    'type_encoder': LabelEncoder(),            # Encode machine Type
    'failure_encoder': LabelEncoder()          # Encode failure types
}

# Sensor data ranges by machine type
TYPE_RANGES = {
    'H': {
        'air_temp': (295, 310),
        'process_temp': (305, 320),
        'rotational_speed': (2500, 3500),
        'torque': (40, 65),
        'vibration': (0.1, 0.3),
        'operational_hours': (500, 2000)
    },
    'M': {
        # ... medium-performance ranges
    },
    'L': {
        # ... low-performance ranges
    }
}
```

---

## Environment Variables

### Backend (.env)
```bash
PORT=5000
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-secret-key
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000
```

---

## Common Data Validation Rules

### Temperature
- **Valid Range**: 295 K to 325 K
- **Type**: Float
- **Unit**: Kelvin
- **Alert Threshold**: > 320 K

### Rotational Speed
- **Valid Range**: 500 to 3500 rpm
- **Type**: Float
- **Unit**: Revolutions per minute
- **Alert Threshold**: > 3000 rpm

### Torque
- **Valid Range**: 10 to 65 Nm
- **Type**: Float
- **Unit**: Newton-meters
- **Alert Threshold**: > 55 Nm

### Vibration
- **Valid Range**: 0.1 to 0.4 mm/s
- **Type**: Float
- **Unit**: Millimeters per second
- **Alert Threshold**: > 0.35 mm/s

### RUL
- **Valid Range**: 10 to 1000+ hours
- **Type**: Float
- **Unit**: Hours
- **Interpretation**:
  - \> 150: HEALTHY
  - 50-150: WARNING
  - < 50: CRITICAL

---

## Authentication Variables

### Role-Based Access
```javascript
ROLE_CREDENTIALS = {
  'admin': {
    password: 'admin123',
    access: 'full'                   // Sees all machines
  },
  'opH': {
    password: 'opH123',
    access: 'high'                   // Sees only Type H
  },
  'opM': {
    password: 'opM123',
    access: 'medium'                 // Sees only Type M
  },
  'opL': {
    password: 'opL123',
    access: 'low'                    // Sees only Type L
  }
}
```

### JWT Token Payload
```javascript
{
  role: string,                     // User's role
  access: string,                   // Access level
  iat: number,                      // Issued at (unix timestamp)
  exp: number                       // Expires at (unix timestamp, +8 hours)
}
```

---

## Error Response Format

```javascript
{
  success: false,
  error: string,                    // Error message
  message: string | null,           // Optional additional context
  code: string | null               // Optional error code
}
```

---

## Quick Reference Tables

### Machine Type Characteristics

| Type | Performance | Temp Range | Speed Range | Use Case |
|------|-------------|-----------|-------------|----------|
| H | High | 295-310 K | 2500-3500 rpm | Heavy industrial |
| M | Medium | 298-312 K | 1500-2500 rpm | Standard operations |
| L | Low | 300-315 K | 500-1500 rpm | Light duty |

### Alert Status Colors & Meanings

| Status | Color | RUL | Action |
|--------|-------|-----|--------|
| HEALTHY | 🟢 Green | > 150h | Monitor normally |
| WARNING | 🟡 Yellow | 50-150h | Schedule maintenance |
| CRITICAL | 🔴 Red | < 50h | Urgent maintenance |

### Failure Type Detection Triggers

| Failure Type | Primary Trigger | Secondary | Confidence |
|---|---|---|---|
| Bearing Wear | Vibration > 0.35 | - | 85-95% |
| Overheating | Temp > 320 K | - | 75-90% |
| Lubrication Degradation | Speed > 3500 rpm + Torque > 50 Nm | - | 70-90% |
| Power Transmission | Torque > 55 Nm | - | 65-90% |
| No Failure | Normal conditions | - | 0-20% |

---

## File Location Reference

```
Variables/Data defined in:

Frontend:
  /frontend/src/components/MachineSimulator.js   - UI state variables
  /frontend/src/components/MachineTable.js       - Dashboard state
  /frontend/src/api.js                          - API calls

Backend:
  /backend/prediction.routes.js                 - Prediction logic
  /backend/auth.routes.js                       - Auth variables
  /backend/server.js                            - Server config

ML:
  /ML_code/ml_model_inference.py                - ML variables
  /ML_code/rul_and_failure_type_prediction.ipynb - Training notebook
```

---

**Version**: 1.0  
**Last Updated**: November 2024  
**Status**: Complete and Ready for Production
