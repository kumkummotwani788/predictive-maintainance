const express = require('express');
const axios = require('axios');
const router = express.Router();

// Python ML API Server URL
const ML_API_URL = process.env.ML_API_URL || 'http://localhost:5001/api';
const USE_ML_API = process.env.USE_ML_API !== 'false'; // Default to true

// Fallback to mock predictions if ML API is unavailable
function useMockPredictions(req, res, isFallback = false) {
  if (isFallback) {
    console.warn('ML API unavailable, falling back to mock predictions');
  }
}

/**
 * Predict RUL and Failure Type based on sensor readings
 * POST /api/prediction/predict
 */
router.post('/predict', async (req, res) => {
  try {
    const sensorData = req.body;
    
    // Validate sensor data
    if (!sensorData || typeof sensorData !== 'object') {
      return res.status(400).json({ 
        error: 'Invalid sensor data provided',
        success: false 
      });
    }

    // Try to use Python ML API
    if (USE_ML_API) {
      try {
        const response = await axios.post(`${ML_API_URL}/predict`, 
          { sensor_data: sensorData },
          { timeout: 5000 }
        );
        
        return res.json({
          ...response.data,
          timestamp: new Date().toISOString(),
          source: 'ml_api'
        });
      } catch (mlError) {
        console.warn('ML API error, falling back to mock predictions:', mlError.message);
      }
    }

    // Fallback: Mock prediction logic based on sensor thresholds
    const predictions = generatePredictions(sensorData);
    
    res.json({
      ...predictions,
      success: true,
      timestamp: new Date().toISOString(),
      source: 'mock'
    });

  } catch (error) {
    console.error('Prediction error:', error);
    res.status(500).json({ 
      error: 'Error generating predictions',
      success: false 
    });
  }
});

/**
 * Run a simulation with random sensor data
 * POST /api/prediction/simulate
 */
router.post('/simulate', async (req, res) => {
  try {
    const { machineType = 'M' } = req.body;

    // Validate machine type
    if (!['H', 'M', 'L'].includes(machineType)) {
      return res.status(400).json({ 
        error: 'Invalid machine type. Must be H, M, or L',
        success: false 
      });
    }

    // Try to use Python ML API
    if (USE_ML_API) {
      try {
        const response = await axios.post(`${ML_API_URL}/simulate`,
          { machineType },
          { timeout: 5000 }
        );
        
        return res.json({
          ...response.data,
          timestamp: new Date().toISOString(),
          source: 'ml_api'
        });
      } catch (mlError) {
        console.warn('ML API error, falling back to mock predictions:', mlError.message);
      }
    }

    // Fallback: Generate random sensor data based on machine type
    const sensorData = generateRandomSensorData(machineType);
    
    // Generate predictions based on simulated data
    const predictions = generatePredictions(sensorData);
    
    res.json({
      ...predictions,
      sensor_data: sensorData,
      success: true,
      timestamp: new Date().toISOString(),
      machine_type: machineType,
      source: 'mock'
    });

  } catch (error) {
    console.error('Simulation error:', error);
    res.status(500).json({ 
      error: 'Error running simulation',
      success: false 
    });
  }
});

/**
 * Generate realistic random sensor data based on machine type
 */
function generateRandomSensorData(machineType) {
  let airTemp, processTemp, rotationalSpeed, torque, vibration, operationalHours;

  if (machineType === 'H') { // High-performance
    airTemp = 295 + Math.random() * 15;
    processTemp = 305 + Math.random() * 15;
    rotationalSpeed = 2500 + Math.random() * 1000;
    torque = 40 + Math.random() * 25;
    vibration = 0.1 + Math.random() * 0.2;
    operationalHours = 500 + Math.random() * 1500;
  } else if (machineType === 'M') { // Medium-performance
    airTemp = 298 + Math.random() * 14;
    processTemp = 308 + Math.random() * 15;
    rotationalSpeed = 1500 + Math.random() * 1000;
    torque = 25 + Math.random() * 20;
    vibration = 0.15 + Math.random() * 0.2;
    operationalHours = 300 + Math.random() * 1200;
  } else { // Low-performance
    airTemp = 300 + Math.random() * 15;
    processTemp = 310 + Math.random() * 15;
    rotationalSpeed = 500 + Math.random() * 1000;
    torque = 10 + Math.random() * 20;
    vibration = 0.2 + Math.random() * 0.2;
    operationalHours = 100 + Math.random() * 900;
  }

  return {
    'Air temperature [K]': parseFloat(airTemp.toFixed(2)),
    'Process temperature [K]': parseFloat(processTemp.toFixed(2)),
    'Rotational speed [rpm]': parseFloat(rotationalSpeed.toFixed(2)),
    'Torque [Nm]': parseFloat(torque.toFixed(2)),
    'Vibration Levels': parseFloat(vibration.toFixed(3)),
    'Operational Hours': parseFloat(operationalHours.toFixed(2)),
    'Type': machineType
  };
}

/**
 * Generate predictions based on sensor data
 * This is a mock implementation using threshold-based logic
 */
function generatePredictions(sensorData) {
  // Extract sensor values
  const airTemp = sensorData['Air temperature [K]'] || 0;
  const processTemp = sensorData['Process temperature [K]'] || 0;
  const rotSpeed = sensorData['Rotational speed [rpm]'] || 0;
  const torque = sensorData['Torque [Nm]'] || 0;
  const vibration = sensorData['Vibration Levels'] || 0;
  const opHours = sensorData['Operational Hours'] || 0;

  // Mock RUL calculation (in hours until failure)
  // Factors: temperature, vibration, operational hours, and rotational speed
  const tempFactor = (airTemp + processTemp) / 2 > 315 ? 0.7 : 1.0;
  const vibrationFactor = vibration > 0.3 ? 0.6 : 1.0;
  const hoursFactor = 1.0 - (opHours / 5000);
  const speedFactor = rotSpeed > 3000 ? 0.8 : 1.0;

  const baseRul = 500;
  const predictedRul = Math.max(10, baseRul * tempFactor * vibrationFactor * hoursFactor * speedFactor);

  // Mock failure type determination
  let failureType = 'No Failure Detected';
  let failureConfidence = 5;

  if (vibration > 0.35) {
    failureType = 'Bearing Wear';
    failureConfidence = 85 + Math.random() * 10;
  } else if (processTemp > 320) {
    failureType = 'Overheating';
    failureConfidence = 75 + Math.random() * 15;
  } else if (rotSpeed > 3500 && torque > 50) {
    failureType = 'Lubrication Degradation';
    failureConfidence = 70 + Math.random() * 20;
  } else if (torque > 55) {
    failureType = 'Power Transmission Failure';
    failureConfidence = 65 + Math.random() * 25;
  } else {
    failureConfidence = Math.random() * 20;
  }

  // Determine alert status
  let alertStatus = 'HEALTHY';
  if (predictedRul < 50) {
    alertStatus = 'CRITICAL';
  } else if (predictedRul < 150) {
    alertStatus = 'WARNING';
  }

  return {
    rul: parseFloat(predictedRul.toFixed(2)),
    failure_type: failureType,
    confidence: parseFloat(failureConfidence.toFixed(2)),
    alert_status: alertStatus,
    sensor_data: sensorData
  };
}

module.exports = router;
