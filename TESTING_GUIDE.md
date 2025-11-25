# Testing & Troubleshooting Guide

## Comprehensive Testing Guide for Predictive Maintenance System

---

## 1. Quick Health Check

Run this before starting the application:

### Check Node.js Installation
```powershell
node --version
npm --version
```
Should show versions (e.g., v18.x.x, 9.x.x)

### Check Python Installation (optional, for ML)
```powershell
python --version
pip --version
```
Should show Python 3.8+

---

## 2. Backend Testing

### Step 1: Start Backend
```powershell
cd backend
npm install
npm start
```

**Expected Output:**
```
Connected to MongoDB
Server running on http://localhost:5000
```

### Step 2: Test API Health
Open a new terminal:
```powershell
curl http://localhost:5000/health
```

**Expected Response:**
```json
{"status":"ok"}
```

### Step 3: Test Login Endpoint
```powershell
curl -X POST http://localhost:5000/api/auth/login `
  -H "Content-Type: application/json" `
  -d '{\"role\":\"admin\",\"password\":\"admin123\"}'
```

**Expected Response:**
```json
{
  "token": "eyJ0eXAiOiJKV1QiLCJhbGc...",
  "role": "admin",
  "access": "full"
}
```

### Step 4: Test Simulation Endpoint
```powershell
curl -X POST http://localhost:5000/api/prediction/simulate `
  -H "Content-Type: application/json" `
  -d '{\"machineType\":\"M\"}'
```

**Expected Response:**
```json
{
  "success": true,
  "rul": 245.67,
  "failure_type": "No Failure Detected",
  "confidence": 12.34,
  "alert_status": "HEALTHY",
  "sensor_data": {...},
  "machine_type": "M",
  "timestamp": "2024-11-19T10:30:00.000Z"
}
```

---

## 3. Frontend Testing

### Step 1: Start Frontend
```powershell
cd frontend
npm install
npm start
```

**Expected**: Browser opens to `http://localhost:3000` with login page

### Step 2: Test Login Flow

1. **Navigate to**: http://localhost:3000
2. **Enter credentials**:
   - Username: `admin`
   - Password: `admin123`
3. **Click**: Login button
4. **Expected**: Redirected to Machine Dashboard

### Step 3: Test Dashboard Display

1. **Verify**: "Predictive Maintenance Dashboard" header appears
2. **Verify**: "Machine Simulator" button is visible (blue with play icon)
3. **Verify**: Machine table displays (if machines exist)
4. **Verify**: Logout button (exit icon) is visible

### Step 4: Test Simulator Feature

1. **Click**: "Machine Simulator" button
2. **Dialog opens** with:
   - Title: "Machine Health Simulator"
   - Machine Type dropdown
   - "Run Simulation" button
3. **Select**: Machine Type 'M' (Medium)
4. **Click**: "Run Simulation"
5. **Results display**:
   - Alert badge (HEALTHY, WARNING, or CRITICAL)
   - RUL value in hours
   - Failure Type prediction
   - Confidence percentage
   - Sensor data table
   - Timestamp

### Step 5: Test Different Machine Types

Repeat simulator test with:
- Machine Type: **H** (High-Performance)
  - Expected RUL range: 100-500 hours
  - Higher speed values (2500-3500 rpm)

- Machine Type: **M** (Medium-Performance)
  - Expected RUL range: 150-600 hours
  - Medium speed values (1500-2500 rpm)

- Machine Type: **L** (Low-Performance)
  - Expected RUL range: 200-700 hours
  - Lower speed values (500-1500 rpm)

---

## 4. ML Module Testing

### Test Python Dependencies
```powershell
cd ML_code
pip install -r requirements.txt
```

### Run Demo Script
```powershell
python test_demo.py
```

**Expected Output**:
- Sensor data generation demos
- Simulation results for H, M, L machines
- JSON API response format
- All values reasonable and within expected ranges

### Test Inference Module
```python
python -c "
from ml_model_inference import run_simulation
result = run_simulation('M')
print(f'RUL: {result[\"rul\"]} hours')
print(f'Failure Type: {result[\"failure_type\"]}')
print(f'Alert: {result[\"alert_status\"]}')
"
```

