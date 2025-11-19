# Predictive Maintenance System

A full-stack application for predictive maintenance of industrial machines using Machine Learning to predict Remaining Useful Life (RUL) and failure types based on sensor data.

## Project Overview

This system consists of:
- **Backend**: Node.js/Express API server with role-based authentication
- **Frontend**: React dashboard with machine monitoring and simulation capabilities
- **ML Module**: Python-based machine learning models for RUL prediction and failure type classification

### Features

✅ **Role-Based Access Control**
- Admin: Full access to all machines
- Operator H: High-performance machines only
- Operator M: Medium-performance machines only
- Operator L: Low-performance machines only

✅ **Machine Simulator**
- Generates realistic random sensor data based on machine type
- Predicts RUL (Remaining Useful Life) in hours
- Identifies potential failure types with confidence scores
- Provides alert status (HEALTHY, WARNING, CRITICAL)

✅ **Real-Time Monitoring**
- View all machines in a table with current sensor readings
- Color-coded machine types for quick identification
- Role-based machine filtering

## Architecture

```
predictive-maintenance/
├── backend/                    # Node.js/Express server
│   ├── auth.routes.js         # Authentication endpoints
│   ├── prediction.routes.js    # ML prediction endpoints
│   ├── server.js              # Main server file
│   └── package.json           # Backend dependencies
│
├── frontend/                   # React application
│   ├── src/
│   │   ├── api.js             # API client functions
│   │   ├── App.js             # Main app component
│   │   ├── index.js           # React entry point
│   │   └── components/
│   │       ├── Login.js       # Login form component
│   │       ├── MachineTable.js    # Machine monitoring dashboard
│   │       └── MachineSimulator.js # Simulation component
│   └── package.json           # Frontend dependencies
│
└── ML_code/                    # Machine Learning models
    ├── rul_and_failure_type_prediction.ipynb  # Training notebook
    └── ml_model_inference.py   # Inference module
```

## Installation & Setup

### Prerequisites
- Node.js (v14+) and npm
- Python (v3.8+) and pip
- MongoDB (optional, for data persistence)

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in the backend directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017
JWT_SECRET=your-secret-key-here
```

Start the backend server:
```bash
npm start
# or
node server.js
```

The backend will run on `http://localhost:5000`

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

The frontend will open on `http://localhost:3000`

### ML Module Setup

```bash
cd ML_code
pip install -r requirements.txt  # If requirements.txt exists
# or install packages manually:
pip install pandas numpy scikit-learn tensorflow joblib imbalanced-learn
```

## Machine Types & Sensor Ranges

The system supports three machine types with different operational parameters:

### Type H (High-Performance)
- Air Temperature: 295-310 K
- Process Temperature: 305-320 K
- Rotational Speed: 2500-3500 rpm
- Torque: 40-65 Nm
- Vibration: 0.1-0.3 mm/s
- Operational Hours: 500-2000 hours

### Type M (Medium-Performance)
- Air Temperature: 298-312 K
- Process Temperature: 308-323 K
- Rotational Speed: 1500-2500 rpm
- Torque: 25-45 Nm
- Vibration: 0.15-0.35 mm/s
- Operational Hours: 300-1500 hours

### Type L (Low-Performance)
- Air Temperature: 300-315 K
- Process Temperature: 310-325 K
- Rotational Speed: 500-1500 rpm
- Torque: 10-30 Nm
- Vibration: 0.2-0.4 mm/s
- Operational Hours: 100-1000 hours

## How to Use the Simulator

1. **Log in** with your role credentials:
   - Admin: `admin` / `admin123`
   - Operator H: `opH` / `opH123`
   - Operator M: `opM` / `opM123`
   - Operator L: `opL` / `opL123`

2. **Access the Dashboard**: After login, you'll see the Machine Table

3. **Open the Simulator**: Click the "Machine Simulator" button (blue button with play icon)

4. **Select Machine Type**: Choose from H (High), M (Medium), or L (Low) performance machines

5. **Run Simulation**: Click "Run Simulation" button

6. **View Results**:
   - **RUL**: Remaining Useful Life in hours
   - **Failure Type**: Predicted failure type or "No Failure Detected"
   - **Confidence**: Prediction confidence percentage
   - **Status**: Alert level (HEALTHY, WARNING, or CRITICAL)
   - **Sensor Data**: All generated sensor readings

