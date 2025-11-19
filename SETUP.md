# Quick Start Guide - Predictive Maintenance System

## Step-by-Step Setup

### 1. Clone or Download the Repository

```bash
cd d:\predictive-maintainance-1
```

### 2. Backend Setup (Node.js/Express)

```bash
# Navigate to backend directory
cd backend

# Install dependencies
npm install

# Create .env file from example
copy .env.example .env
```

Edit `.env` file and update values if needed (especially JWT_SECRET).

### 3. Start the Backend Server

```bash
npm start
```

You should see:
```
Connected to MongoDB
Server running on http://localhost:5000
```

**Note**: MongoDB connection is optional. The API will work in a limited capacity without it.

### 4. Frontend Setup (React)

Open a **new terminal** window:

```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Start the React development server
npm start
```

The browser should automatically open to `http://localhost:3000`

### 5. Access the Application

1. **Login Page**: http://localhost:3000
2. Use one of these credentials:
   - **Admin**: username: `admin`, password: `admin123`
   - **Operator H**: username: `opH`, password: `opH123`
   - **Operator M**: username: `opM`, password: `opM123`
   - **Operator L**: username: `opL`, password: `opL123`

3. **Dashboard**: After login, you'll see the Machine Table with a "Machine Simulator" button

### 6. Using the Simulator

1. Click the blue **"Machine Simulator"** button on the dashboard
2. Select a machine type (H, M, or L)
3. Click **"Run Simulation"**
4. View predictions:
   - **RUL**: How many hours until failure
   - **Failure Type**: What type of failure might occur
   - **Confidence**: How confident the prediction is
   - **Status**: Alert level (HEALTHY/WARNING/CRITICAL)
   - **Sensor Data**: Auto-generated random sensor readings

---

## Project Structure Overview

```
predictive-maintainance-1/
│
├── backend/                          # Express.js API Server
│   ├── auth.routes.js               # Login authentication
│   ├── prediction.routes.js         # ML prediction endpoints ✨ NEW
│   ├── server.js                    # Main server file (updated)
│   ├── .env.example                 # Environment config template
│   ├── package.json                 # Dependencies (updated)
│   └── node_modules/                # Installed packages
│
├── frontend/                         # React Dashboard
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── api.js                   # API calls (updated)
│   │   ├── App.js
│   │   ├── index.js
│   │   ├── App.css
│   │   └── components/
│   │       ├── Login.js             # Login form
│   │       ├── Login.css
│   │       ├── MachineTable.js      # Main dashboard (updated)
│   │       ├── MachineTable.css
│   │       └── MachineSimulator.js  # ✨ NEW - Simulator component
│   ├── package.json
│   └── node_modules/
│
├── ML_code/                         # Python ML Module
│   ├── rul_and_failure_type_prediction.ipynb  # Training notebook
│   ├── ml_model_inference.py        # ✨ NEW - Inference module
│   ├── requirements.txt              # ✨ NEW - Python dependencies
│   └── trained_models/              # (Models saved here after training)
│       ├── rul_regressor.pkl
│       ├── failure_classifier.pkl
│       ├── feature_scaler.pkl
│       ├── type_encoder.pkl
│       └── failure_encoder.pkl
│
├── README.md                        # ✨ NEW - Complete documentation
└── SETUP.md                         # This file
```

**✨ NEW** = Files created in this update

---

## Key Features Added

### 1. Machine Simulator Component (`MachineSimulator.js`)
- Beautiful Material-UI dialog interface
- Generates realistic sensor data
- Displays predictions with visual alerts
- Shows confidence scores
- Color-coded status indicators

### 2. Prediction API (`prediction.routes.js`)
- `POST /api/prediction/predict` - Predict based on sensor data
- `POST /api/prediction/simulate` - Run simulation with random data
- Mock ML predictions with realistic thresholds
- Supports all three machine types (H, M, L)