---

## 5. Complete End-to-End Test Scenario

### Scenario: Daily Operations Check

1. **Start Backend**
   ```powershell
   cd backend
   npm start
   ```

2. **Start Frontend** (new terminal)
   ```powershell
   cd frontend
   npm start
   ```

3. **Login as Admin**
   - Username: `admin`
   - Password: `admin123`
   - ✅ Dashboard appears with all machines

4. **Login as Operator H** (new browser window)
   - Username: `opH`
   - Password: `opH123`
   - ✅ Dashboard shows only Type H machines

5. **Run 3 Simulations**
   - Type H: Expected RUL > 150 (HEALTHY)
   - Type M: Expected RUL varies
   - Type L: Expected RUL varies
   - ✅ All show different sensor ranges

6. **Verify Alert Thresholds**
   - Run multiple simulations for same type
   - Watch for HEALTHY, WARNING, CRITICAL status
   - Note confidence scores vary (realistic)

---

## 6. Common Issues & Solutions

### Issue 1: "Cannot connect to backend"

**Symptoms**:
- "Failed to fetch" error in browser console
- Cannot login

**Solutions**:
1. Check backend is running:
   ```powershell
   curl http://localhost:5000/health
   ```

2. If not running, start it:
   ```powershell
   cd backend
   npm start
   ```

3. Check port 5000 is not in use:
   ```powershell
   netstat -ano | findstr :5000
   ```
   If occupied, change PORT in .env file

### Issue 2: "Invalid credentials" on login

**Symptoms**:
- Login fails with all credentials
- Error: "Invalid role" or "Wrong password"

**Solutions**:
1. Check credentials (case-sensitive):
   - admin / admin123
   - opH / opH123
   - opM / opM123
   - opL / opL123

2. Verify auth.routes.js has correct credentials

3. Check browser console for detailed error

### Issue 3: "Simulator button not showing"

**Symptoms**:
- Dashboard loads but no "Machine Simulator" button
- Console shows component error

**Solutions**:
1. Clear browser cache:
   ```
   Ctrl + Shift + Delete
   ```

2. Hard refresh:
   ```
   Ctrl + Shift + R
   ```

3. Check MachineTable.js includes simulator import:
   ```javascript
   import MachineSimulator from './MachineSimulator';
   ```

4. Restart frontend:
   ```powershell
   # Stop: Ctrl+C
   npm start
   ```

### Issue 4: "Simulation returns error"

**Symptoms**:
- Simulator dialog shows error message
- "Error running simulation"

**Solutions**:
1. Check backend console for errors

2. Verify POST endpoint exists:
   ```powershell
   curl -X POST http://localhost:5000/api/prediction/simulate `
     -H "Content-Type: application/json" `
     -d '{\"machineType\":\"M\"}'
   ```

3. Check API response in browser DevTools (F12 > Network tab)

### Issue 5: "Predictions always show same values"

**Symptoms**:
- RUL is always the same
- Sensor data is identical

**Solutions**:
1. This is normal for mock predictions if models aren't loaded
2. Values will vary once you train and save real ML models
3. Check for random data generation in prediction.routes.js

### Issue 6: ML Module import errors

**Symptoms**:
- Python test_demo.py fails
- "ModuleNotFoundError"

**Solutions**:
1. Install requirements:
   ```powershell
   pip install -r requirements.txt
   ```

2. Verify installation:
   ```powershell
   pip list | findstr scikit
   pip list | findstr tensorflow
   ```

3. Check Python path:
   ```powershell
   python --version
   python -c "import sklearn; print(sklearn.__version__)"
   ```

---

## 7. Performance Testing

### Test Simulator Response Time
```powershell
# Measure API response time
curl -w "@curl-format.txt" -o /dev/null -s `
  http://localhost:5000/api/prediction/simulate?machineType=M