## API Endpoints

### Authentication
```
POST /api/auth/login
{
  "role": "admin|opH|opM|opL",
  "password": "string"
}
```

### Machines
```
GET /api/machines          # Get all machines (filtered by role)
GET /api/machines/:id      # Get machine by ID
POST /api/machines         # Add new machine
PUT /api/machines/:id      # Update machine
DELETE /api/machines/:id   # Delete machine
```

### Prediction & Simulation
```
POST /api/prediction/predict
{
  "Air temperature [K]": number,
  "Process temperature [K]": number,
  "Rotational speed [rpm]": number,
  "Torque [Nm]": number,
  "Vibration Levels": number,
  "Operational Hours": number,
  "Type": "H|M|L"
}

POST /api/prediction/simulate
{
  "machineType": "H|M|L"
}
```

## Alert Status Interpretation

- **HEALTHY** (Green): RUL > 150 hours - Machine is operating normally
- **WARNING** (Yellow): RUL between 50-150 hours - Maintenance recommended soon
- **CRITICAL** (Red): RUL < 50 hours - Immediate maintenance required

## Failure Types

The system can predict the following failure types:
- **Bearing Wear**: Detected when vibration levels exceed 0.35 mm/s
- **Overheating**: Process temperature exceeds 320 K
- **Lubrication Degradation**: High rotational speed (>3500 rpm) with high torque (>50 Nm)
- **Power Transmission Failure**: Torque exceeds 55 Nm
- **No Failure Detected**: Normal operating conditions

## ML Model Integration

The system uses:
- **RUL Regression**: Random Forest Regressor for predicting remaining useful life
- **Failure Type Classification**: Neural Network (Keras/TensorFlow) for multi-class classification
- **Data Preprocessing**: StandardScaler for feature normalization
- **Handling Imbalanced Data**: SMOTE for oversampling minority classes

### Training the Models

To train models with your own data:

1. Prepare your dataset as `machine_failure_dataset.xlsx` with columns:
   - Air temperature [K]
   - Process temperature [K]
   - Rotational speed [rpm]
   - Torque [Nm]
   - Vibration Levels
   - Operational Hours
   - Type (H, M, or L)
   - RUL (target for regression)
   - Failure Type (target for classification)

2. Run the training notebook:
   ```bash
   cd ML_code
   jupyter notebook rul_and_failure_type_prediction.ipynb
   ```

3. Save trained models:
   - RUL Model: `trained_models/rul_regressor.pkl`
   - Failure Model: `trained_models/failure_classifier.pkl`
   - Scaler: `trained_models/feature_scaler.pkl`
   - Encoders: `trained_models/type_encoder.pkl`, `failure_encoder.pkl`

## Troubleshooting

### Backend won't start
- Ensure MongoDB is running (if using)
- Check PORT is not already in use
- Verify `.env` file exists with correct configuration

### Frontend login fails
- Ensure backend is running on `http://localhost:5000`
- Check browser console for error messages
- Try clearing browser cache

### Simulator shows error
- Backend must be running
- Check network tab in browser DevTools for API response
- Ensure all required packages are installed

## Future Enhancements

- [ ] Integration with real sensor data streams
- [ ] Historical data analysis and trends
- [ ] Predictive maintenance scheduling
- [ ] Real-time alerting system
- [ ] Data export to CSV/PDF
- [ ] Multiple prediction model comparison
- [ ] Advanced visualization dashboards
- [ ] IoT sensor integration

## Technologies Used

**Backend:**
- Express.js - Web framework
- MongoDB - Database
- JWT - Authentication
- Node.js - Runtime

**Frontend:**
- React 18 - UI framework
- Material-UI (MUI) - Component library
- Axios - HTTP client
- React Router - Navigation

**ML/Python:**
- scikit-learn - Machine learning
- TensorFlow/Keras - Deep learning
- pandas/numpy - Data processing
- joblib - Model serialization

## License

This project is part of a predictive maintenance system for industrial machines.

## Support

For issues or questions, please contact the development team.

---

**Version**: 1.0.0  
**Last Updated**: November 2024