### 3. ML Inference Module (`ml_model_inference.py`)
- Load trained models from disk
- Generate realistic sensor data
- Make RUL and failure type predictions
- Configurable for different machine types
- Ready for integration with actual ML models

### 4. Updated Components
- **MachineTable.js**: Added simulator button and component integration
- **api.js**: New prediction and simulation API functions
- **server.js**: Integrated prediction routes

---

## Predictions Explained

### RUL (Remaining Useful Life)
- Measured in **hours**
- Calculated based on:
  - Temperature (air and process)
  - Vibration levels
  - Operational hours already used
  - Rotational speed

**Alert Levels**:
- 🟢 **HEALTHY**: RUL > 150 hours (Green)
- 🟡 **WARNING**: RUL 50-150 hours (Yellow)
- 🔴 **CRITICAL**: RUL < 50 hours (Red)

### Failure Types Detected

| Failure Type | Detection Trigger | Confidence |
|---|---|---|
| Bearing Wear | Vibration > 0.35 mm/s | 85-95% |
| Overheating | Process Temp > 320 K | 75-90% |
| Lubrication Degradation | High speed + high torque | 70-90% |
| Power Transmission Failure | Torque > 55 Nm | 65-90% |
| No Failure Detected | Normal conditions | < 20% |

---

## Troubleshooting

### "Cannot GET /api/machines"
**Problem**: Backend is not running  
**Solution**: 
```bash
cd backend
npm start
```

### "Failed to fetch" in browser
**Problem**: API URL is incorrect or backend crashed  
**Solution**:
1. Check backend console for errors
2. Verify backend is running on `http://localhost:5000`
3. Check browser console (F12) for detailed error

### Login not working
**Problem**: Wrong credentials or authentication error  
**Solution**:
1. Double-check username and password (case-sensitive)
2. Check console for JWT errors
3. Try admin account: `admin` / `admin123`

### Simulator button not showing
**Problem**: Frontend didn't load component properly  
**Solution**:
1. Clear browser cache (Ctrl+Shift+Del)
2. Hard refresh (Ctrl+F5)
3. Restart React development server

### "Models not loaded" error in ML module
**Problem**: Trained model files missing  
**Solution**: Models will be created after running the training notebook. For now, the system uses mock predictions.

---

## Next Steps

### To add real ML predictions:

1. **Train the models** using the Jupyter notebook:
   ```bash
   cd ML_code
   jupyter notebook rul_and_failure_type_prediction.ipynb
   ```

2. **Save the trained models**:
   - Create `trained_models/` directory
   - Models automatically save using joblib

3. **Integrate with backend** (optional):
   - Modify `prediction.routes.js` to call Python module
   - Use subprocess or Python API to invoke `ml_model_inference.py`

4. **Deploy to production**:
   - Set up MongoDB for data persistence
   - Configure environment variables
   - Use production-grade server (PM2, Docker, etc.)

---

## Technologies

| Layer | Technology | Version |
|-------|-----------|---------|
| Backend | Node.js + Express | 14+ / 5.0+ |
| Frontend | React | 18.2.0 |
| Database | MongoDB | 6.0+ (optional) |
| ML | Python + scikit-learn | 3.8+ |
| UI Components | Material-UI | 5.14+ |

---

## Production Deployment Checklist

- [ ] Set strong JWT_SECRET in `.env`
- [ ] Configure MongoDB with authentication
- [ ] Set NODE_ENV=production
- [ ] Build frontend: `npm run build`
- [ ] Use PM2 or similar for process management
- [ ] Set up HTTPS/SSL certificate
- [ ] Configure CORS properly
- [ ] Add rate limiting
- [ ] Set up monitoring and logging
- [ ] Train models with real data

---

## Support & Documentation

- **Full Documentation**: See `README.md`
- **API Endpoints**: See `README.md` - API Endpoints section
- **ML Models**: See `ML_code/rul_and_failure_type_prediction.ipynb`

---

**Setup Complete! 🎉**

Your predictive maintenance system is now ready to use. Start with the frontend login and try the Machine Simulator feature.