```

Expected: < 200ms for API response

### Test Multiple Simulations
Run 10 simulations rapidly and verify:
- All complete successfully
- No server errors in console
- Response times consistent
- Results vary (randomness working)

### Browser Console Performance
1. Open DevTools (F12)
2. Go to Performance tab
3. Click Simulator button
4. Record performance
5. Verify no memory leaks
6. Check CPU usage is reasonable

---

## 8. Security Testing

### Test Authentication Token
1. Login as admin
2. Open DevTools (F12) > Application > Local Storage
3. Verify `token` is stored
4. Copy token value
5. Try API call with expired/fake token:
   ```powershell
   curl -H "Authorization: Bearer FAKE_TOKEN" `
     http://localhost:5000/api/machines
   ```
   Should be rejected

### Test Role-Based Access
1. Login as opH
2. Try accessing machines endpoint
3. Verify only Type H machines returned
4. Repeat for opM and opL

### Test Password Security
1. Try weak login attempts:
   - Wrong password
   - Empty password
   - Wrong role
2. All should be rejected

---

## 9. Data Validation Testing

### Test Sensor Data Ranges

```powershell
# Test with invalid sensor data
curl -X POST http://localhost:5000/api/prediction/predict `
  -H "Content-Type: application/json" `
  -d '{
    "Air temperature [K]": 200,
    "Process temperature [K]": 200,
    "Rotational speed [rpm]": 10000,
    "Torque [Nm]": -50,
    "Vibration Levels": 1.5,
    "Operational Hours": 10000,
    "Type": "X"
  }'
```

Should still return prediction (system is tolerant) but log warning

### Test Missing Fields
```powershell
curl -X POST http://localhost:5000/api/prediction/predict `
  -H "Content-Type: application/json" `
  -d '{"Type": "M"}'
```

Should handle gracefully or return error

---

## 10. Automated Testing Checklist

- [ ] Backend health check passes
- [ ] All 4 login credentials work
- [ ] Admin sees all machines
- [ ] opH sees only Type H
- [ ] opM sees only Type M
- [ ] opL sees only Type L
- [ ] Simulator button appears
- [ ] Machine Type H generates appropriate sensor ranges
- [ ] Machine Type M generates appropriate sensor ranges
- [ ] Machine Type L generates appropriate sensor ranges
- [ ] RUL values are reasonable (> 10, < 1000)
- [ ] Failure type is one of 5 expected types
- [ ] Confidence is 0-100
- [ ] Alert status is HEALTHY/WARNING/CRITICAL
- [ ] Logout works
- [ ] No console errors
- [ ] No network errors
- [ ] Simulator closes properly
- [ ] Multiple simulations work
- [ ] Timestamp is recorded
- [ ] JSON response format is correct

---

## 11. Production Readiness Checklist

- [ ] Environment variables configured (.env file)
- [ ] JWT_SECRET is strong and secret
- [ ] MONGODB_URI points to production DB
- [ ] CORS_ORIGIN is set to frontend domain
- [ ] NODE_ENV=production
- [ ] Frontend built (`npm run build`)
- [ ] Backend dependencies tested
- [ ] ML models trained with real data
- [ ] Error handling in place
- [ ] Logging configured
- [ ] Rate limiting enabled
- [ ] HTTPS configured
- [ ] Backup strategy in place
- [ ] Monitoring set up
- [ ] Documentation updated

---

## 12. Emergency Troubleshooting

### Everything broken - Full reset
```powershell
# Backend
cd backend
rm node_modules package-lock.json
npm install
npm start

# Frontend (new terminal)
cd frontend
rm node_modules package-lock.json
npm install
npm start
```

### Port conflicts
```powershell
# Find process on port 5000
netstat -ano | findstr :5000

# Kill process (replace PID with actual ID)
taskkill /PID 12345 /F
```

### Clear browser data
- Press Ctrl + Shift + Delete
- Select "All time"
- Check: Cookies, Cached images, Local Storage
- Click "Clear data"
- Restart browser

### Check system logs
```powershell
# Backend logs
Get-EventLog -LogName Application -Source "Node.js" -Newest 10

# Check network connectivity
Test-NetConnection -ComputerName localhost -Port 5000
```

---

**Test Coverage**: Complete ✅  
**Last Updated**: November 2024  
**Status**: Ready for deployment
